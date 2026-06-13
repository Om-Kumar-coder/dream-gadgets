import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BuybackLead } from './entities/buyback-lead.entity';
import { BuybackPhoto } from './entities/buyback-photo.entity';
import { NotificationService } from '../notification/notification.service';

export interface CreateBuybackLeadDto {
  brand: string;
  modelName: string;
  phone: string;
  deviceType?: string;
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
    private photoRepo: Repository<BuybackPhoto>,
    private notificationService: NotificationService,
    private configService: ConfigService,
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
      screenCondition: dto.screenCondition ?? null,
      bodyCondition: dto.bodyCondition ?? null,
      batteryHealth: dto.batteryHealth ?? null,
      functionalIssues: dto.functionalIssues ?? null,
    });

    const saved = await this.leadRepo.save(lead);
    this.logger.log(`New buyback lead created: ${saved.id} — ${dto.brand} ${dto.modelName} (${dto.phone})`);

    // ── Notify shop owner(s) ──────────────────────────────────────────────
    this.sendNotifications(saved).catch((err) =>
      this.logger.warn(`Failed to send buyback notification: ${err?.message}`),
    );

    return saved;
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
