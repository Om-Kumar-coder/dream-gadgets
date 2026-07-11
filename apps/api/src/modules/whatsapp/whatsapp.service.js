var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
let WhatsappService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WhatsappService = _classThis = class {
        constructor(conversationRepo, messageRepo, dataSource, configService) {
            this.conversationRepo = conversationRepo;
            this.messageRepo = messageRepo;
            this.dataSource = dataSource;
            this.configService = configService;
            this.logger = new Logger(WhatsappService.name);
        }
        // ─── Webhook verification ─────────────────────────────────────────────
        /**
         * Verify the WhatsApp webhook challenge (used by Twilio/WhatsApp Business API).
         * Returns the challenge string if the verify token matches.
         */
        verifyWebhook(mode, challenge, verifyToken) {
            const expectedToken = this.configService.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') ?? 'dreamgadgets-verify';
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
        async handleIncoming(payload) {
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
            }
            catch (err) {
                this.logger.error(`[Webhook] Error processing incoming message: ${err?.message}`);
            }
        }
        async handleTwilioIncoming(payload) {
            const fromNumber = payload.From?.replace('whatsapp:', '') ?? '';
            const toNumber = payload.To?.replace('whatsapp:', '') ?? '';
            const content = payload.Body ?? '';
            const messageSid = payload.SmsSid ?? payload.MessageSid ?? '';
            const numMedia = parseInt(payload.NumMedia ?? '0', 10);
            if (!fromNumber)
                return;
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
        async handleMetaIncoming(payload) {
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
                    let mediaUrl;
                    let mediaMimeType;
                    if (contentType === 'text' && msg.text?.body) {
                        content = msg.text.body;
                    }
                    else if (msg[contentType]) {
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
                        await this.messageRepo.update({ providerMessageId: status.id }, { status: status.status ?? 'unknown' });
                    }
                }
            }
        }
        // ─── Conversation management ───────────────────────────────────────────
        async findOrCreateConversation(dto) {
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
            }
            catch (err) {
                // If unique constraint violation, another request just created one — fetch it
                if (err?.code === '23505' || err?.message?.includes('unique') || err?.message?.includes('duplicate')) {
                    const retry = await this.conversationRepo.findOne({
                        where: { customerPhone: dto.customerPhone, status: 'active' },
                    });
                    if (retry)
                        return retry;
                }
                throw err;
            }
        }
        async storeMessage(dto) {
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
            }
            else {
                await this.conversationRepo.update(dto.conversationId, {
                    lastMessageAt: new Date(),
                    lastMessagePreview: dto.content ? (dto.content).slice(0, 200) : `[${dto.contentType}]`,
                });
            }
            return saved;
        }
        // ─── Query methods ─────────────────────────────────────────────────────
        async getConversations(query) {
            const { page = 1, limit = 20, status, type, assignedStaffId, search } = query;
            const qb = this.conversationRepo
                .createQueryBuilder('conv')
                .orderBy('conv.lastMessageAt', 'DESC')
                .addOrderBy('conv.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (status)
                qb.andWhere('conv.status = :status', { status });
            if (type)
                qb.andWhere('conv.type = :type', { type });
            if (assignedStaffId)
                qb.andWhere('conv.assignedStaffId = :assignedStaffId', { assignedStaffId });
            if (search) {
                qb.andWhere('(conv.customerName ILIKE :search OR conv.customerPhone ILIKE :search)', { search: `%${search}%` });
            }
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        async getConversationById(id) {
            const conversation = await this.conversationRepo.findOne({
                where: { id },
                relations: ['messages'],
            });
            if (!conversation)
                throw new NotFoundException(`Conversation ${id} not found`);
            return conversation;
        }
        async getMessages(conversationId, page = 1, limit = 50) {
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
        async updateConversation(id, dto) {
            const conversation = await this.conversationRepo.findOne({ where: { id } });
            if (!conversation)
                throw new NotFoundException(`Conversation ${id} not found`);
            Object.assign(conversation, dto);
            return this.conversationRepo.save(conversation);
        }
        async getConversationCount(status) {
            const where = {};
            if (status)
                where.status = status;
            return this.conversationRepo.count({ where });
        }
        async getUnreadCount(staffId) {
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
        mapMediaType(mimeType) {
            if (!mimeType)
                return 'document';
            if (mimeType.startsWith('image/'))
                return 'image';
            if (mimeType.startsWith('video/'))
                return 'video';
            if (mimeType.startsWith('audio/'))
                return 'audio';
            return 'document';
        }
    };
    __setFunctionName(_classThis, "WhatsappService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WhatsappService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WhatsappService = _classThis;
})();
export { WhatsappService };
//# sourceMappingURL=whatsapp.service.js.map