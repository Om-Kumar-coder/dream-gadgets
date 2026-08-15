import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BuybackLead } from './entities/buyback-lead.entity';
import { BuybackPhoto } from './entities/buyback-photo.entity';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../common/redis/redis.service';

export interface CreateBuybackLeadDto {
  brand: string;
  modelName: string;
  phone: string;
  deviceType?: string;
  condition?: string;
  screenCondition?: string;
  bodyCondition?: string;
  batteryHealth?: string;
  functionalIssues?: string;
  estimatedPrice?: number | null;
}

export interface EstimatePriceParams {
  brand: string;
  modelName: string;
  condition?: string;
  screenCondition?: string;
  bodyCondition?: string;
  batteryHealth?: string;
  functionalIssues?: string;
}

export interface BuybackLeadQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

@Injectable()
export class BuybackService {
  private readonly logger = new Logger(BuybackService.name);
  private readonly notifyEmail: string;
  private readonly notifyPhone: string;
  private readonly adminUrl: string;

  constructor(
    @InjectRepository(BuybackLead)
    private leadRepo: Repository<BuybackLead>,
    @InjectRepository(BuybackPhoto)
    private photoRepo: Repository<BuybackPhoto>,
    private notificationService: NotificationService,
    private configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {
    this.notifyEmail = this.configService.get<string>('NOTIFICATION_EMAIL') ?? 'owner@dreamgadgets.in';
    this.notifyPhone = this.configService.get<string>('NOTIFICATION_PHONE') ?? '';
    const webUrl = this.configService.get<string>('ADMIN_URL') ?? 'http://localhost:3002';
    this.adminUrl = `${webUrl}/buyback`;
  }

  async create(dto: CreateBuybackLeadDto): Promise<BuybackLead> {
    const lead = this.leadRepo.create({
      brand: dto.brand,
      modelName: dto.modelName,
      phone: dto.phone,
      deviceType: dto.deviceType ?? 'mobile',
      condition: dto.condition ?? null,
      screenCondition: dto.screenCondition ?? null,
      bodyCondition: dto.bodyCondition ?? null,
      batteryHealth: dto.batteryHealth ?? null,
      functionalIssues: dto.functionalIssues ?? null,
      estimatedPrice: dto.estimatedPrice ?? null,
    });

    const saved = await this.leadRepo.save(lead);
    this.logger.log(`New buyback lead created: ${saved.id} — ${dto.brand} ${dto.modelName} (${dto.phone})`);

    // ── Notify shop owner(s) ──────────────────────────────────────────────
    this.sendNotifications(saved).catch((err) =>
      this.logger.warn(`Failed to send buyback notification: ${err?.message}`),
    );

    return saved;
  }

  // ─── Price estimation ──────────────────────────────────────────────────────

  /** Fallback condition multipliers when a model has no per-condition guide row. */
  private static readonly CONDITION_MULTIPLIERS: Record<string, number> = {
    sealed_pack: 0.95,
    open_box: 0.9,
    super_mint: 0.85,
    mint: 0.75,
    good: 0.6,
    fair: 0.4,
    broken: 0.2,
  };

  private static readonly BATTERY_FACTORS: Record<string, number> = {
    '90-100%': 1,
    '70-89%': 0.92,
    '50-69%': 0.8,
    'Below 50%': 0.65,
  };

  private static readonly SCREEN_FACTORS: Record<string, number> = {
    perfect: 1,
    'minor scratches': 0.95,
    'deep scratches': 0.85,
    cracked: 0.6,
  };

  private static readonly BODY_FACTORS: Record<string, number> = {
    'like new': 1,
    'minor scratches': 0.95,
    'visible dents': 0.85,
    'heavy damage': 0.7,
  };

  private static factorFor(map: Record<string, number>, value?: string | null): number {
    if (!value) return 1;
    const key = value.trim().toLowerCase();
    return map[key] ?? 1;
  }

  /**
   * Estimate a buyback price server-side.
   * Tier 1: exchange_price_guide (curated base prices per model + condition).
   * Tier 2: median of recent sale prices for the model.
   * Adjustments: screen / body / battery health / functional issues.
   */
  async estimatePrice(params: EstimatePriceParams): Promise<any> {
    const modelName = params.modelName?.trim();
    const brand = params.brand?.trim();
    const condition = (params.condition || 'good').toLowerCase();

    if (!modelName) {
      throw new NotFoundException({ code: 'MODEL_REQUIRED', message: 'Model name is required' });
    }

    // Cache key covers all inputs that affect the estimate
    const cacheKey = `buyback:estimate:${JSON.stringify({
      modelName,
      condition,
      screen: params.screenCondition ?? '',
      body: params.bodyCondition ?? '',
      battery: params.batteryHealth ?? '',
      issues: params.functionalIssues ?? '',
    })}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Cache unavailable — fall through
    }

    // 1. Resolve model against the catalog (exact name first, slug fallback —
    //    production catalog names may include storage/variant suffixes)
    let modelRow: { id: string; name: string; brand: string } | null = null;
    try {
      const rows = await this.dataSource.query(
        `SELECT m.id, m.name, b.name AS brand
         FROM models m
         JOIN brands b ON b.id = m.brand_id
         WHERE LOWER(m.name) = LOWER($1)
         LIMIT 1`,
        [modelName],
      );
      modelRow = rows?.[0] ?? null;
      if (!modelRow) {
        const slug = modelName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (slug) {
          const slugRows = await this.dataSource.query(
            `SELECT m.id, m.name, b.name AS brand
             FROM models m
             JOIN brands b ON b.id = m.brand_id
             WHERE m.slug = $1
             LIMIT 1`,
            [slug],
          );
          modelRow = slugRows?.[0] ?? null;
        }
      }
    } catch {
      modelRow = null;
    }

    // 2. Tier 1: price guide (exact condition row + sealed reference row)
    let basePrice: number | null = null;
    let baseValue: number | null = null;
    let dataSource: 'price_guide' | 'historical_sales' = 'price_guide';
    let sampleCount = 0;

    if (modelRow) {
      try {
        const guideRows = await this.dataSource.query(
          `SELECT condition, base_price
           FROM exchange_price_guide
           WHERE model_id = $1 AND condition IN ($2, 'sealed_pack')`,
          [modelRow.id, condition],
        );
        const byCondition = new Map<string, number>();
        for (const r of guideRows ?? []) {
          byCondition.set(String(r.condition).toLowerCase(), parseFloat(r.base_price));
        }
        const sealedPrice = byCondition.get('sealed_pack');
        if (sealedPrice != null) baseValue = sealedPrice;
        const conditionPrice = byCondition.get(condition);
        if (conditionPrice != null) {
          basePrice = conditionPrice;
        } else if (sealedPrice != null) {
          basePrice = sealedPrice * (BuybackService.CONDITION_MULTIPLIERS[condition] ?? 0.6);
        }
      } catch {
        basePrice = null;
      }
    }

    // 3. Tier 2: median of historical sale prices
    if (basePrice == null && modelRow) {
      try {
        const hist = await this.dataSource.query(
          `SELECT
             PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY si.unit_price) AS median,
             COUNT(*)::int AS count
           FROM sale_items si
           JOIN inventory_items ii ON ii.id = si.item_id
           WHERE ii.model_id = $1 AND si.unit_price > 0`,
          [modelRow.id],
        );
        const row = hist?.[0];
        if (row?.median != null) {
          basePrice = parseFloat(row.median);
          baseValue = baseValue ?? basePrice;
          sampleCount = parseInt(row.count, 10) || 0;
          dataSource = 'historical_sales';
        }
      } catch {
        basePrice = null;
      }
    }

    if (basePrice == null) {
      const noData = {
        estimatedPrice: null,
        dataSource: 'no_data',
        confidence: 'none',
        modelName,
        brand: brand ?? modelRow?.brand ?? '',
      };
      try {
        await this.redisService.set(cacheKey, JSON.stringify(noData), { EX: 300 });
      } catch {
        // Non-critical
      }
      return noData;
    }

    // 4. Apply screen / body / battery / functional adjustments
    const adjustments = {
      screen: BuybackService.factorFor(BuybackService.SCREEN_FACTORS, params.screenCondition),
      body: BuybackService.factorFor(BuybackService.BODY_FACTORS, params.bodyCondition),
      battery: BuybackService.factorFor(BuybackService.BATTERY_FACTORS, params.batteryHealth),
      functional: params.functionalIssues?.trim() ? 0.9 : 1,
    };

    const adjusted =
      basePrice * adjustments.screen * adjustments.body * adjustments.battery * adjustments.functional;
    const estimatedPrice = Math.round(adjusted / 50) * 50;

    const conditionMultiplier =
      baseValue && baseValue > 0 ? Math.round((basePrice / baseValue) * 100) / 100 : 1;

    const confidence =
      dataSource === 'price_guide' ? 'high' : sampleCount >= 3 ? 'medium' : 'low';

    const estimate = {
      estimatedPrice,
      modelId: modelRow?.id ?? null,
      modelName: modelRow?.name ?? modelName,
      brand: modelRow?.brand ?? brand ?? '',
      condition,
      baseValue: baseValue != null ? Math.round(baseValue) : null,
      basePrice: Math.round(basePrice),
      conditionMultiplier,
      adjustments,
      dataSource,
      confidence,
      sampleCount,
    };

    try {
      await this.redisService.set(cacheKey, JSON.stringify(estimate), { EX: 300 });
    } catch {
      // Non-critical
    }

    return estimate;
  }

  private async sendNotifications(lead: BuybackLead): Promise<void> {
    const vars = {
      brand: lead.brand,
      model: lead.modelName,
      phone: lead.phone,
      date: lead.createdAt?.toLocaleString('en-IN') ?? new Date().toLocaleString('en-IN'),
      adminUrl: this.adminUrl,
    };

    // Email notification
    if (this.notifyEmail) {
      await this.notificationService.sendEmail({
        to: this.notifyEmail,
        type: 'buyback_lead',
        templateKey: 'buyback_lead',
        templateVars: vars,
        metadata: { leadId: lead.id, brand: lead.brand, model: lead.modelName, phone: lead.phone },
      });
    }

    // SMS notification (if phone is configured)
    if (this.notifyPhone) {
      await this.notificationService.sendSms({
        to: this.notifyPhone,
        type: 'buyback_lead',
        body: `New Buyback: ${lead.brand} ${lead.modelName} — ${lead.phone}`,
        metadata: { leadId: lead.id, brand: lead.brand, model: lead.modelName, phone: lead.phone },
      });
    }
  }

  async findAll(query: BuybackLeadQuery) {
    const { page = 1, limit = 20, status, search } = query;
    const offset = (page - 1) * limit;

    const qb = this.leadRepo
      .createQueryBuilder('lead')
      .orderBy('lead.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) qb.andWhere('lead.status = :status', { status });
    if (search) {
      qb.andWhere(
        '(lead.brand ILIKE :search OR lead.modelName ILIKE :search OR lead.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { data: items, total, page, limit };
  }

  async getStats(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    byScreenCondition: { value: string; count: number }[];
    byBodyCondition: { value: string; count: number }[];
    byBatteryHealth: { value: string; count: number }[];
    weeklyTrend: { date: string; count: number }[];
  }> {
    const total = await this.leadRepo.count();

    const byStatus = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const byScreenCondition = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.screenCondition', 'value')
      .addSelect('COUNT(*)', 'count')
      .where('lead.screenCondition IS NOT NULL')
      .groupBy('lead.screenCondition')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const byBodyCondition = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.bodyCondition', 'value')
      .addSelect('COUNT(*)', 'count')
      .where('lead.bodyCondition IS NOT NULL')
      .groupBy('lead.bodyCondition')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const byBatteryHealth = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.batteryHealth', 'value')
      .addSelect('COUNT(*)', 'count')
      .where('lead.batteryHealth IS NOT NULL')
      .groupBy('lead.batteryHealth')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const weeklyTrend = await this.leadRepo
      .createQueryBuilder('lead')
      .select("TO_CHAR(lead.createdAt, 'Dy')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('lead.createdAt >= NOW() - INTERVAL \'7 days\'')
      .groupBy('date')
      .addGroupBy("DATE_TRUNC('day', lead.createdAt)")
      .orderBy("DATE_TRUNC('day', lead.createdAt)")
      .getRawMany();

    return { total, byStatus, byScreenCondition, byBodyCondition, byBatteryHealth, weeklyTrend };
  }

  // ─── Photo upload ───────────────────────────────────────────────────────────

  async addPhoto(leadId: string, url: string, sortOrder = 0): Promise<BuybackPhoto> {
    const lead = await this.leadRepo.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Buyback lead ${leadId} not found`);

    const photo = this.photoRepo.create({ leadId, url, sortOrder });
    return this.photoRepo.save(photo);
  }

  async getPhotos(leadId: string): Promise<BuybackPhoto[]> {
    return this.photoRepo.find({
      where: { leadId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<BuybackLead | null> {
    return this.leadRepo.findOne({ where: { id }, relations: ['photos'] });
  }

  async updateStatus(id: string, status: string, notes?: string): Promise<BuybackLead | null> {
    await this.leadRepo.update(id, { status, ...(notes !== undefined ? { notes } : {}) });
    return this.findById(id);
  }
}
