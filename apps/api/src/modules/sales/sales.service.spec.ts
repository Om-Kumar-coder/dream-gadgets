import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { EventService } from '../../common/events/event.service';
import { CouponService } from '../coupon/coupon.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import * as fc from 'fast-check';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from './entities/payment.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Accessory } from '../inventory/entities/accessory.entity';
import { Branch } from '../auth/entities/user.entity';
import { validatePaymentSplits, calculateGST } from '../../common/utils/business-logic';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeInventoryItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-uuid-1',
    imei: '359999000000001',
    condition: 'mint',
    purchasePrice: 10000,
    taxAmount: 0,
    totalCost: 10000,
    status: 'available',
    branchId: 'branch-1',
    purchaseId: null,
    itemName: 'Test Phone',
    hsnCode: '8517',
    ...overrides,
  } as InventoryItem;
}

function makeSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: 'sale-uuid-1',
    invoiceNumber: 'DG-MUM-2025-00001',
    clientId: null,
    branchId: 'branch-1',
    subtotal: 10000,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 10000,
    paymentStatus: 'paid',
    saleType: 'in-store',
    notes: null,
    createdById: 'user-1',
    saleDate: new Date(),
    isVoided: false,
    voidedById: null,
    voidedAt: null,
    items: [],
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Sale;
}

function makeSaleItem(overrides: Partial<SaleItem> = {}): SaleItem {
  return {
    id: 'si-uuid-1',
    saleId: 'sale-uuid-1',
    itemId: 'item-uuid-1',
    imei: '359999000000001',
    description: 'Test Phone',
    unitPrice: 10000,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 10000,
    hsnCode: '8517',
    createdAt: new Date(),
    ...overrides,
  } as SaleItem;
}

// ─── Mock factories ──────────────────────────────────────────────────────────

function makeSaleRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    update: jest.fn() as any,
    createQueryBuilder: jest.fn() as any,
  };
}

function makeSaleItemRepo(): any {
  return {
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
  };
}

function makePaymentRepo(): any {
  return {
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
  };
}

function makeItemRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    update: jest.fn() as any,
  };
}

function makeBranchRepo(): any {
  return {
    findOne: jest.fn() as any,
  };
}

function makeAccessoryRepo(): any {
  return {
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    update: jest.fn() as any,
  };
}

function makeDataSource(_overrides: any = {}): any {
  const qr: any = {
    connect: jest.fn().mockImplementation(() => Promise.resolve()),
    startTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
    commitTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
    rollbackTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
    release: jest.fn().mockImplementation(() => Promise.resolve()),
    manager: {
      create: jest.fn((Entity: any, data: any) => ({ ...data })) as any,
      save: jest.fn((_Entity: any, data: any) => Promise.resolve({ id: 'new-id', ...data })) as any,
      update: jest.fn().mockImplementation(() => Promise.resolve({ affected: 1 })) as any,
      query: jest.fn().mockImplementation(() => Promise.resolve([])) as any,
    },
  };
  return {
    createQueryRunner: jest.fn().mockReturnValue(qr),
    query: (jest.fn() as any).mockResolvedValue([]),
  };
}

function makeConfigService(): any {
  return {
    get: jest.fn().mockReturnValue('redis://localhost:6379'),
  };
}

function makeRedisService(): any {
  return {
    getNextInvoiceSequence: jest.fn() as any,
    posLockItem: jest.fn() as any,
    posUnlockItem: jest.fn() as any,
  };
}

function makeEventService(): any {
  return {
    emitSaleCreated: jest.fn() as any,
    emitInventoryUpdated: jest.fn() as any,
    emitInventoryLocked: jest.fn() as any,
    emitInventoryUnlocked: jest.fn() as any,
    emitSaleVoided: jest.fn() as any,
  };
}

function makeCouponService(): any {
  return {
    validate: jest.fn() as any,
    recordUsage: jest.fn() as any,
  };
}

