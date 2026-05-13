import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';

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

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private queue: any = null;

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private configService: ConfigService,
  ) {
    this.initQueue();
  }

  // ─── Queue init (graceful fallback) ──────────────────────────────────────────

  private initQueue(): void {
    try {
      const { Queue } = require('bullmq');
      const redisUrl = this.configService.get<string>('redis.url') ?? this.configService.get<string>('REDIS_URL');
      if (redisUrl) {
        this.queue = new Queue('notification', {
          connection: { url: redisUrl },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        });
        this.logger.log('Notification BullMQ queue initialized');
      }
    } catch {
      this.logger.warn('BullMQ not available — notifications will be processed synchronously');
    }
  }

  // ─── Template resolution ──────────────────────────────────────────────────────

  async resolveTemplate(
    templateKey: string,
    vars: Record<string, string> = {},
  ): Promise<{ subject: string; body: string }> {
    // In production, load from settings table by key
    // For MVP: return a simple default template
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

    // Default templates
    const defaults: Record<string, { subject: string; body: string }> = {
      invoice_delivery: {
        subject: 'Your Invoice from Dream Gadgets',
        body: 'Dear {{name}}, your invoice {{invoiceNumber}} for ₹{{amount}} is ready.',
      },
      order_status: {
        subject: 'Order Update - {{orderNumber}}',
        body: 'Your order {{orderNumber}} status has been updated to {{status}}.',
      },
      otp: {
        subject: 'Your OTP',
        body: 'Your OTP is {{otp}}. Valid for 10 minutes.',
      },
      birthday_offer: {
        subject: 'Happy Birthday from Dream Gadgets!',
        body: 'Dear {{name}}, wishing you a happy birthday! Enjoy a special offer today.',
      },
    };

    const tpl = defaults[templateKey] ?? { subject: templateKey, body: '' };
    return {
      subject: this.substituteVars(tpl.subject, vars),
      body: this.substituteVars(tpl.body, vars),
    };
  }

  private substituteVars(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
  }

  // ─── 14.2 Email ───────────────────────────────────────────────────────────────

  async sendEmail(payload: NotificationPayload & { to: string }): Promise<Notification> {
    const { subject, body } = await this.buildContent(payload);
    const notification = await this.createRecord({ ...payload, channel: 'email', subject, body });

    if (this.queue) {
      await this.queue.add('send-email', { notificationId: notification.id, to: payload.to, subject, body }).catch((err: any) => {
        this.logger.warn(`Failed to enqueue email job: ${err?.message}`);
      });
    } else {
      await this.deliverEmail(notification, payload.to, subject, body);
    }

    return notification;
  }

  private async deliverEmail(notification: Notification, to: string, subject: string, body: string): Promise<void> {
    try {
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      if (!smtpHost) {
        this.logger.log(`[DEV] Email to ${to}: ${subject}`);
        await this.markSent(notification.id);
        return;
      }

      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT') ?? 587,
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') ?? 'noreply@dreamgadgets.in',
        to,
        subject,
        html: body,
      });

      await this.markSent(notification.id);
    } catch (err: any) {
      await this.markFailed(notification.id, err?.message);
    }
  }

  // ─── 14.3 WhatsApp ────────────────────────────────────────────────────────────

  async sendWhatsApp(payload: NotificationPayload & { to: string }): Promise<Notification> {
    const { subject, body } = await this.buildContent(payload);
    const notification = await this.createRecord({ ...payload, channel: 'whatsapp', subject, body });

    if (this.queue) {
      await this.queue.add('send-whatsapp', { notificationId: notification.id, to: payload.to, body }).catch((err: any) => {
        this.logger.warn(`Failed to enqueue WhatsApp job: ${err?.message}`);
      });
    } else {
      await this.deliverWhatsApp(notification, payload.to, body);
    }

    return notification;
  }

  private async deliverWhatsApp(notification: Notification, to: string, body: string): Promise<void> {
    try {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      const from = this.configService.get<string>('TWILIO_WHATSAPP_FROM');

      if (!accountSid || !authToken) {
        this.logger.log(`[DEV] WhatsApp to ${to}: ${body}`);
        await this.markSent(notification.id);
        return;
      }

      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:${to}`,
        body,
      });

      await this.markSent(notification.id);
    } catch (err: any) {
      await this.markFailed(notification.id, err?.message);
    }
  }

  // ─── 14.4 SMS ─────────────────────────────────────────────────────────────────

  async sendSms(payload: NotificationPayload & { to: string }): Promise<Notification> {
    const { body } = await this.buildContent(payload);
    const notification = await this.createRecord({ ...payload, channel: 'sms', body });

    if (this.queue) {
      await this.queue.add('send-sms', { notificationId: notification.id, to: payload.to, body }).catch((err: any) => {
        this.logger.warn(`Failed to enqueue SMS job: ${err?.message}`);
      });
    } else {
      await this.deliverSms(notification, payload.to, body);
    }

    return notification;
  }

  private async deliverSms(notification: Notification, to: string, body: string): Promise<void> {
    try {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      const from = this.configService.get<string>('TWILIO_SMS_FROM');

      if (!accountSid || !authToken) {
        this.logger.log(`[DEV] SMS to ${to}: ${body}`);
        await this.markSent(notification.id);
        return;
      }

      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      await client.messages.create({ from, to, body });

      await this.markSent(notification.id);
    } catch (err: any) {
      await this.markFailed(notification.id, err?.message);
    }
  }

  // ─── 14.6 In-app (Socket.io) ─────────────────────────────────────────────────

  async sendInApp(
    payload: NotificationPayload,
    emitter?: { emit: (room: string, event: string, data: any) => void },
  ): Promise<Notification> {
    const { subject, body } = await this.buildContent(payload);
    const notification = await this.createRecord({ ...payload, channel: 'in_app', subject, body });

    if (emitter && payload.userId) {
      try {
        emitter.emit(`user:${payload.userId}`, 'notification.new', {
          id: notification.id,
          type: payload.type,
          subject,
          body,
          createdAt: notification.createdAt,
        });
        await this.markSent(notification.id);
      } catch (err: any) {
        await this.markFailed(notification.id, err?.message);
      }
    } else {
      this.logger.log(`[DEV] In-app notification for user ${payload.userId}: ${subject}`);
      await this.markSent(notification.id);
    }

    return notification;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

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
      status: 'pending',
      metadata: data.metadata,
    });
    return this.notificationRepo.save(notification);
  }

  private async markSent(id: string): Promise<void> {
    await this.notificationRepo.update(id, { status: 'sent', sentAt: new Date() });
  }

  private async markFailed(id: string, error?: string): Promise<void> {
    await this.notificationRepo.update(id, { status: 'failed', error });
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
}
