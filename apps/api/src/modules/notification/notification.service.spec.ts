import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeNotification(overrides: Partial<Notification> = {}): Notification {
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
    error: null,
    metadata: null,
    createdAt: new Date(),
    user: null,
    ...overrides,
  } as Notification;
}

function makeRepo(): any {
  return {
    create: jest.fn((data: any) => ({ ...data, id: 'notif-uuid-1', createdAt: new Date() })) as any,
    save: jest.fn(async (entity: any) => entity) as any,
    update: jest.fn(async () => ({ affected: 1 })) as any,
    find: jest.fn(async () => []) as any,
    findOne: jest.fn(async () => null) as any,
    manager: {
      getRepository: jest.fn(() => ({
        findOne: jest.fn(async () => null),
      })) as any,
    },
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: any;
  let configService: any;

  beforeEach(async () => {
    repo = makeRepo();
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'redis.url': undefined, // no Redis in tests
          REDIS_URL: undefined,
          SMTP_HOST: undefined,
          TWILIO_ACCOUNT_SID: undefined,
        };
        return config[key];
      }) as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: repo },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
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
      const result = await service.resolveTemplate('otp', {}); // no vars

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

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'email', type: 'invoice_delivery' }),
      );
      expect(repo.save).toHaveBeenCalled();
    });

    it('should use template when templateKey is provided', async () => {
      const notification = makeNotification({ channel: 'email' });
      repo.save.mockResolvedValue(notification);

      await service.sendEmail({
        to: 'test@example.com',
        type: 'invoice_delivery',
        templateKey: 'invoice_delivery',
        templateVars: { name: 'Alice', invoiceNumber: 'INV-001', amount: '10000' },
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Dream Gadgets'),
          body: expect.stringContaining('INV-001'),
        }),
      );
    });

    it('should mark notification as sent when no SMTP configured (dev mode)', async () => {
      const notification = makeNotification({ channel: 'email' });
      repo.save.mockResolvedValue(notification);

      await service.sendEmail({
        to: 'test@example.com',
        type: 'test',
        subject: 'Test',
        body: 'Test body',
      });

      // update called to mark as sent
      expect(repo.update).toHaveBeenCalledWith(
        notification.id,
        expect.objectContaining({ status: 'sent' }),
      );
    });
  });

  // ─── 14.3 sendWhatsApp ───────────────────────────────────────────────────────

  describe('sendWhatsApp()', () => {
    it('should create a notification record with channel=whatsapp', async () => {
      const notification = makeNotification({ channel: 'whatsapp' });
      repo.save.mockResolvedValue(notification);

      await service.sendWhatsApp({
        to: '+919876543210',
        type: 'order_status',
        body: 'Your order has been shipped',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'whatsapp' }),
      );
    });

    it('should mark as sent in dev mode (no Twilio configured)', async () => {
      const notification = makeNotification({ channel: 'whatsapp' });
      repo.save.mockResolvedValue(notification);

      await service.sendWhatsApp({
        to: '+919876543210',
        type: 'order_status',
        body: 'Test message',
      });

      expect(repo.update).toHaveBeenCalledWith(
        notification.id,
        expect.objectContaining({ status: 'sent' }),
      );
    });
  });

  // ─── 14.4 sendSms ────────────────────────────────────────────────────────────

  describe('sendSms()', () => {
    it('should create a notification record with channel=sms', async () => {
      const notification = makeNotification({ channel: 'sms' });
      repo.save.mockResolvedValue(notification);

      await service.sendSms({
        to: '+919876543210',
        type: 'otp',
        templateKey: 'otp',
        templateVars: { otp: '654321' },
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'sms' }),
      );
    });

    it('should mark as sent in dev mode', async () => {
      const notification = makeNotification({ channel: 'sms' });
      repo.save.mockResolvedValue(notification);

      await service.sendSms({
        to: '+919876543210',
        type: 'otp',
        body: 'Your OTP is 123456',
      });

      expect(repo.update).toHaveBeenCalledWith(
        notification.id,
        expect.objectContaining({ status: 'sent' }),
      );
    });
  });

  // ─── 14.6 sendInApp ──────────────────────────────────────────────────────────

  describe('sendInApp()', () => {
    it('should create a notification record with channel=in_app', async () => {
      const notification = makeNotification({ channel: 'in_app' });
      repo.save.mockResolvedValue(notification);

      await service.sendInApp({
        userId: 'user-uuid-1',
        type: 'notification.new',
        subject: 'New Alert',
        body: 'You have a new message',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'in_app' }),
      );
    });

    it('should emit via Socket.io emitter when provided', async () => {
      const notification = makeNotification({ channel: 'in_app', userId: 'user-uuid-1' });
      repo.save.mockResolvedValue(notification);

      const mockEmitter = { emit: jest.fn() as any };

      await service.sendInApp(
        { userId: 'user-uuid-1', type: 'notification.new', subject: 'Alert', body: 'Test' },
        mockEmitter,
      );

      expect(mockEmitter.emit).toHaveBeenCalledWith(
        'user:user-uuid-1',
        'notification.new',
        expect.objectContaining({ type: 'notification.new' }),
      );
    });

    it('should mark as sent after emitting', async () => {
      const notification = makeNotification({ channel: 'in_app', userId: 'user-uuid-1' });
      repo.save.mockResolvedValue(notification);

      const mockEmitter = { emit: jest.fn() as any };

      await service.sendInApp(
        { userId: 'user-uuid-1', type: 'notification.new', subject: 'Alert', body: 'Test' },
        mockEmitter,
      );

      expect(repo.update).toHaveBeenCalledWith(
        notification.id,
        expect.objectContaining({ status: 'sent' }),
      );
    });
  });

  // ─── findByUserId ─────────────────────────────────────────────────────────────

  describe('findByUserId()', () => {
    it('should return notifications for a user', async () => {
      const notifications = [makeNotification(), makeNotification({ id: 'notif-uuid-2' })];
      repo.find.mockResolvedValue(notifications);

      const result = await service.findByUserId('user-uuid-1');

      expect(result).toHaveLength(2);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-uuid-1' } }),
      );
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