function makeNotificationService(): any {
  return {
    sendEmail: jest.fn() as any,
    sendWhatsApp: jest.fn() as any,
  };
}

// ─── Mock Redis ──────────────────────────────────────────────────────────────

const mockRedis: any = {
  incr: jest.fn().mockImplementation(() => Promise.resolve(1)),
  expire: jest.fn().mockImplementation(() => Promise.resolve(1)),
  set: jest.fn().mockImplementation(() => Promise.resolve('OK')),
  del: jest.fn().mockImplementation(() => Promise.resolve(1)),
  get: jest.fn().mockImplementation(() => Promise.resolve(null)),
};

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockImplementation(() => Promise.resolve()),
    incr: jest.fn().mockImplementation(() => Promise.resolve(1)),
    expire: jest.fn().mockImplementation(() => Promise.resolve(1)),
    set: jest.fn().mockImplementation(() => Promise.resolve('OK')),
    del: jest.fn().mockImplementation(() => Promise.resolve(1)),
    get: jest.fn().mockImplementation(() => Promise.resolve(null)),
  }),
}));

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('SalesService', () => {
  let service: SalesService;
  let saleRepo: any;
  let saleItemRepo: any;
  let paymentRepo: any;
  let itemRepo: any;
  let branchRepo: any;
  let accessoryRepo: any;
  let dataSource: any;
  let redisService: any;
  let eventService: any;
  let couponService: any;
  let notificationService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    saleRepo = makeSaleRepo();
    saleItemRepo = makeSaleItemRepo();
    paymentRepo = makePaymentRepo();
    itemRepo = makeItemRepo();
    branchRepo = makeBranchRepo();
    accessoryRepo = makeAccessoryRepo();
    dataSource = makeDataSource();

    // Set up Redis service mock. The service calls redisService.posLockItem(itemId, ttl)
    // which internally constructs the key "pos:lock:{itemId}" and calls set(key, '1', {EX: ttl}).
    // We mirror that here so mockRedis.assertions still work.
    redisService = {
      getNextInvoiceSequence: ((branchId: string, year: number) => {
        // Delegate to the raw incr mock so tests can assert on mockRedis.incr calls.
        // Also mimic the real RedisService behaviour: set expiry on the first sequence.
        // mockRedis.incr returns a Promise<number> — await it.
        return mockRedis.incr(`invoice:seq:${branchId}:${year}`).then((seq: number) => {
          if (seq === 1) {
            mockRedis.expire(`invoice:seq:${branchId}:${year}`, 400 * 24 * 60 * 60);
          }
          return seq;
        });
      }) as any,
      posLockItem: ((itemId: string, ttl: number) => {
        mockRedis.set(`pos:lock:${itemId}`, '1', { EX: ttl });
      }) as any,
      posUnlockItem: ((itemId: string) => {
        mockRedis.del(`pos:lock:${itemId}`);
      }) as any,
    };

    eventService = makeEventService();
    couponService = makeCouponService();
    notificationService = makeNotificationService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Sale), useValue: saleRepo },
        { provide: getRepositoryToken(SaleItem), useValue: saleItemRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
        { provide: getRepositoryToken(Branch), useValue: branchRepo },
        { provide: getRepositoryToken(Accessory), useValue: accessoryRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: RedisService, useValue: redisService },
        { provide: EventService, useValue: eventService },
        { provide: CouponService, useValue: couponService },
        { provide: NotificationService, useValue: notificationService },
        { provide: ConfigService, useValue: makeConfigService() },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    // Inject mock redis directly to avoid real connection
    (service as any).redisClient = mockRedis;
  });

  // ─── 7.2: Invoice number generation ──────────────────────────────────────

  describe('generateInvoiceNumber()', () => {
    it('should generate invoice number in DG-{CODE}-{YEAR}-{SEQ} format', async () => {
      branchRepo.findOne.mockResolvedValue({ id: 'branch-1', code: 'MUM' });
      mockRedis.incr.mockResolvedValue(1);

      const result = await service.generateInvoiceNumber('branch-1');

      const year = new Date().getFullYear();
      expect(result).toBe(`DG-MUM-${year}-00001`);
    });

    it('should pad sequence to 5 digits', async () => {
      branchRepo.findOne.mockResolvedValue({ id: 'branch-1', code: 'DEL' });
      mockRedis.incr.mockResolvedValue(42);

      const result = await service.generateInvoiceNumber('branch-1');

      const year = new Date().getFullYear();
      expect(result).toBe(`DG-DEL-${year}-00042`);
    });

    it('should use branch code from entity', async () => {
      branchRepo.findOne.mockResolvedValue({ id: 'branch-2', code: 'BLR' });
      mockRedis.incr.mockResolvedValue(1);

      const result = await service.generateInvoiceNumber('branch-2');

      expect(result).toMatch(/^DG-BLR-\d{4}-\d{5}$/);
    });

    it('should set Redis TTL on first sequence (seq === 1)', async () => {
      branchRepo.findOne.mockResolvedValue({ id: 'branch-1', code: 'MUM' });
      mockRedis.incr.mockResolvedValue(1);

      await service.generateInvoiceNumber('branch-1');

      expect(mockRedis.expire).toHaveBeenCalled();
    });

    it('should NOT set Redis TTL when seq > 1', async () => {
      branchRepo.findOne.mockResolvedValue({ id: 'branch-1', code: 'MUM' });
      mockRedis.incr.mockResolvedValue(5);
      mockRedis.expire.mockClear();

      await service.generateInvoiceNumber('branch-1');

      expect(mockRedis.expire).not.toHaveBeenCalled();
    });
  });

  // ─── 7.4: Payment split validation ───────────────────────────────────────

  describe('validatePaymentSplits (unit)', () => {
    it('should return true when splits sum equals total', () => {
      const splits = [
        { amount: 5000, method: 'cash' },
        { amount: 5000, method: 'card' },
      ];
      expect(validatePaymentSplits(splits, 10000)).toBe(true);
    });

    it('should return true within 0.01 tolerance', () => {
      const splits = [{ amount: 9999.995, method: 'cash' }];
      expect(validatePaymentSplits(splits, 10000)).toBe(true);
    });

    it('should return false when splits do not match total', () => {
      const splits = [{ amount: 8000, method: 'cash' }];
      expect(validatePaymentSplits(splits, 10000)).toBe(false);
    });

    it('should return false when splits exceed total', () => {
      const splits = [{ amount: 12000, method: 'cash' }];
      expect(validatePaymentSplits(splits, 10000)).toBe(false);
    });

    it('should handle multiple splits correctly', () => {
      const splits = [
        { amount: 3000, method: 'cash' },
        { amount: 3000, method: 'card' },
        { amount: 4000, method: 'online' },
      ];
      expect(validatePaymentSplits(splits, 10000)).toBe(true);
    });
  });

  // ─── 7.3: Create sale — payment split mismatch ───────────────────────────

  describe('create() — payment split validation', () => {
    const baseDto = {
      branchId: 'branch-1',
      items: [{ itemId: 'item-uuid-1', unitPrice: 10000 }],
      payments: [{ method: 'cash', amount: 8000 }], // mismatch
    };

    it('should reject sale when payment splits do not match total', async () => {
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      await expect(service.create(baseDto, 'user-1', 'shop_sales')).rejects.toThrow(BadRequestException);
      await expect(service.create(baseDto, 'user-1', 'shop_sales')).rejects.toMatchObject({
        response: { code: 'PAYMENT_SPLIT_MISMATCH' },
      });
    });

    it('should reject sale when item is not available', async () => {
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'sold' })]);

      await expect(
        service.create({ ...baseDto, payments: [{ method: 'cash', amount: 10000 }] }, 'user-1', 'shop_sales'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject sale when item not found', async () => {
      itemRepo.find.mockResolvedValue([]);

      await expect(
        service.create({ ...baseDto, payments: [{ method: 'cash', amount: 10000 }] }, 'user-1', 'shop_sales'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 7.5: Discount authorization ─────────────────────────────────────────

  describe('create() — discount authorization', () => {
    function makeSaleDto(discountAmount: number, payments: any[]) {
      return {
        branchId: 'branch-1',
        items: [{ itemId: 'item-uuid-1', unitPrice: 10000 }],
        payments,
        discountAmount,
      };
    }

    it('should allow 0-5% discount for any sales role', async () => {
      // 3% discount on 10000 = 300
      const dto = makeSaleDto(300, [{ method: 'cash', amount: 9700 }]);
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);
      const savedSale = makeSale({ id: 'sale-1', totalAmount: 9700 });
      dataSource.createQueryRunner().manager.save.mockResolvedValue(savedSale);
      saleRepo.findOne.mockResolvedValue({ ...savedSale, items: [], payments: [] });

      // Should not throw
      await expect(service.create(dto, 'user-1', 'shop_sales')).resolves.toBeDefined();
    });

    it('should reject >5% discount for sales role', async () => {
      // 10% discount on 10000 = 1000
      const dto = makeSaleDto(1000, [{ method: 'cash', amount: 9000 }]);
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      await expect(service.create(dto, 'user-1', 'shop_sales')).rejects.toThrow(ForbiddenException);
      await expect(service.create(dto, 'user-1', 'shop_sales')).rejects.toMatchObject({
        response: { code: 'DISCOUNT_NOT_AUTHORIZED' },
      });
    });

    it('should allow 5-15% discount for store_manager', async () => {
      // 10% discount on 10000 = 1000
      const dto = makeSaleDto(1000, [{ method: 'cash', amount: 9000 }]);
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);
      const savedSale = makeSale({ id: 'sale-1', totalAmount: 9000 });
      dataSource.createQueryRunner().manager.save.mockResolvedValue(savedSale);
      saleRepo.findOne.mockResolvedValue({ ...savedSale, items: [], payments: [] });

      await expect(service.create(dto, 'user-1', 'store_manager')).resolves.toBeDefined();
    });

    it('should reject >15% discount for store_manager', async () => {
      // 20% discount on 10000 = 2000
      const dto = makeSaleDto(2000, [{ method: 'cash', amount: 8000 }]);
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      await expect(service.create(dto, 'user-1', 'store_manager')).rejects.toThrow(ForbiddenException);
    });

    it('should allow >15% discount for shop_owner', async () => {
      // 20% discount on 10000 = 2000
      const dto = makeSaleDto(2000, [{ method: 'cash', amount: 8000 }]);
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);
      const savedSale = makeSale({ id: 'sale-1', totalAmount: 8000 });
      dataSource.createQueryRunner().manager.save.mockResolvedValue(savedSale);
      saleRepo.findOne.mockResolvedValue({ ...savedSale, items: [], payments: [] });

      await expect(service.create(dto, 'user-1', 'shop_owner')).resolves.toBeDefined();
    });
  });

  // ─── 7.6: findById ───────────────────────────────────────────────────────

  describe('findById()', () => {
    it('should return sale with relations', async () => {
      const sale = makeSale();
      saleRepo.findOne.mockResolvedValue({ ...sale, items: [], payments: [] });

      const result = await service.findById(sale.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(sale.id);
    });

    it('should throw NotFoundException when sale not found', async () => {
      saleRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 7.6: findAll ────────────────────────────────────────────────────────

  describe('findAll()', () => {
    function makeQueryBuilder(data: Sale[], total: number): any {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: (jest.fn() as any).mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('should return paginated list', async () => {
      const sales = [makeSale()];
      const qb = makeQueryBuilder(sales, 1);
      saleRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply branchId filter', async () => {
      const qb = makeQueryBuilder([], 0);
      saleRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ branchId: 'branch-1' });

      expect(qb.andWhere).toHaveBeenCalledWith('sale.branchId = :branchId', { branchId: 'branch-1' });
    });

    it('should apply isVoided filter', async () => {
      const qb = makeQueryBuilder([], 0);
      saleRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ isVoided: false });

      expect(qb.andWhere).toHaveBeenCalledWith('sale.is_voided = :isVoided', { isVoided: false });
    });
  });

  // ─── 7.9: Void sale ───────────────────────────────────────────────────────

  describe('voidSale()', () => {
    it('should void a sale and restore inventory', async () => {
      const sale = makeSale({ isVoided: false });
      const saleItems = [makeSaleItem({ itemId: 'item-uuid-1' })];

      saleRepo.findOne
        .mockResolvedValueOnce({ ...sale, items: saleItems, payments: [] }) // first call in voidSale
        .mockResolvedValueOnce({ ...sale, isVoided: true, items: saleItems, payments: [] }); // second call in findById

      saleItemRepo.find.mockResolvedValue(saleItems);

      const result = await service.voidSale(sale.id, 'user-1');

      expect(result).toBeDefined();
      // Verify inventory was restored
      const qr = dataSource.createQueryRunner();
      expect(qr.manager.update).toHaveBeenCalledWith(
        InventoryItem,
        'item-uuid-1',
        { status: 'available' },
      );
    });

    it('should throw BadRequestException when sale is already voided', async () => {
      const sale = makeSale({ isVoided: true });
      saleRepo.findOne.mockResolvedValue({ ...sale, items: [], payments: [] });

      await expect(service.voidSale(sale.id, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.voidSale(sale.id, 'user-1')).rejects.toMatchObject({
        response: { code: 'ALREADY_VOIDED' },
      });
    });

    it('should throw NotFoundException when sale not found', async () => {
      saleRepo.findOne.mockResolvedValue(null);

      await expect(service.voidSale('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 7.10: POS item lock ──────────────────────────────────────────────────

  describe('lockItem()', () => {
    it('should lock an available item', async () => {
      itemRepo.findOne.mockResolvedValue(makeInventoryItem({ status: 'available' }));
      itemRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.lockItem('item-uuid-1');

      expect(result.message).toContain('locked');
      expect(itemRepo.update).toHaveBeenCalledWith('item-uuid-1', { status: 'in_cart' });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'pos:lock:item-uuid-1',
        '1',
        { EX: 900 },
      );
    });

    it('should reject locking a non-available item', async () => {
      itemRepo.findOne.mockResolvedValue(makeInventoryItem({ status: 'sold' }));

      await expect(service.lockItem('item-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when item not found', async () => {
      itemRepo.findOne.mockResolvedValue(null);

      await expect(service.lockItem('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unlockItem()', () => {
    it('should unlock an in_cart item and restore to available', async () => {
      itemRepo.findOne.mockResolvedValue(makeInventoryItem({ status: 'in_cart' }));
      itemRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.unlockItem('item-uuid-1');

      expect(result.message).toContain('unlocked');
      expect(itemRepo.update).toHaveBeenCalledWith('item-uuid-1', { status: 'available' });
      expect(mockRedis.del).toHaveBeenCalledWith('pos:lock:item-uuid-1');
    });

    it('should throw NotFoundException when item not found', async () => {
      itemRepo.findOne.mockResolvedValue(null);

      await expect(service.unlockItem('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 7.4b: POS total contract ───────────────────────────────────────────────────
  // Contract between POS frontend preview math and backend canonical total.
  // The POS UI may display a total, but backend only accepts a sale when the
  // submitted payload matches the canonical backend calculation.

  describe('POS total contract', () => {
    function canonicalTotal(items: Array<{ unitPrice: number; discount?: number; taxRate?: number }>, discountAmount = 0, isInterState = false): number {
      let subtotal = 0;
      let totalTax = 0;

      for (const item of items) {
        const priceAfterDiscount = item.unitPrice - (item.discount ?? 0);
        const gst = calculateGST(priceAfterDiscount, item.taxRate ?? 0, isInterState);
        subtotal += item.unitPrice - (item.discount ?? 0);
        totalTax += gst.total;
      }

      return subtotal + totalTax - discountAmount;
    }

    function paymentSum(payments: Array<{ method: string; amount: number }>): number {
      return payments.reduce((acc, p) => acc + Number(p.amount), 0);
    }

    async function createValidSale(dto: any, userRole = 'shop_owner'): Promise<any> {
      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);
      const savedSale = makeSale({
        id: 'sale-1',
        totalAmount: dto.frontendTotal,
        subtotal: dto.frontendTotal,
        taxAmount: 0,
      });
      dataSource.createQueryRunner().manager.save.mockResolvedValue(savedSale);
      saleRepo.findOne.mockResolvedValue({ ...savedSale, items: [], payments: [] });

      return service.create(dto, 'user-1', userRole);
    }

    it('should accept an exact single cash payment', async () => {
      const items = [{ unitPrice: 10000, taxRate: 18 }];
      const expectedTotal = canonicalTotal(items, 0, false);

      const dto = {
        branchId: 'branch-1',
        items: items.map((i) => ({ itemId: 'item-uuid-1', unitPrice: i.unitPrice, taxRate: i.taxRate })),
        payments: [{ method: 'cash', amount: expectedTotal }],
        frontendTotal: expectedTotal,
        discountAmount: 0,
        isInterState: false,
      };

      const created = await createValidSale(dto);
      expect(created.totalAmount).toEqual(expectedTotal);
    });

    it('should accept a card + UPI + exchange split that exactly matches backend total', async () => {
      const items = [{ unitPrice: 30000, taxRate: 18 }];
      const expectedTotal = canonicalTotal(items, 0, false);
      const card = 30000;
      const upi = 2000;
      const exchange = expectedTotal - card - upi;

      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      const dto = {
        branchId: 'branch-1',
        items: items.map((i) => ({ itemId: 'item-uuid-1', unitPrice: i.unitPrice, taxRate: i.taxRate })),
        payments: [
          { method: 'card', amount: card },
          { method: 'online', amount: upi },
          { method: 'exchange', amount: exchange },
        ],
        frontendTotal: expectedTotal,
        discountAmount: 0,
        isInterState: false,
      };

      const savedSale = makeSale({
        id: 'sale-1',
        totalAmount: expectedTotal,
        subtotal: 30000,
        taxAmount: expectedTotal - 30000,
      }) as any;
      savedSale.payments = dto.payments;
      dataSource.createQueryRunner().manager.save.mockResolvedValue(savedSale);
      saleRepo.findOne.mockResolvedValue({ ...savedSale, items: [] });

      const created = await service.create(dto, 'user-1', 'shop_owner');
      expect(created.totalAmount).toEqual(expectedTotal);
      expect(paymentSum(created.payments)).toEqual(expectedTotal);
    });

    it('should reject when frontendTotal differs from canonical backend total', async () => {
      const items = [{ unitPrice: 30000, taxRate: 18 }];
      const expectedTotal = canonicalTotal(items, 0, false);
      const wrongFrontendTotal = expectedTotal + 44;

      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      const dto = {
        branchId: 'branch-1',
        items: items.map((i) => ({ itemId: 'item-uuid-1', unitPrice: i.unitPrice, taxRate: i.taxRate })),
        payments: [{ method: 'card', amount: expectedTotal }],
        frontendTotal: wrongFrontendTotal,
        discountAmount: 0,
        isInterState: false,
      };

      await expect(service.create(dto, 'user-1', 'shop_owner')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'user-1', 'shop_owner')).rejects.toMatchObject({
        response: { code: 'PAYMENT_TOTAL_MISMATCH' },
      });
    });

    it('should reject overpayment even when UI believes the bill is complete', async () => {
      const items = [{ unitPrice: 35400, taxRate: 18 }];
      const expectedTotal = canonicalTotal(items, 0, false);
      const overpaidAmount = expectedTotal + 44;

      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      // frontendTotal matches the true backend total so we pass the frontend-check,
      // but the payment amount exceeds it — this triggers the overpayment check.
      const dto = {
        branchId: 'branch-1',
        items: items.map((i) => ({ itemId: 'item-uuid-1', unitPrice: i.unitPrice, taxRate: i.taxRate })),
        payments: [{ method: 'card', amount: overpaidAmount }],
        frontendTotal: expectedTotal,
        discountAmount: 0,
        isInterState: false,
      };

      await expect(service.create(dto, 'user-1', 'shop_owner')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'user-1', 'shop_owner')).rejects.toMatchObject({
        response: { code: 'PAYMENT_SPLIT_OVERPAYMENT' },
      });
    });

    it('should reject underpayment with the remaining amount in the message', async () => {
      const items = [{ unitPrice: 10000, taxRate: 0 }];
      const expectedTotal = canonicalTotal(items, 0, false);
      const paidAmount = expectedTotal - 500;

      itemRepo.find.mockResolvedValue([makeInventoryItem({ status: 'available' })]);

      const dto = {
        branchId: 'branch-1',
        items: items.map((i) => ({ itemId: 'item-uuid-1', unitPrice: i.unitPrice, taxRate: i.taxRate })),
        payments: [{ method: 'cash', amount: paidAmount }],
        frontendTotal: expectedTotal,
        discountAmount: 0,
        isInterState: false,
      };

      await expect(service.create(dto, 'user-1', 'shop_owner')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'user-1', 'shop_owner')).rejects.toMatchObject({
        response: { code: 'PAYMENT_SPLIT_MISMATCH' },
      });
    });
  });

  // ─── Property 2: Payment Split Completeness ───────────────────────────────
  // Validates: Requirements 3.2 (design.md Property 2)

  describe('Property 2: Payment Split Completeness', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * For any completed sale, the sum of all payment splits must equal the sale total amount.
     * Property: forAll(splits, total) => validatePaymentSplits(splits, total) iff sum(splits) ≈ total
     */
    it('should hold: splits sum === total implies validation passes', () => {
      fc.assert(
        fc.property(
          // Generate 1-5 positive integer amounts (avoids float precision issues)
          fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 5 }),
          (amounts) => {
            const total = amounts.reduce((a, b) => a + b, 0);
            const splits = amounts.map((amount) => ({ amount, method: 'cash' }));
            // When splits exactly sum to total, validation must pass
            return validatePaymentSplits(splits, total) === true;
          },
        ),
        { numRuns: 200 },
      );
    });

    it('should hold: splits sum !== total (by >0.01) implies validation fails', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: 1, max: 1000 }),
          (total, delta) => {
            // Splits that are clearly off by more than 0.01
            const splits = [{ amount: total + delta + 1, method: 'cash' }];
            return validatePaymentSplits(splits, total) === false;
          },
        ),
        { numRuns: 200 },
      );
    });

    it('should hold: tolerance of 0.01 is respected', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1, max: 10000, noNaN: true }),
          (total) => {
            // Within tolerance
            const withinTolerance = [{ amount: total + 0.005, method: 'cash' }];
            const outsideTolerance = [{ amount: total + 0.02, method: 'cash' }];
            return (
              validatePaymentSplits(withinTolerance, total) === true &&
              validatePaymentSplits(outsideTolerance, total) === false
            );
          },
        ),
        { numRuns: 200 },
      );
    });

    it('should hold: multi-split completeness invariant', () => {
      fc.assert(
        fc.property(
          // Generate 2-4 split amounts that sum to a known total
          fc.array(fc.integer({ min: 100, max: 5000 }), { minLength: 2, maxLength: 4 }),
          (amounts) => {
            const total = amounts.reduce((a, b) => a + b, 0);
            const splits = amounts.map((amount) => ({ amount, method: 'cash' }));
            return validatePaymentSplits(splits, total) === true;
          },
        ),
        { numRuns: 300 },
      );
    });
  });
});
