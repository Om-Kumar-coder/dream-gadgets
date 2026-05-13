import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeClient(overrides: any = {}): any {
  return {
    id: 'socket-id-1',
    handshake: {
      auth: {},
      query: {},
    },
    data: {},
    join: jest.fn(async () => {}) as any,
    emit: jest.fn() as any,
    disconnect: jest.fn() as any,
    ...overrides,
  };
}

function makeJwtPayload(overrides: any = {}): any {
  return {
    sub: 'user-uuid-1',
    email: 'test@example.com',
    role: 'Shop Sales',
    permissions: ['inventory.view'],
    branchId: 'branch-uuid-1',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900,
    ...overrides,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let realtimeService: RealtimeService;
  let configService: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'app.jwtSecret': 'test-secret',
          JWT_SECRET: 'test-secret',
        };
        return config[key];
      }) as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        RealtimeService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    realtimeService = module.get<RealtimeService>(RealtimeService);
  });

  // ─── 17.1 JWT authentication ─────────────────────────────────────────────────

  describe('handleConnection()', () => {
    it('should disconnect client with no token', async () => {
      const client = makeClient();

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('should disconnect client with invalid token', async () => {
      const client = makeClient({
        handshake: { auth: { token: 'invalid.token.here' }, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('should accept client with valid JWT from handshake.auth.token', async () => {
      const jwt = require('jsonwebtoken');
      const payload = makeJwtPayload();
      const token = jwt.sign(payload, 'test-secret');

      const client = makeClient({
        handshake: { auth: { token }, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.disconnect).not.toHaveBeenCalled();
      expect(client.data.userId).toBe('user-uuid-1');
    });

    it('should accept client with valid JWT from query.token', async () => {
      const jwt = require('jsonwebtoken');
      const payload = makeJwtPayload();
      const token = jwt.sign(payload, 'test-secret');

      const client = makeClient({
        handshake: { auth: {}, query: { token } },
      });

      await gateway.handleConnection(client);

      expect(client.disconnect).not.toHaveBeenCalled();
    });
  });

  // ─── 17.2 Room assignment ─────────────────────────────────────────────────────

  describe('room assignment on connection', () => {
    it('should join user room on connection', async () => {
      const jwt = require('jsonwebtoken');
      const payload = makeJwtPayload({ sub: 'user-uuid-1', branchId: 'branch-uuid-1' });
      const token = jwt.sign(payload, 'test-secret');

      const client = makeClient({
        handshake: { auth: { token }, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.join).toHaveBeenCalledWith('user:user-uuid-1');
    });

    it('should join branch room when branchId is present', async () => {
      const jwt = require('jsonwebtoken');
      const payload = makeJwtPayload({ branchId: 'branch-uuid-1' });
      const token = jwt.sign(payload, 'test-secret');

      const client = makeClient({
        handshake: { auth: { token }, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.join).toHaveBeenCalledWith('branch:branch-uuid-1');
    });

    it('should join admin room for Shop Owner', async () => {
      const jwt = require('jsonwebtoken');
      const payload = makeJwtPayload({ role: 'Shop Owner', branchId: null });
      const token = jwt.sign(payload, 'test-secret');

      const client = makeClient({
        handshake: { auth: { token }, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.join).toHaveBeenCalledWith('admin');
    });

    it('should NOT join admin room for non-owner staff', async () => {
      const jwt = require('jsonwebtoken');
      const payload = makeJwtPayload({ role: 'Shop Sales', branchId: 'branch-uuid-1' });
      const token = jwt.sign(payload, 'test-secret');

      const client = makeClient({
        handshake: { auth: { token }, query: {} },
      });

      await gateway.handleConnection(client);

      const joinCalls = (client.join as any).mock.calls.map((c: any) => c[0]);
      expect(joinCalls).not.toContain('admin');
    });
  });

  // ─── 17.3 RealtimeService event emitters ─────────────────────────────────────

  describe('RealtimeService', () => {
    let mockServer: any;

    beforeEach(() => {
      mockServer = {
        to: jest.fn().mockReturnThis() as any,
        emit: jest.fn() as any,
      };
      realtimeService.setServer(mockServer);
    });

    it('should emit sale.created to branch room', () => {
      realtimeService.emitSaleCreated('branch-uuid-1', {
        saleId: 'sale-uuid-1',
        amount: 50000,
        branchId: 'branch-uuid-1',
      });

      expect(mockServer.to).toHaveBeenCalledWith('branch:branch-uuid-1');
      expect(mockServer.emit).toHaveBeenCalledWith('sale.created', expect.objectContaining({ saleId: 'sale-uuid-1' }));
    });

    it('should emit inventory.updated to branch room', () => {
      realtimeService.emitInventoryUpdated('branch-uuid-1', {
        itemId: 'item-uuid-1',
        status: 'sold',
        branchId: 'branch-uuid-1',
      });

      expect(mockServer.to).toHaveBeenCalledWith('branch:branch-uuid-1');
      expect(mockServer.emit).toHaveBeenCalledWith('inventory.updated', expect.any(Object));
    });

    it('should emit order.status_changed to admin room', () => {
      realtimeService.emitOrderStatusChanged({ orderId: 'order-uuid-1', status: 'shipped' });

      expect(mockServer.to).toHaveBeenCalledWith('admin');
      expect(mockServer.emit).toHaveBeenCalledWith('order.status_changed', expect.any(Object));
    });

    it('should emit transfer.received to destination branch room', () => {
      realtimeService.emitTransferReceived('branch-uuid-2', {
        transferId: 'transfer-uuid-1',
        branchId: 'branch-uuid-2',
      });

      expect(mockServer.to).toHaveBeenCalledWith('branch:branch-uuid-2');
      expect(mockServer.emit).toHaveBeenCalledWith('transfer.received', expect.any(Object));
    });

    it('should emit notification.new to user room', () => {
      realtimeService.emitNotificationNew('user-uuid-1', {
        notificationId: 'notif-uuid-1',
        type: 'invoice_delivery',
        subject: 'Your Invoice',
      });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-uuid-1');
      expect(mockServer.emit).toHaveBeenCalledWith('notification.new', expect.any(Object));
    });

    it('should emit payment.confirmed to admin room', () => {
      realtimeService.emitPaymentConfirmed({
        orderId: 'order-uuid-1',
        paymentId: 'pay-uuid-1',
        amount: 50000,
      });

      expect(mockServer.to).toHaveBeenCalledWith('admin');
      expect(mockServer.emit).toHaveBeenCalledWith('payment.confirmed', expect.any(Object));
    });

    // ─── 17.4 POS lock/unlock ─────────────────────────────────────────────────

    it('should emit inventory.locked to branch room', () => {
      realtimeService.emitInventoryLocked('branch-uuid-1', {
        itemId: 'item-uuid-1',
        imei: '123456789012345',
        lockedBy: 'user-uuid-1',
      });

      expect(mockServer.to).toHaveBeenCalledWith('branch:branch-uuid-1');
      expect(mockServer.emit).toHaveBeenCalledWith('inventory.locked', expect.any(Object));
    });

    it('should emit inventory.unlocked to branch room', () => {
      realtimeService.emitInventoryUnlocked('branch-uuid-1', {
        itemId: 'item-uuid-1',
        imei: '123456789012345',
      });

      expect(mockServer.to).toHaveBeenCalledWith('branch:branch-uuid-1');
      expect(mockServer.emit).toHaveBeenCalledWith('inventory.unlocked', expect.any(Object));
    });

    it('should not throw when server is not set', () => {
      realtimeService.setServer(null);

      expect(() => {
        realtimeService.emitSaleCreated('branch-uuid-1', {
          saleId: 'sale-uuid-1',
          amount: 50000,
          branchId: 'branch-uuid-1',
        });
      }).not.toThrow();
    });
  });

  // ─── handleDisconnect ─────────────────────────────────────────────────────────

  describe('handleDisconnect()', () => {
    it('should not throw on disconnect', () => {
      const client = makeClient();

      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  // ─── ping handler ─────────────────────────────────────────────────────────────

  describe('handlePing()', () => {
    it('should emit pong with timestamp', () => {
      const client = makeClient();

      gateway.handlePing(client);

      expect(client.emit).toHaveBeenCalledWith('pong', expect.objectContaining({ timestamp: expect.any(String) }));
    });
  });
});
