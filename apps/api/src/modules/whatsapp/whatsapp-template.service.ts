import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappTemplate } from './entities/whatsapp-template.entity';
import { WhatsappCampaign } from './entities/whatsapp-campaign.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WhatsappTemplateService {
  private readonly logger = new Logger(WhatsappTemplateService.name);

  constructor(
    @InjectRepository(WhatsappTemplate)
    private templateRepo: Repository<WhatsappTemplate>,
    @InjectRepository(WhatsappCampaign)
    private campaignRepo: Repository<WhatsappCampaign>,
    private notificationService: NotificationService,
  ) {}

  // ─── Templates ──────────────────────────────────────────────────────────────

  async createTemplate(dto: Partial<WhatsappTemplate>): Promise<WhatsappTemplate> {
    const template = this.templateRepo.create(dto);
    return this.templateRepo.save(template);
  }

  async getTemplates(query: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<{ data: WhatsappTemplate[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, category, status, search } = query;
    const qb = this.templateRepo
      .createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) qb.andWhere('t.category = :category', { category });
    if (status) qb.andWhere('t.status = :status', { status });
    if (search) qb.andWhere('(t.name ILIKE :search OR t.body ILIKE :search)', { search: `%${search}%` });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getTemplateById(id: string): Promise<WhatsappTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return template;
  }

  async updateTemplate(id: string, dto: Partial<WhatsappTemplate>): Promise<WhatsappTemplate> {
    const template = await this.getTemplateById(id);
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.getTemplateById(id);
    await this.templateRepo.remove(template);
  }

  // ─── Campaigns ──────────────────────────────────────────────────────────────

  async createCampaign(dto: Partial<WhatsappCampaign>): Promise<WhatsappCampaign> {
    const campaign = this.campaignRepo.create(dto);
    return this.campaignRepo.save(campaign);
  }

  async getCampaigns(query: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<{ data: WhatsappCampaign[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, type, search } = query;
    const qb = this.campaignRepo
      .createQueryBuilder('c')
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('c.status = :status', { status });
    if (type) qb.andWhere('c.type = :type', { type });
    if (search) qb.andWhere('c.name ILIKE :search', { search: `%${search}%` });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getCampaignById(id: string): Promise<WhatsappCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  async updateCampaign(id: string, dto: Partial<WhatsappCampaign>): Promise<WhatsappCampaign> {
    const campaign = await this.getCampaignById(id);
    Object.assign(campaign, dto);
    return this.campaignRepo.save(campaign);
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.getCampaignById(id);
    await this.campaignRepo.remove(campaign);
  }

  async launchCampaign(id: string): Promise<WhatsappCampaign> {
    const campaign = await this.getCampaignById(id);
    campaign.status = 'sending';
    campaign.sentAt = new Date();
    return this.campaignRepo.save(campaign);
  }

  async getCampaignStats(id: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    clickRate: number;
    conversionRate: number;
  }> {
    const campaign = await this.getCampaignById(id);
    const clickRate = campaign.sentCount > 0 ? (campaign.clickCount / campaign.sentCount) * 100 : 0;
    const conversionRate = campaign.sentCount > 0 ? (campaign.conversionCount / campaign.sentCount) * 100 : 0;
    return {
      total: campaign.totalRecipients,
      sent: campaign.sentCount,
      delivered: campaign.deliveredCount,
      read: campaign.readCount,
      failed: campaign.failedCount,
      clickRate: Math.round(clickRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}
