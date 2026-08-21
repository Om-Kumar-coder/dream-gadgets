import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import { Notification } from './entities/notification.entity';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { EventService } from '../../common/events/event.service';
import { User } from '../auth/entities/user.entity';
import { getTemplate } from './templates';
import type { TemplateDef } from './templates';

export interface NotificationPayload {
  userId?: string;
  clientId?: string;
  type: string;
  subject?: string;
  body?: string;
  templateKey?: string;
  templateVars?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface DeliveryResult {
  success: boolean;
  providerMessageId: string | null;
  status: 'sent' | 'failed';
  error?: string;
}

const MAX_RETRY_ATTEMPTS = 5;

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
    @InjectQueue('notification')
    private notificationQueue: Queue,
    private emailService: EmailService,
    private smsService: SmsService,
    private whatsAppService: WhatsAppService,
    private eventService: EventService,
  ) {}

  // ─── Template resolution ──────────────────────────────────────────────────────

  async resolveTemplate(
    templateKey: string,
    vars: Record<string, string> = {},
  ): Promise<{ subject: string; body: string }> {
    // Load from settings table by key (if available)
    try {
      const settingsRepo = (this.notificationRepo.manager as any).getRepository
        ? this.notificationRepo.manager.getRepository('settings' as any)
        : null;

      if (settingsRepo) {
        const setting = await settingsRepo.findOne({ where: { key: `template:${templateKey}` } }).catch(() => null);
        if (setting?.value) {
          const tpl = setting.value as { subject?: string; body?: string };
          return {
            subject: this.substituteVars(tpl.subject ?? '', vars),
            body: this.substituteVars(tpl.body ?? '', vars),
          };
        }
      }
    } catch {
      // fallback to default
    }

    // Load from JSON template files (see templates/*.json)
    const tpl = getTemplate(templateKey);
    if (tpl) {
      return {
        subject: this.substituteVars(tpl.subject, vars),
        body: this.substituteVars(tpl.body, vars),
      };
    }

    // Empty fallback for unknown template keys
    return { subject: templateKey, body: '' };
  }

  private substituteVars(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
  }

  // ─── Channel-appropriate content formatting ───────────────────────────────────

  private formatForChannel(
    channel: 'email' | 'sms' | 'whatsapp' | 'in_app',
    subject: string,
    htmlBody: string,
    templateKey?: string,
    vars?: Record<string, string>,
  ): { subject: string; body: string } {
    if (channel === 'sms' && templateKey) {
      // Use SMS-specific template from JSON files
      const tpl = getTemplate(templateKey);
      const shortBody = tpl?.smsBody ?? htmlBody.replace(/<[^>]*>/g, '');
      const finalBody = vars ? this.substituteVars(shortBody, vars) : shortBody;
      return { subject: '', body: finalBody.substring(0, 160) }; // SMS: 160 char limit
    }

    if (channel === 'whatsapp') {
      // WhatsApp: plain text, no HTML
      const plainBody = htmlBody.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      return { subject: '', body: plainBody.substring(0, 4096) }; // WhatsApp limit
    }

    // Email: rich HTML
    return { subject, body: htmlBody };
  }

  // ─── 14.2 Email ───────────────────────────────────────────────────────────────

  async sendEmail(payload: NotificationPayload & { to: string }): Promise<Notification> {
    // Respect user opt-out
    if (!(await this.isChannelEnabled(payload.userId, 'email'))) {
      this.logger.log(`[Email] Skipped — user ${payload.userId} has email disabled`);
      return this.createRecord({ ...payload, channel: 'email', status: 'skipped', target: payload.to });
    }

    const { subject, body } = await this.buildContent(payload);
    const { body: formatted } = this.formatForChannel('email', subject, body, payload.templateKey, payload.templateVars);
    const notification = await this.createRecord({ ...payload, channel: 'email', subject, body: formatted, target: payload.to });

    await this.enqueueDelivery('email', notification.id, payload.to, subject, formatted);

    // Emit realtime event
    this.emitNotificationCreated(notification);

    return notification;
  }

  // ─── 14.3 WhatsApp ────────────────────────────────────────────────────────────

  async sendWhatsApp(payload: NotificationPayload & { to: string }): Promise<Notification> {
    // Respect user opt-out
    if (!(await this.isChannelEnabled(payload.userId, 'whatsapp'))) {
      this.logger.log(`[WhatsApp] Skipped — user ${payload.userId} has whatsapp disabled`);
      return this.createRecord({ ...payload, channel: 'whatsapp', status: 'skipped', target: payload.to });
    }

    const { subject, body } = await this.buildContent(payload);
    const { body: formatted } = this.formatForChannel('whatsapp', subject, body, payload.templateKey, payload.templateVars);
    const notification = await this.createRecord({ ...payload, channel: 'whatsapp', subject, body: formatted, target: payload.to });

    await this.enqueueDelivery('whatsapp', notification.id, payload.to, subject, formatted);

    // Emit realtime event
    this.emitNotificationCreated(notification);

    return notification;
  }

  // ─── 14.4 SMS ─────────────────────────────────────────────────────────────────

  async sendSms(payload: NotificationPayload & { to: string }): Promise<Notification> {
    // Respect user opt-out
    if (!(await this.isChannelEnabled(payload.userId, 'sms'))) {
      this.logger.log(`[SMS] Skipped — user ${payload.userId} has sms disabled`);
      return this.createRecord({ ...payload, channel: 'sms', status: 'skipped', target: payload.to });
    }

    const { body } = await this.buildContent(payload);
    const { body: formatted } = this.formatForChannel('sms', '', body, payload.templateKey, payload.templateVars);
    const notification = await this.createRecord({ ...payload, channel: 'sms', body: formatted, target: payload.to });

    await this.enqueueDelivery('sms', notification.id, payload.to, undefined, formatted);

    // Emit realtime event
    this.emitNotificationCreated(notification);

    return notification;
  }

  // ─── 14.6 In-app (Socket.io + EventService) ─────────────────────────────────

  async sendInApp(payload: NotificationPayload): Promise<Notification> {
    const { subject, body } = await this.buildContent(payload);
    const notification = await this.createRecord({ ...payload, channel: 'in_app', subject, body });

    // Use EventService for realtime delivery instead of direct socket emitter
    if (payload.userId) {
      try {
        this.eventService.emitNotificationNew(payload.userId, {
          notificationId: notification.id,
          type: payload.type,
          subject: subject ?? '',
          body: body ?? undefined,
          createdAt: notification.createdAt.toISOString(),
        });
        await this.markDelivered(notification.id, 'sent', `inapp-${notification.id}`);
      } catch (err: any) {
        await this.markFailed(notification.id, err?.message ?? 'In-app delivery failed');
      }
    } else {
      this.logger.log(`[DEV] In-app notification: ${subject}`);
      await this.markDelivered(notification.id, 'sent', `inapp-dev-${notification.id}`);
    }

    return notification;
  }

  // ─── Queue delivery ─────────────────────────────────────────────────────────

  private async enqueueDelivery(
    channel: 'email' | 'sms' | 'whatsapp',
    notificationId: string,
    to: string,
    subject?: string,
    body?: string,
  ): Promise<void> {
    try {
      await this.notificationQueue.add(
        channel,
        { notificationId, channel, to, subject, body },
        {
          attempts: MAX_RETRY_ATTEMPTS,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );
    } catch (err: any) {
      this.logger.warn(`[Queue] Failed to enqueue ${channel} for ${notificationId}: ${err?.message}`);
      // Fallback: deliver synchronously
      const result = await this.deliverDirect(channel, to, subject, body);
      await this.updateDeliveryResult(notificationId, result);
    }
  }

  // ─── Direct delivery (used by processor and as fallback) ──────────────────────

  async processDelivery(
    notificationId: string,
    channel: 'email' | 'sms' | 'whatsapp',
    to: string,
    subject?: string,
    body?: string,
  ): Promise<DeliveryResult> {
    // Track attempt
    await this.notificationRepo.update(notificationId, {
      attempts: () => 'attempts + 1',
      lastAttemptAt: new Date(),
    });

    const result = await this.deliverDirect(channel, to, subject, body);
    await this.updateDeliveryResult(notificationId, result);
    return result;
  }

  private async deliverDirect(
    channel: 'email' | 'sms' | 'whatsapp',
    to: string,
    subject?: string,
    body?: string,
  ): Promise<DeliveryResult> {
    switch (channel) {
      case 'email':
        return this.emailService.send(to, subject ?? '', body ?? '');
      case 'sms':
        return this.smsService.send(to, body ?? '');
      case 'whatsapp':
        return this.whatsAppService.send(to, body ?? '');
      default:
        return { success: false, providerMessageId: null, status: 'failed', error: `Unknown channel: ${channel}` };
    }
  }

  // ─── DB tracking helpers ─────────────────────────────────────────────────────

  private async updateDeliveryResult(id: string, result: DeliveryResult): Promise<void> {
    if (result.success) {
      await this.markDelivered(id, 'sent', result.providerMessageId);
    } else {
      await this.markFailed(id, result.error);
    }
  }

  private async markDelivered(id: string, status: string, providerMessageId: string | null): Promise<void> {
    await this.notificationRepo.update(id, {
      status,
      providerMessageId,
      sentAt: new Date(),
      errorMessage: null,
    });
  }

  private async markFailed(id: string, error?: string): Promise<void> {
    await this.notificationRepo.update(id, {
      status: 'failed',
      errorMessage: error ?? null,
    });
  }

  // ─── Emit realtime event ─────────────────────────────────────────────────────

  private emitNotificationCreated(notification: Notification): void {
    try {
      if (notification.userId) {
        this.eventService.emitNotificationNew(notification.userId, {
          notificationId: notification.id,
          type: notification.type,
          subject: notification.subject ?? '',
          body: notification.body ?? undefined,
          createdAt: notification.createdAt.toISOString(),
        });
      }
    } catch (err: any) {
      this.logger.warn(`[Event] Failed to emit notification.created: ${err?.message}`);
    }
  }

  // ─── User preference checking ───────────────────────────────────────────────

  /**
   * Check if a user has enabled the given notification channel.
   * If the user is not found or has no preferences, defaults to enabled.
   */
  private async isChannelEnabled(userId: string | undefined, channel: string): Promise<boolean> {
    if (!userId) return true;
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['emailEnabled', 'smsEnabled', 'whatsappEnabled'],
      });
      if (!user) return true;
      switch (channel) {
        case 'email':   return user.emailEnabled;
        case 'sms':     return user.smsEnabled;
        case 'whatsapp': return user.whatsappEnabled;
        default:        return true;
      }
    } catch {
      return true;
    }
  }

  // ─── Content helpers ──────────────────────────────────────────────────────────

  private async buildContent(payload: NotificationPayload): Promise<{ subject: string; body: string }> {
    if (payload.templateKey) {
      return this.resolveTemplate(payload.templateKey, payload.templateVars ?? {});
    }
    return { subject: payload.subject ?? '', body: payload.body ?? '' };
  }

  private async createRecord(data: Partial<Notification> & { channel: string; type: string }): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId: data.userId,
      clientId: data.clientId,
      type: data.type,
      channel: data.channel,
      subject: data.subject,
      body: data.body,
      target: data.target,
      status: data.status ?? 'pending',
      attempts: 0,
      metadata: data.metadata,
    });
    return this.notificationRepo.save(notification);
  }

  // ─── Query helpers ────────────────────────────────────────────────────────────

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notificationRepo.findOne({ where: { id } });
  }

  // ─── Admin query helpers ──────────────────────────────────────────────────────

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    userId?: string;
  }): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, channel, userId } = query;

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('n.status = :status', { status });
    if (channel) qb.andWhere('n.channel = :channel', { channel });
    if (userId) qb.andWhere('n.userId = :userId', { userId });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getFailedNotifications(): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { status: 'failed' },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async retryFailed(notificationId: string): Promise<Notification> {
    const notification = await this.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    if (notification.status !== 'failed') {
      throw new Error(`Notification ${notificationId} is not in failed status`);
    }

    // Reset status to pending and re-enqueue
    await this.notificationRepo.update(notificationId, {
      status: 'pending',
      errorMessage: null,
      attempts: 0,
    });

    const target = notification.target;
    if (!target) {
      throw new Error(`Notification ${notificationId} has no target address`);
    }

    await this.enqueueDelivery(
      notification.channel as 'email' | 'sms' | 'whatsapp',
      notificationId,
      target,
      notification.subject ?? undefined,
      notification.body ?? undefined,
    );

    return (await this.findById(notificationId))!;
  }

  async retryAllFailed(): Promise<{ retried: number }> {
    const failed = await this.getFailedNotifications();
    let retried = 0;
    for (const n of failed) {
      try {
        await this.retryFailed(n.id);
        retried++;
      } catch (err: any) {
        this.logger.warn(`[Retry] Failed to retry ${n.id}: ${err?.message}`);
      }
    }
    return { retried };
  }

  // ─── In-app notification queries ──────────────────────────────────────────────

  async findUserNotifications(userId: string): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const notifications = await this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    const unreadCount = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { notifications, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepo.update(
      { id, userId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }
}
