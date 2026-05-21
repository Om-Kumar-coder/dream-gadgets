import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BuybackLead } from './entities/buyback-lead.entity';
import { NotificationService } from '../notification/notification.service';

export interface CreateBuybackLeadDto {
  brand: string;
  modelName: string;
  phone: string;
  deviceType?: string;
}

export interface BuybackLeadQuery {
  page?: number;
  limit?: number;
  status?: string;
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
    const { page = 1, limit = 20, status } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.leadRepo.find({
        where,
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      }),
      this.leadRepo.count({ where }),
    ]);

    return { data: items, total, page, limit };
  }

  async findById(id: string): Promise<BuybackLead | null> {
    return this.leadRepo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: string, notes?: string): Promise<BuybackLead | null> {
    await this.leadRepo.update(id, { status, ...(notes !== undefined ? { notes } : {}) });
    return this.findById(id);
  }
}
