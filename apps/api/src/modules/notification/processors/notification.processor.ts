import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';

export interface NotificationJobData {
  notificationId: string;
  channel: 'email' | 'sms' | 'whatsapp';
  to: string;
  subject?: string;
  body: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process()
  async process(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, channel, to, subject, body } = job.data;

    this.logger.log(
      `[Processor] Processing notification ${notificationId} via ${channel} (attempt ${job.attemptsMade + 1})`,
    );

    try {
      const result = await this.notificationService.processDelivery(notificationId, channel, to, subject, body);

      if (result.success) {
        this.logger.log(`[Processor] Delivered ${notificationId} via ${channel}: id=${result.providerMessageId}`);
      } else {
        throw new Error(result.error ?? 'Delivery failed');
      }
    } catch (err: any) {
      this.logger.warn(
        `[Processor] Delivery failed for ${notificationId} via ${channel} (attempt ${job.attemptsMade + 1}): ${err?.message}`,
      );
      throw err;
    }
  }

  @OnQueueFailed()
  onFailed(job: Job<NotificationJobData>, error: Error): void {
    this.logger.warn(
      `[Processor] Failed notification ${job.data.notificationId} via ${job.data.channel}: ${error?.message}`,
    );
  }
}
