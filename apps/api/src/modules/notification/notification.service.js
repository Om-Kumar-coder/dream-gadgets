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
import { Injectable, Logger } from '@nestjs/common';
const MAX_RETRY_ATTEMPTS = 5;
let NotificationService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationService = _classThis = class {
        constructor(notificationRepo, userRepo, configService, notificationQueue, emailService, smsService, whatsAppService, eventService) {
            this.notificationRepo = notificationRepo;
            this.userRepo = userRepo;
            this.configService = configService;
            this.notificationQueue = notificationQueue;
            this.emailService = emailService;
            this.smsService = smsService;
            this.whatsAppService = whatsAppService;
            this.eventService = eventService;
            this.logger = new Logger(NotificationService.name);
        }
        // ─── Template resolution ──────────────────────────────────────────────────────
        async resolveTemplate(templateKey, vars = {}) {
            // Load from settings table by key (if available)
            try {
                const settingsRepo = this.notificationRepo.manager.getRepository
                    ? this.notificationRepo.manager.getRepository('settings')
                    : null;
                if (settingsRepo) {
                    const setting = await settingsRepo.findOne({ where: { key: `template:${templateKey}` } }).catch(() => null);
                    if (setting?.value) {
                        const tpl = setting.value;
                        return {
                            subject: this.substituteVars(tpl.subject ?? '', vars),
                            body: this.substituteVars(tpl.body ?? '', vars),
                        };
                    }
                }
            }
            catch {
                // fallback to default
            }
            // Default templates with channel-appropriate formatting
            const defaults = {
                invoice_delivery: {
                    subject: 'Your Invoice from Dream Gadgets',
                    body: '<h2>Invoice Ready</h2><p>Dear {{name}},</p><p>Your invoice <strong>{{invoiceNumber}}</strong> for <strong>₹{{amount}}</strong> is ready.</p><p>— Dream Gadgets</p>',
                    smsBody: 'Your invoice {{invoiceNumber}} for ₹{{amount}} is ready. - Dream Gadgets',
                },
                order_status: {
                    subject: 'Order Update - {{orderNumber}}',
                    body: '<h2>Order Update</h2><p>Your order <strong>{{orderNumber}}</strong> status has been updated to <strong>{{status}}</strong>.</p><p>— Dream Gadgets</p>',
                    smsBody: 'Order {{orderNumber}}: {{status}}. - Dream Gadgets',
                },
                otp: {
                    subject: 'Your OTP for Dream Gadgets',
                    body: '<p>Your OTP is <strong>{{otp}}</strong>. Valid for 10 minutes.</p><p>— Dream Gadgets</p>',
                    smsBody: 'Your OTP is {{otp}}. Valid for 10 minutes. - Dream Gadgets',
                },
                birthday_offer: {
                    subject: 'Happy Birthday from Dream Gadgets! 🎂',
                    body: '<h2>Happy Birthday! 🎂</h2><p>Dear {{name}},</p><p>Wishing you a wonderful birthday! Enjoy a special offer just for you.</p><p>— Dream Gadgets</p>',
                    smsBody: 'Happy Birthday {{name}}! Enjoy a special offer from Dream Gadgets.',
                },
                buyback_lead: {
                    subject: 'New Buyback Request — {{brand}} {{model}}',
                    body: '<h2>New Buyback Lead</h2><p><strong>Device:</strong> {{brand}} {{model}}</p><p><strong>Phone:</strong> {{phone}}</p><p><strong>Submitted:</strong> {{date}}</p><p><a href="{{adminUrl}}">View in Admin Panel</a></p>',
                },
                refund_processed: {
                    subject: 'Refund Initiated — {{orderNumber}}',
                    body: '<h2>Refund Initiated</h2><p>Dear {{name}},</p><p>A refund of <strong>₹{{amount}}</strong> for your order <strong>{{orderNumber}}</strong> has been initiated.</p><p>The refund will be credited to your original payment method within <strong>2–5 business days</strong>.</p><p>Refund ID: {{refundId}}</p><p>— Dream Gadgets</p>',
                    smsBody: 'Refund of ₹{{amount}} initiated for order {{orderNumber}}. Will credit within 2-5 business days. - Dream Gadgets',
                },
                password_reset: {
                    subject: 'Reset Your Dream Gadgets Password',
                    body: '<h2>Password Reset</h2><p>Hi {{name}},</p><p>We received a request to reset your password.</p><p>Click the link below to reset it. This link is valid for <strong>1 hour</strong>.</p><p><a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#E50914;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>— Dream Gadgets</p>',
                    smsBody: 'Reset your Dream Gadgets password. Use this link: {{resetUrl}}. Valid for 1 hour. - Dream Gadgets',
                },
            };
            const tpl = defaults[templateKey] ?? { subject: templateKey, body: '' };
            return {
                subject: this.substituteVars(tpl.subject, vars),
                body: this.substituteVars(tpl.body, vars),
            };
        }
        substituteVars(template, vars) {
            return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
        }
        // ─── Channel-appropriate content formatting ───────────────────────────────────
        formatForChannel(channel, subject, htmlBody, templateKey, vars) {
            if (channel === 'sms' && templateKey) {
                // Use SMS-specific templates for SMS
                const defaults = {
                    invoice_delivery: 'Your invoice {{invoiceNumber}} for ₹{{amount}} is ready. - Dream Gadgets',
                    order_status: 'Order {{orderNumber}}: {{status}}. - Dream Gadgets',
                    otp: 'Your OTP is {{otp}}. Valid for 10 minutes. - Dream Gadgets',
                    birthday_offer: 'Happy Birthday {{name}}! Enjoy a special offer from Dream Gadgets.',
                    refund_processed: 'Refund of ₹{{amount}} initiated for order {{orderNumber}}. - Dream Gadgets',
                    password_reset: 'Reset your Dream Gadgets password: {{resetUrl}}. Valid 1 hour. - Dream Gadgets',
                };
                const shortBody = defaults[templateKey] ?? htmlBody.replace(/<[^>]*>/g, '');
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
        async sendEmail(payload) {
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
        async sendWhatsApp(payload) {
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
        async sendSms(payload) {
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
        async sendInApp(payload) {
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
                }
                catch (err) {
                    await this.markFailed(notification.id, err?.message ?? 'In-app delivery failed');
                }
            }
            else {
                this.logger.log(`[DEV] In-app notification: ${subject}`);
                await this.markDelivered(notification.id, 'sent', `inapp-dev-${notification.id}`);
            }
            return notification;
        }
        // ─── Queue delivery ─────────────────────────────────────────────────────────
        async enqueueDelivery(channel, notificationId, to, subject, body) {
            try {
                await this.notificationQueue.add(`send-${channel}`, { notificationId, channel, to, subject, body }, {
                    attempts: MAX_RETRY_ATTEMPTS,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: false,
                    removeOnFail: false,
                });
            }
            catch (err) {
                this.logger.warn(`[Queue] Failed to enqueue ${channel} for ${notificationId}: ${err?.message}`);
                // Fallback: deliver synchronously
                const result = await this.deliverDirect(channel, to, subject, body);
                await this.updateDeliveryResult(notificationId, result);
            }
        }
        // ─── Direct delivery (used by processor and as fallback) ──────────────────────
        async processDelivery(notificationId, channel, to, subject, body) {
            // Track attempt
            await this.notificationRepo.update(notificationId, {
                attempts: () => 'attempts + 1',
                lastAttemptAt: new Date(),
            });
            const result = await this.deliverDirect(channel, to, subject, body);
            await this.updateDeliveryResult(notificationId, result);
            return result;
        }
        async deliverDirect(channel, to, subject, body) {
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
        async updateDeliveryResult(id, result) {
            if (result.success) {
                await this.markDelivered(id, 'sent', result.providerMessageId);
            }
            else {
                await this.markFailed(id, result.error);
            }
        }
        async markDelivered(id, status, providerMessageId) {
            await this.notificationRepo.update(id, {
                status,
                providerMessageId,
                sentAt: new Date(),
                errorMessage: null,
            });
        }
        async markFailed(id, error) {
            await this.notificationRepo.update(id, {
                status: 'failed',
                errorMessage: error ?? null,
            });
        }
        // ─── Emit realtime event ─────────────────────────────────────────────────────
        emitNotificationCreated(notification) {
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
            }
            catch (err) {
                this.logger.warn(`[Event] Failed to emit notification.created: ${err?.message}`);
            }
        }
        // ─── User preference checking ───────────────────────────────────────────────
        /**
         * Check if a user has enabled the given notification channel.
         * If the user is not found or has no preferences, defaults to enabled.
         */
        async isChannelEnabled(userId, channel) {
            if (!userId)
                return true;
            try {
                const user = await this.userRepo.findOne({
                    where: { id: userId },
                    select: ['emailEnabled', 'smsEnabled', 'whatsappEnabled'],
                });
                if (!user)
                    return true;
                switch (channel) {
                    case 'email': return user.emailEnabled;
                    case 'sms': return user.smsEnabled;
                    case 'whatsapp': return user.whatsappEnabled;
                    default: return true;
                }
            }
            catch {
                return true;
            }
        }
        // ─── Content helpers ──────────────────────────────────────────────────────────
        async buildContent(payload) {
            if (payload.templateKey) {
                return this.resolveTemplate(payload.templateKey, payload.templateVars ?? {});
            }
            return { subject: payload.subject ?? '', body: payload.body ?? '' };
        }
        async createRecord(data) {
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
        async findByUserId(userId) {
            return this.notificationRepo.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: 50,
            });
        }
        async findById(id) {
            return this.notificationRepo.findOne({ where: { id } });
        }
        // ─── Admin query helpers ──────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, status, channel, userId } = query;
            const qb = this.notificationRepo
                .createQueryBuilder('n')
                .orderBy('n.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (status)
                qb.andWhere('n.status = :status', { status });
            if (channel)
                qb.andWhere('n.channel = :channel', { channel });
            if (userId)
                qb.andWhere('n.userId = :userId', { userId });
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        async getFailedNotifications() {
            return this.notificationRepo.find({
                where: { status: 'failed' },
                order: { createdAt: 'DESC' },
                take: 50,
            });
        }
        async retryFailed(notificationId) {
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
            await this.enqueueDelivery(notification.channel, notificationId, target, notification.subject ?? undefined, notification.body ?? undefined);
            return (await this.findById(notificationId));
        }
        async retryAllFailed() {
            const failed = await this.getFailedNotifications();
            let retried = 0;
            for (const n of failed) {
                try {
                    await this.retryFailed(n.id);
                    retried++;
                }
                catch (err) {
                    this.logger.warn(`[Retry] Failed to retry ${n.id}: ${err?.message}`);
                }
            }
            return { retried };
        }
        // ─── In-app notification queries ──────────────────────────────────────────────
        async findUserNotifications(userId) {
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
        async markAsRead(id, userId) {
            await this.notificationRepo.update({ id, userId }, { isRead: true, readAt: new Date() });
        }
        async markAllAsRead(userId) {
            await this.notificationRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        }
    };
    __setFunctionName(_classThis, "NotificationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationService = _classThis;
})();
export { NotificationService };
//# sourceMappingURL=notification.service.js.map