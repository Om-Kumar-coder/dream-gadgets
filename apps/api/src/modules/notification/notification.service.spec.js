import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { User } from '../auth/entities/user.entity';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { EventService } from '../../common/events/event.service';
// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeNotification(overrides = {}) {
    return {
        id: 'notif-uuid-1',
        userId: 'user-uuid-1',
        clientId: null,
        type: 'invoice_delivery',
        channel: 'email',
        subject: 'Test Subject',
        body: 'Test Body',
        status: 'pending',
        sentAt: null,
        metadata: null,
        attempts: 0,
        providerMessageId: null,
        errorMessage: null,
        target: null,
        lastAttemptAt: null,
        createdAt: new Date(),
        user: null,
        ...overrides,
    };
}
function makeRepo() {
    return {
        create: jest.fn((data) => ({ ...data, id: 'notif-uuid-1', createdAt: new Date() })),
        save: jest.fn(async (entity) => entity),
        update: jest.fn(async () => ({ affected: 1 })),
        find: jest.fn(async () => []),
        findOne: jest.fn(async () => null),
        createQueryBuilder: jest.fn(() => ({
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(async () => [[], 0]),
        })),
        manager: {
            getRepository: jest.fn(() => ({
                findOne: jest.fn(async () => null),
            })),
        },
    };
}
function mockService(result) {
    return { send: jest.fn(async () => result) };
}
// ─── Test suite ───────────────────────────────────────────────────────────────
describe('NotificationService', () => {
    let service;
    let repo;
    let configService;
    beforeEach(async () => {
        repo = makeRepo();
        configService = {
            get: jest.fn((key) => {
                const config = {
                    'redis.url': undefined,
                    REDIS_URL: undefined,
                    SMTP_HOST: undefined,
                    TWILIO_ACCOUNT_SID: undefined,
                };
                return config[key];
            }),
        };
        const module = await Test.createTestingModule({
            providers: [
                NotificationService,
                { provide: getRepositoryToken(Notification), useValue: repo },
                { provide: getRepositoryToken(User), useValue: makeRepo() },
                { provide: getQueueToken('notification'), useValue: { add: jest.fn(async () => ({})) } },
                { provide: ConfigService, useValue: configService },
                { provide: EmailService, useValue: mockService({ success: true, providerMessageId: 'dev-123', status: 'sent' }) },
                { provide: SmsService, useValue: mockService({ success: true, providerMessageId: 'dev-456', status: 'sent' }) },
                { provide: WhatsAppService, useValue: mockService({ success: true, providerMessageId: 'dev-789', status: 'sent' }) },
                { provide: EventService, useValue: { emitNotificationNew: jest.fn() } },
            ],
        }).compile();
        service = module.get(NotificationService);
    });
    // ─── Template system ─────────────────────────────────────────────────────────
    describe('resolveTemplate()', () => {
        it('should return default template for invoice_delivery', async () => {
            const result = await service.resolveTemplate('invoice_delivery', {
                name: 'John',
                invoiceNumber: 'DG-MUM-2025-001',
                amount: '50000',
            });
            expect(result.subject).toContain('Dream Gadgets');
            expect(result.body).toContain('DG-MUM-2025-001');
            expect(result.body).toContain('50000');
        });
        it('should return default template for otp', async () => {
            const result = await service.resolveTemplate('otp', { otp: '123456' });
            expect(result.body).toContain('123456');
        });
        it('should substitute all variables in template', async () => {
            const result = await service.resolveTemplate('order_status', {
                orderNumber: 'ORD-001',
                status: 'shipped',
            });
            expect(result.subject).toContain('ORD-001');
            expect(result.body).toContain('ORD-001');
            expect(result.body).toContain('shipped');
        });
        it('should leave unresolved variables as-is', async () => {
            const result = await service.resolveTemplate('otp', {});
            expect(result.body).toContain('{{otp}}');
        });
        it('should return key as subject for unknown template', async () => {
            const result = await service.resolveTemplate('unknown_template', {});
            expect(result.subject).toBe('unknown_template');
        });
    });
    // ─── 14.2 sendEmail ──────────────────────────────────────────────────────────
    describe('sendEmail()', () => {
        it('should create a notification record with channel=email', async () => {
            const notification = makeNotification({ channel: 'email' });
            repo.save.mockResolvedValue(notification);
            const result = await service.sendEmail({
                to: 'test@example.com',
                type: 'invoice_delivery',
                subject: 'Invoice',
                body: 'Your invoice is ready',
            });
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ channel: 'email', type: 'invoice_delivery' }));
            expect(repo.save).toHaveBeenCalled();
        });
        it('should use template when templateKey is provided', async () => {
            repo.save.mockResolvedValue(makeNotification({ channel: 'email' }));
            await service.sendEmail({
                to: 'test@example.com',
                type: 'invoice_delivery',
                templateKey: 'invoice_delivery',
                templateVars: { name: 'Alice', invoiceNumber: 'INV-001', amount: '10000' },
            });
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                subject: expect.stringContaining('Dream Gadgets'),
                body: expect.stringContaining('INV-001'),
            }));
        });
    });
    // ─── 14.4 sendSms ────────────────────────────────────────────────────────────
    describe('sendSms()', () => {
        it('should create a notification record with channel=sms', async () => {
            repo.save.mockResolvedValue(makeNotification({ channel: 'sms' }));
            await service.sendSms({
                to: '+919876543210',
                type: 'otp',
                templateKey: 'otp',
                templateVars: { otp: '654321' },
            });
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ channel: 'sms' }));
        });
    });
    // ─── 14.6 sendInApp ──────────────────────────────────────────────────────────
    describe('sendInApp()', () => {
        it('should create a notification record with channel=in_app', async () => {
            repo.save.mockResolvedValue(makeNotification({ channel: 'in_app' }));
            await service.sendInApp({
                userId: 'user-uuid-1',
                type: 'notification.new',
                subject: 'New Alert',
                body: 'You have a new message',
            });
            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ channel: 'in_app' }));
        });
    });
    // ─── findByUserId ─────────────────────────────────────────────────────────────
    describe('findByUserId()', () => {
        it('should return notifications for a user', async () => {
            const notifications = [makeNotification(), makeNotification({ id: 'notif-uuid-2' })];
            repo.find.mockResolvedValue(notifications);
            const result = await service.findByUserId('user-uuid-1');
            expect(result).toHaveLength(2);
            expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-uuid-1' } }));
        });
    });
    // ─── findById ─────────────────────────────────────────────────────────────────
    describe('findById()', () => {
        it('should return notification by id', async () => {
            const notification = makeNotification();
            repo.findOne.mockResolvedValue(notification);
            const result = await service.findById('notif-uuid-1');
            expect(result).toBeDefined();
            expect(result?.id).toBe('notif-uuid-1');
        });
        it('should return null when not found', async () => {
            repo.findOne.mockResolvedValue(null);
            const result = await service.findById('non-existent');
            expect(result).toBeNull();
        });
    });
});
//# sourceMappingURL=notification.service.spec.js.map