import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WhatsappConversation } from './entities/whatsapp-conversation.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity';

export interface CreateConversationDto {
  customerPhone: string;
  customerName?: string;
  type?: string;
  metadata?: Record<string, any>;
}

export interface StoreMessageDto {
  conversationId: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  content?: string;
  contentType?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaFilename?: string;
  status?: string;
  providerMessageId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectRepository(WhatsappConversation)
    private conversationRepo: Repository<WhatsappConversation>,
    @InjectRepository(WhatsappMessage)
    private messageRepo: Repository<WhatsappMessage>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  // ─── Webhook verification ─────────────────────────────────────────────

  /**
   * Verify the WhatsApp webhook challenge (used by Twilio/WhatsApp Business API).
   * Returns the challenge string if the verify token matches.
   */
  verifyWebhook(
    mode: string | undefined,
    challenge: string | undefined,
    verifyToken: string | undefined,
  ): string | null {
    const expectedToken = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN') ?? 'dreamgadgets-verify';
    if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
      this.logger.log('[Webhook] Verification successful');
      return challenge;
    }
    this.logger.warn(`[Webhook] Verification failed: mode=${mode}, token mismatch`);
    return null;
  }

  // ─── Incoming webhook handler ──────────────────────────────────────────

  /**
   * Process an incoming message from the WhatsApp Business API webhook.
   * Creates or updates the conversation and stores the message.
   */
  async handleIncoming(payload: any): Promise<void> {
    this.logger.log(`[Webhook] Received webhook payload type: ${payload?.entry?.[0]?.changes?.[0]?.field}`);

    try {
      // Twilio WhatsApp webhook format
      if (payload.SmsSid || payload.MessageSid) {
        await this.handleTwilioIncoming(payload);
        return;
      }

      // WhatsApp Business API (Meta Cloud API) format
      if (payload?.entry?.[0]?.changes?.[0]?.value) {
        await this.handleMetaIncoming(payload);
        return;
      }

      this.logger.warn('[Webhook] Unknown payload format', JSON.stringify(payload).slice(0, 500));
    } catch (err: any) {
      this.logger.error(`[Webhook] Error processing incoming message: ${err?.message}`);
    }
  }

  private async handleTwilioIncoming(payload: any): Promise<void> {
    const fromNumber = payload.From?.replace('whatsapp:', '') ?? '';
    const toNumber = payload.To?.replace('whatsapp:', '') ?? '';
    const content = payload.Body ?? '';
    const messageSid = payload.SmsSid ?? payload.MessageSid ?? '';
    const numMedia = parseInt(payload.NumMedia ?? '0', 10);

    if (!fromNumber) return;

    // Find or create conversation
    const conversation = await this.findOrCreateConversation({
      customerPhone: fromNumber,
    });

    // Store the message
    await this.storeMessage({
      conversationId: conversation.id,
      direction: 'inbound',
      fromNumber,
      toNumber,
      content,
      contentType: 'text',
      status: 'received',
      providerMessageId: messageSid,
    });

    // Handle media attachments if any
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = payload[`MediaUrl${i}`];
      const mediaType = payload[`MediaContentType${i}`];
      if (mediaUrl) {
        await this.storeMessage({
          conversationId: conversation.id,
          direction: 'inbound',
          fromNumber,
          toNumber,
          contentType: this.mapMediaType(mediaType),
          mediaUrl,
          mediaMimeType: mediaType,
          status: 'received',
          providerMessageId: `${messageSid}-media-${i}`,
        });
      }
    }
  }

  private async handleMetaIncoming(payload: any): Promise<void> {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Incoming messages
    if (value?.messages) {
      for (const msg of value.messages) {
        const fromNumber = msg.from ?? '';
        const toNumber = value.metadata?.display_phone_number ?? '';
        const msgId = msg.id ?? '';

        const conversation = await this.findOrCreateConversation({
          customerPhone: fromNumber,
          customerName: value.contacts?.[0]?.profile?.name,
        });

        const contentType = msg.type ?? 'text';
        let content = '';
        let mediaUrl: string | undefined;
        let mediaMimeType: string | undefined;

        if (contentType === 'text' && msg.text?.body) {
          content = msg.text.body;
        } else if (msg[contentType]) {
          mediaUrl = msg[contentType]?.link ?? msg[contentType]?.id;
          mediaMimeType = msg[contentType]?.mime_type;
          content = msg[contentType]?.caption ?? '';
        }

        await this.storeMessage({
          conversationId: conversation.id,
          direction: 'inbound',
          fromNumber,
          toNumber,
          content,
          contentType,
          mediaUrl,
          mediaMimeType,
          status: 'received',
          providerMessageId: msgId,
        });
      }
    }

    // Delivery status updates
    if (value?.statuses) {
      for (const status of value.statuses) {
        if (status.id) {
          await this.messageRepo.update(
            { providerMessageId: status.id },
            { status: status.status ?? 'unknown' },
          );
        }
      }
    }
  }

  // ─── Conversation management ───────────────────────────────────────────

  async findOrCreateConversation(dto: CreateConversationDto): Promise<WhatsappConversation> {
    // Check for existing active conversation
    const existing = await this.conversationRepo.findOne({
      where: { customerPhone: dto.customerPhone, status: 'active' },
    });

    if (existing) {
      // Update name if provided
      if (dto.customerName && !existing.customerName) {
        existing.customerName = dto.customerName;
        await this.conversationRepo.save(existing);
      }
      return existing;
    }

    // Check for any conversation with this phone (even resolved/closed)
    const anyExisting = await this.conversationRepo.findOne({
      where: { customerPhone: dto.customerPhone },
      order: { createdAt: 'DESC' },
    });

    if (anyExisting) {
      // Reopen it
      anyExisting.status = 'active';
      anyExisting.unreadCount = 0;
      anyExisting.customerName = dto.customerName ?? anyExisting.customerName;
      return this.conversationRepo.save(anyExisting);
    }

    // Create new conversation with retry for unique constraint race
    try {
      const conversation = this.conversationRepo.create({
        customerPhone: dto.customerPhone,
        customerName: dto.customerName ?? null,
        type: dto.type ?? 'general',
        metadata: dto.metadata ?? null,
      });

      return await this.conversationRepo.save(conversation);
    } catch (err: any) {
      // If unique constraint violation, another request just created one — fetch it
      if (err?.code === '23505' || err?.message?.includes('unique') || err?.message?.includes('duplicate')) {
        const retry = await this.conversationRepo.findOne({
          where: { customerPhone: dto.customerPhone, status: 'active' },
        });
        if (retry) return retry;
      }
      throw err;
    }
  }

  async storeMessage(dto: StoreMessageDto): Promise<WhatsappMessage> {
    const message = this.messageRepo.create({
      conversationId: dto.conversationId,
      direction: dto.direction,
      fromNumber: dto.fromNumber,
      toNumber: dto.toNumber,
      content: dto.content ?? null,
      contentType: dto.contentType ?? 'text',
      mediaUrl: dto.mediaUrl ?? null,
      mediaMimeType: dto.mediaMimeType ?? null,
      mediaFilename: dto.mediaFilename ?? null,
      status: dto.status ?? 'sent',
      providerMessageId: dto.providerMessageId ?? null,
      metadata: dto.metadata ?? null,
    });

    const saved = await this.messageRepo.save(message);

    // Update conversation metadata
    if (dto.direction === 'inbound') {
      await this.conversationRepo.update(dto.conversationId, {
        lastMessageAt: new Date(),
        lastMessagePreview: (dto.content ?? '').slice(0, 200) || `[${dto.contentType}]`,
        unreadCount: () => 'unread_count + 1',
      });
    } else {
      await this.conversationRepo.update(dto.conversationId, {
        lastMessageAt: new Date(),
        lastMessagePreview: dto.content ? (dto.content).slice(0, 200) : `[${dto.contentType}]`,
      });
    }

    return saved;
  }

  // ─── Query methods ─────────────────────────────────────────────────────

  async getConversations(query: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    assignedStaffId?: string;
    search?: string;
  }): Promise<{ data: WhatsappConversation[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, type, assignedStaffId, search } = query;

    const qb = this.conversationRepo
      .createQueryBuilder('conv')
      .orderBy('conv.lastMessageAt', 'DESC')
      .addOrderBy('conv.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('conv.status = :status', { status });
    if (type) qb.andWhere('conv.type = :type', { type });
    if (assignedStaffId) qb.andWhere('conv.assignedStaffId = :assignedStaffId', { assignedStaffId });
    if (search) {
      qb.andWhere(
        '(conv.customerName ILIKE :search OR conv.customerPhone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getConversationById(id: string): Promise<WhatsappConversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: ['messages'],
    });
    if (!conversation) throw new NotFoundException(`Conversation ${id} not found`);
    return conversation;
  }

  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<{ data: WhatsappMessage[]; total: number }> {
    const [data, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark conversation as read when fetching messages
    await this.conversationRepo.update(conversationId, { unreadCount: 0 });

    return { data, total };
  }

  async updateConversation(
    id: string,
    dto: Partial<{
      customerName: string;
      type: string;
      status: string;
      assignedStaffId: string;
      priority: string;
      tags: object;
    }>,
  ): Promise<WhatsappConversation> {
    const conversation = await this.conversationRepo.findOne({ where: { id } });
    if (!conversation) throw new NotFoundException(`Conversation ${id} not found`);

    Object.assign(conversation, dto);
    return this.conversationRepo.save(conversation);
  }

  async getConversationCount(status?: string): Promise<number> {
    const where: any = {};
    if (status) where.status = status;
    return this.conversationRepo.count({ where });
  }

  async getUnreadCount(staffId?: string): Promise<number> {
    const qb = this.conversationRepo
      .createQueryBuilder('conv')
      .select('COALESCE(SUM(conv.unreadCount), 0)', 'total');

    if (staffId) {
      qb.where('conv.assignedStaffId = :staffId OR conv.assignedStaffId IS NULL', { staffId });
    }

    const result = await qb.getRawOne();
    return parseInt(result?.total ?? '0', 10);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private mapMediaType(mimeType: string | undefined): string {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }
}
