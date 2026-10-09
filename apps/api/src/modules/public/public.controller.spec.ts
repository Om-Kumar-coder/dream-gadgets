import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { PublicController } from './public.controller';
import { SearchService } from '../search/search.service';
import { OnlineOrderService } from '../sales/online-order.service';
import { PaymentService } from '../payment/payment.service';
import { AdminService } from '../admin/admin.service';
import { RedisService } from '../../common/redis/redis.service';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CLIENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const BRANCH_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ORDER_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

/**
 * BUG-08 — `online_orders.client_id` (FK → clients.id) was being fed
 * `req.user.sub` (a users.id). That broke:
 *  - order creation (client relation never resolves / wrong linkage),
 *  - GET /public/orders (queried by users.id → always empty),
 *  - POST /public/orders/:id/cancel (ownership compare never matched),
 *  - profile order stats (always zero).
 */
describe('PublicController (BUG-08 — order↔client linkage)', () => {
  let controller: PublicController;
  let dataSource: any;
  let onlineOrderService: any;

  const userRow = {
    id: USER_ID,
    first_name: 'Asha',
    last_name: 'Sen',
    email: 'asha@example.com',
    phone: '919876543210',
  };

  /**
   * SQL-routed DataSource mock:
   *  - users lookup          → userRow
   *  - client lookup         → [] (no match) by default
   *  - client insert         → new client id
   *  - branches fallback     → BRANCH_ID
   *  - online_orders stats   → zero row
   */
  function makeQueryMock(opts: { existingClientId?: string | null; user?: any } = {}) {
    const user = opts.user === undefined ? userRow : opts.user;
    return jest.fn(async (sql: string, params?: any[]) => {
      if (sql.includes('FROM users')) return user ? [user] : [];
      if (sql.includes('SELECT id FROM clients')) {
        return opts.existingClientId ? [{ id: opts.existingClientId }] : [];
      }
      if (sql.includes('INSERT INTO clients')) return [{ id: CLIENT_ID }];
      if (sql.includes('FROM branches')) return [{ id: BRANCH_ID }];
      if (sql.includes('FROM online_orders')) {
        return [{ total_orders: 0, total_spent: 0, delivered_count: 0, pending_count: 0 }];
      }
      return [];
    });
  }

  beforeEach(async () => {
    onlineOrderService = {
      create: jest.fn(async (dto: any) => ({ id: ORDER_ID, ...dto })),
      findById: jest.fn(),
      findByClientId: jest.fn(async () => ({ data: [], total: 0 })),
      updateStatus: jest.fn(async () => ({ id: ORDER_ID, status: 'cancelled' })),
      getPublicOrderSummary: jest.fn(),
    };
    dataSource = { query: makeQueryMock() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        { provide: SearchService, useValue: {} },
        { provide: OnlineOrderService, useValue: onlineOrderService },
        { provide: PaymentService, useValue: {} },
        { provide: AdminService, useValue: {} },
        { provide: RedisService, useValue: {} },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  const orderDto = {
    shippingAddress: { name: 'Asha', phone: '9876543210', street: '1 St', city: 'Kolkata', state: 'WB', pincode: '700001' },
    totalAmount: 1000,
    items: [{ itemId: 'item-1', description: 'iPhone', unitPrice: 1000 }],
  };

  // ─── createOrder ─────────────────────────────────────────────────────────

  describe('createOrder()', () => {
    it('stores the resolved CLIENT id, never the user id (guest request)', async () => {
      await controller.createOrder(orderDto as any, { user: undefined });

      expect(onlineOrderService.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ clientId: USER_ID }),
      );
      const dto = (onlineOrderService.create as any).mock.calls[0][0];
      expect(dto.clientId).toBeUndefined();
    });

    it('links an authenticated order to an existing client matched by phone', async () => {
      dataSource.query = makeQueryMock({ existingClientId: CLIENT_ID });

      await controller.createOrder(orderDto as any, { user: { sub: USER_ID } });

      const dto = (onlineOrderService.create as any).mock.calls[0][0];
      expect(dto.clientId).toBe(CLIENT_ID);
      expect(dto.clientId).not.toBe(USER_ID);
    });

    it('lazily creates a clients row when the user has no match yet', async () => {
      await controller.createOrder(orderDto as any, { user: { sub: USER_ID } });

      const insertCall = dataSource.query.mock.calls.find(
        (c: any[]) => String(c[0]).includes('INSERT INTO clients'),
      );
      expect(insertCall).toBeDefined();

      const dto = (onlineOrderService.create as any).mock.calls[0][0];
      expect(dto.clientId).toBe(CLIENT_ID);
    });

    it('falls back to guest order when the user cannot be linked (no phone)', async () => {
      dataSource.query = makeQueryMock({ user: { ...userRow, phone: null, email: null } });

      await controller.createOrder(orderDto as any, { user: { sub: USER_ID } });

      const dto = (onlineOrderService.create as any).mock.calls[0][0];
      expect(dto.clientId).toBeUndefined();
      const insertCall = dataSource.query.mock.calls.find(
        (c: any[]) => String(c[0]).includes('INSERT INTO clients'),
      );
      expect(insertCall).toBeUndefined();
    });

    it('never lets linkage failure break order creation', async () => {
      dataSource.query = jest.fn(async (sql: string) => {
        if (sql.includes('FROM users')) throw new Error('DB down');
        if (sql.includes('FROM branches')) return [{ id: BRANCH_ID }];
        return [];
      });

      await controller.createOrder(orderDto as any, { user: { sub: USER_ID } });

      const dto = (onlineOrderService.create as any).mock.calls[0][0];
      expect(dto.clientId).toBeUndefined();
    });
  });

  // ─── cancelOrder ─────────────────────────────────────────────────────────

  describe('cancelOrder()', () => {
    it('allows cancelling an order owned by the resolved client', async () => {
      onlineOrderService.findById.mockResolvedValue({
        id: ORDER_ID,
        clientId: CLIENT_ID,
        status: 'pending_payment',
        payments: [],
      });

      const result = await controller.cancelOrder(ORDER_ID, { user: { sub: USER_ID } });

      expect(result.data.status).toBe('cancelled');
    });

    it('rejects when the order is not owned by the resolved client', async () => {
      onlineOrderService.findById.mockResolvedValue({
        id: ORDER_ID,
        clientId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        status: 'pending_payment',
        payments: [],
      });

      await expect(
        controller.cancelOrder(ORDER_ID, { user: { sub: USER_ID } }),
      ).rejects.toMatchObject({ response: { code: 'ORDER_NOT_OWNED' } });
    });

    it('never treats users.id as ownership even if an old row stored it', async () => {
      onlineOrderService.findById.mockResolvedValue({
        id: ORDER_ID,
        clientId: USER_ID,
        status: 'pending_payment',
        payments: [],
      });

      await expect(
        controller.cancelOrder(ORDER_ID, { user: { sub: USER_ID } }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── getUserOrders ───────────────────────────────────────────────────────

  describe('getUserOrders()', () => {
    it('lists orders by the resolved client id', async () => {
      dataSource.query = makeQueryMock({ existingClientId: CLIENT_ID });

      await controller.getUserOrders({ user: { sub: USER_ID } }, {});

      expect(onlineOrderService.findByClientId).toHaveBeenCalledWith(
        CLIENT_ID,
        1,
        20,
        undefined,
        undefined,
      );
    });

    it('returns an empty page instead of querying by user id when unlinked', async () => {
      dataSource.query = makeQueryMock({ user: { ...userRow, phone: null, email: null } });

      const result = await controller.getUserOrders({ user: { sub: USER_ID } }, {});

      expect(onlineOrderService.findByClientId).not.toHaveBeenCalled();
      expect(result.data.total).toBe(0);
    });
  });

  // ─── partner inquiry (BUG-16) ─────────────────────────────────────────────

  describe('submitPartnerInquiry()', () => {
    it('persists the inquiry with partner fields folded into the message', async () => {
      dataSource.query = jest.fn(async () => [{ id: 'inq-1', name: 'Ravi' }]);

      const result = await controller.submitPartnerInquiry({
        name: 'Ravi',
        phone: '9876543210',
        email: 'ravi@example.com',
        businessName: 'RX Traders',
        partnerType: 'Retail Partner',
        message: 'Interested in a franchise',
      } as any);

      const [sql, params] = dataSource.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO contact_inquiries');
      expect(params).toEqual([
        'Ravi',
        '9876543210',
        'ravi@example.com',
        expect.stringContaining('Retail Partner'),
      ]);
      expect(String(params[3])).toContain('RX Traders');
      expect(result.data.id).toBe('inq-1');
    });
  });

  // ─── getUserProfile ──────────────────────────────────────────────────────

  describe('getUserProfile()', () => {
    it('counts order stats against the resolved client id', async () => {
      dataSource.query = makeQueryMock({ existingClientId: CLIENT_ID });

      await controller.getUserProfile({ user: { sub: USER_ID } });

      const statsCall = dataSource.query.mock.calls.find(
        (c: any[]) => String(c[0]).includes('FROM online_orders'),
      );
      expect(statsCall).toBeDefined();
      expect(statsCall![1]).toEqual([CLIENT_ID]);
      expect(statsCall![1]).not.toContain(USER_ID);
    });
  });
});
