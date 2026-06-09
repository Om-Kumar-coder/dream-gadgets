import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReturnService } from './return.service';
import { EventService } from '../../common/events/event.service';
import { Return } from './entities/return.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Payment } from '../sales/entities/payment.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { DataSource } from 'typeorm';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: 'sale-uuid-1',
    invoiceNumber: 'DG-MUM-2025-00001',
    clientId: 'client-1',
    branchId: 'branch-1',
    subtotal: 3000,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 3000, // below 5000 — any staff can approve
    paymentStatus: 'paid',
    saleType: 'in-store',
    notes: null,
    createdById: 'user-1',
    saleDate: new Date(), // today — within window
    isVoided: false,
    voidedById: null,
    voidedAt: null,
    items: [{ id: 'si-1', itemId: 'item-1', saleId: 'sale-uuid-1' } as SaleItem],
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Sale;
}

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
  return {
    id: 'purchase-uuid-1',
    invoiceNumber: 'PUR-BRAN-2025-123456',
    vendorName: 'Test Vendor',
    vendorId: null,
    branchId: 'branch-1',
    totalAmount: 15000,
    taxAmount: 0,
    notes: null,
    status: 'completed',
    createdById: 'user-1',
    purchaseDate: new Date('2025-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Purchase;
}

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    imei: '359999000000001',
    status: 'sold',
    purchaseId: 'purchase-uuid-1',
    ...overrides,
  } as InventoryItem;
}

function makeReturn(overrides: Partial<Return> = {}): Return {
  return {
    id: 'return-uuid-1',
    returnNumber: 'RET-2025-1234567890',
    returnType: 'sale',
    originalId: 'sale-uuid-1',
    clientId: 'client-1',
    reason: 'Defective device',
    refundMethod: 'cash',
    refundAmount: 3000,
    refundStatus: 'pending',
    approvedById: null,
    createdById: 'user-1',
    createdAt: new Date(),
    ...overrides,
  } as Return;
}

// ─── Mock factories ──────────────────────────────────────────────────────────

function makeRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    findByIds: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    update: jest.fn() as any,
    createQueryBuilder: jest.fn() as any,
  };
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('ReturnService', () => {
  let service: ReturnService;
  let returnRepo: any;
  let saleRepo: any;
  let saleItemRepo: any;
  let paymentRepo: any;
  let purchaseRepo: any;
  let itemRepo: any;
  let configService: any;

  beforeEach(async () => {
    returnRepo = makeRepo();
    saleRepo = makeRepo();
    saleItemRepo = makeRepo();
    paymentRepo = makeRepo();
    purchaseRepo = makeRepo();
    itemRepo = makeRepo();
    configService = { get: jest.fn().mockReturnValue(7) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnService,
        { provide: getRepositoryToken(Return), useValue: returnRepo },
        { provide: getRepositoryToken(Sale), useValue: saleRepo },
        { provide: getRepositoryToken(SaleItem), useValue: saleItemRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Purchase), useValue: purchaseRepo },
        { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
        { provide: ConfigService, useValue: configService },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                update: jest.fn(),
                query: jest.fn(() => Promise.resolve([])),
              },
            }),
          },
        },
        {
          provide: EventService,
          useValue: {
            emitReturnCreated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReturnService>(ReturnService);
  });

  // ─── 11.2 createSaleReturn ────────────────────────────────────────────────

  describe('createSaleReturn()', () => {
    const baseDto = {
      reason: 'Defective device',
      refundMethod: 'cash' as const,
    };

    it('should create a sale return within the return window', async () => {
      const sale = makeSale({ saleDate: new Date() }); // today
      const savedReturn = makeReturn();

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      const result = await service.createSaleReturn('sale-uuid-1', baseDto, 'user-1', 'sales');

      expect(result).toBeDefined();
      expect(result.returnType).toBe('sale');
      expect(returnRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when sale not found', async () => {
      (saleRepo.findOne as any).mockResolvedValue(null);

      await expect(
        service.createSaleReturn('non-existent', baseDto, 'user-1', 'sales'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for voided sale', async () => {
      const sale = makeSale({ isVoided: true });
      (saleRepo.findOne as any).mockResolvedValue(sale);

      await expect(
        service.createSaleReturn('sale-uuid-1', baseDto, 'user-1', 'sales'),
      ).rejects.toThrow(BadRequestException);
    });

    // ─── 11.3 Return window enforcement ────────────────────────────────────

    it('should reject return outside window without manager override', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
      const sale = makeSale({ saleDate: oldDate });
      (saleRepo.findOne as any).mockResolvedValue(sale);

      await expect(
        service.createSaleReturn('sale-uuid-1', baseDto, 'user-1', 'sales'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createSaleReturn('sale-uuid-1', baseDto, 'user-1', 'sales'),
      ).rejects.toMatchObject({ response: { code: 'RETURN_WINDOW_EXPIRED' } });
    });

    it('should allow return outside window with managerOverride=true', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const sale = makeSale({ saleDate: oldDate });
      const savedReturn = makeReturn();

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      const result = await service.createSaleReturn(
        'sale-uuid-1',
        { ...baseDto, managerOverride: true },
        'user-1',
        'store manager',
      );

      expect(result).toBeDefined();
    });

    // ─── 11.3 Approval threshold enforcement ───────────────────────────────

    it('should reject high-value return (>25000) for non-owner', async () => {
      const sale = makeSale({ totalAmount: 30000, saleDate: new Date() });
      (saleRepo.findOne as any).mockResolvedValue(sale);

      await expect(
        service.createSaleReturn(
          'sale-uuid-1',
          { ...baseDto, refundAmount: 30000 },
          'user-1',
          'sales',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow high-value return (>25000) for owner', async () => {
      const sale = makeSale({ totalAmount: 30000, saleDate: new Date() });
      const savedReturn = makeReturn({ refundAmount: 30000 });

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      const result = await service.createSaleReturn(
        'sale-uuid-1',
        { ...baseDto, refundAmount: 30000 },
        'user-1',
        'shop owner',
      );

      expect(result).toBeDefined();
    });

    it('should require manager for return between 5000 and 25000', async () => {
      const sale = makeSale({ totalAmount: 10000, saleDate: new Date() });
      (saleRepo.findOne as any).mockResolvedValue(sale);

      await expect(
        service.createSaleReturn(
          'sale-uuid-1',
          { ...baseDto, refundAmount: 10000 },
          'user-1',
          'sales',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow any staff for return below 5000', async () => {
      const sale = makeSale({ totalAmount: 3000, saleDate: new Date() });
      const savedReturn = makeReturn({ refundAmount: 3000 });

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      const result = await service.createSaleReturn(
        'sale-uuid-1',
        { ...baseDto, refundAmount: 3000 },
        'user-1',
        'sales',
      );

      expect(result).toBeDefined();
    });

    // ─── 11.4 Inventory status update ──────────────────────────────────────

    it('should update inventory items to "available" by default', async () => {
      const sale = makeSale({ saleDate: new Date() });
      const savedReturn = makeReturn();

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createSaleReturn('sale-uuid-1', baseDto, 'user-1', 'sales');

      expect(itemRepo.update).toHaveBeenCalledWith('item-1', { status: 'available' });
    });

    it('should update inventory items to "scrapped" when conditionAssessment is scrapped', async () => {
      const sale = makeSale({ saleDate: new Date() });
      const savedReturn = makeReturn();

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createSaleReturn(
        'sale-uuid-1',
        { ...baseDto, conditionAssessment: 'scrapped' },
        'user-1',
        'sales',
      );

      expect(itemRepo.update).toHaveBeenCalledWith('item-1', { status: 'scrapped' });
    });

    // ─── 11.5 Razorpay refund trigger ──────────────────────────────────────

    it('should set refundStatus to "processed" for original_payment method', async () => {
      const sale = makeSale({ saleDate: new Date() });
      const savedReturn = makeReturn({ refundStatus: 'processed', refundMethod: 'original_payment' });

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      const result = await service.createSaleReturn(
        'sale-uuid-1',
        { ...baseDto, refundMethod: 'original_payment' },
        'user-1',
        'sales',
      );

      // Verify create was called with processed status
      const createCall = (returnRepo.create as any).mock.calls[0][0];
      expect(createCall.refundStatus).toBe('processed');
    });

    it('should set refundStatus to "pending" for non-online refund methods', async () => {
      const sale = makeSale({ saleDate: new Date() });
      const savedReturn = makeReturn({ refundStatus: 'pending' });

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createSaleReturn('sale-uuid-1', { ...baseDto, refundMethod: 'cash' }, 'user-1', 'sales');

      const createCall = (returnRepo.create as any).mock.calls[0][0];
      expect(createCall.refundStatus).toBe('pending');
    });

    it('should generate a return number in RET-YEAR-TS format', async () => {
      const sale = makeSale({ saleDate: new Date() });
      const savedReturn = makeReturn();

      (saleRepo.findOne as any).mockResolvedValue(sale);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createSaleReturn('sale-uuid-1', baseDto, 'user-1', 'sales');

      const createCall = (returnRepo.create as any).mock.calls[0][0];
      expect(createCall.returnNumber).toMatch(/^RET-\d{4}-\d+$/);
    });
  });

  // ─── 12.1 createPurchaseReturn ────────────────────────────────────────────

  describe('createPurchaseReturn()', () => {
    const baseDto = { reason: 'Wrong items received' };

    it('should create a purchase return and scrap items by default', async () => {
      const purchase = makePurchase();
      const items = [makeItem({ id: 'item-1', purchaseId: 'purchase-uuid-1' })];
      const savedReturn = makeReturn({ returnType: 'purchase', originalId: 'purchase-uuid-1' });

      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (itemRepo.find as any).mockResolvedValue(items);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      const result = await service.createPurchaseReturn('purchase-uuid-1', baseDto, 'user-1');

      expect(result).toBeDefined();
      expect(result.returnType).toBe('purchase');
      expect(itemRepo.update).toHaveBeenCalledWith('item-1', { status: 'scrapped' });
    });

    it('should throw NotFoundException when purchase not found', async () => {
      (purchaseRepo.findOne as any).mockResolvedValue(null);

      await expect(
        service.createPurchaseReturn('non-existent', baseDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return only specified items when itemIds provided', async () => {
      const purchase = makePurchase();
      const items = [makeItem({ id: 'item-2' })];
      const savedReturn = makeReturn({ returnType: 'purchase' });

      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (itemRepo.find as any).mockResolvedValue(items);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createPurchaseReturn(
        'purchase-uuid-1',
        { ...baseDto, itemIds: ['item-2'] },
        'user-1',
      );

      // Verify find is called with In() operator
      expect(itemRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.any(Object),
          }),
        }),
      );
      expect(itemRepo.update).toHaveBeenCalledWith('item-2', { status: 'scrapped' });
    });

    it('should throw NotFoundException when specified items not found', async () => {
      const purchase = makePurchase();
      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (itemRepo.find as any).mockResolvedValue([]); // none found — length < itemIds.length

      await expect(
        service.createPurchaseReturn(
          'purchase-uuid-1',
          { ...baseDto, itemIds: ['item-missing'] },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set conditionAssessment to "available" when specified', async () => {
      const purchase = makePurchase();
      const items = [makeItem({ id: 'item-1' })];
      const savedReturn = makeReturn({ returnType: 'purchase' });

      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (itemRepo.find as any).mockResolvedValue(items);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createPurchaseReturn(
        'purchase-uuid-1',
        { ...baseDto, conditionAssessment: 'available' },
        'user-1',
      );

      expect(itemRepo.update).toHaveBeenCalledWith('item-1', { status: 'available' });
    });

    it('should use In() operator for itemIds lookup', async () => {
      const purchase = makePurchase();
      const items = [makeItem({ id: 'item-1' }), makeItem({ id: 'item-2' })];
      const savedReturn = makeReturn({ returnType: 'purchase' });

      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (itemRepo.find as any).mockImplementation(({ where }: any) => {
        // Verify the In() function was used (it returns an object with _type/_value)
        expect(where.id).toBeDefined();
        return Promise.resolve(items.filter((i: any) => where.id._value?.includes(i.id)));
      });
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });
      (returnRepo.create as any).mockReturnValue(savedReturn);
      (returnRepo.save as any).mockResolvedValue(savedReturn);

      await service.createPurchaseReturn(
        'purchase-uuid-1',
        { ...baseDto, itemIds: ['item-1', 'item-2'] },
        'user-1',
      );

      expect(itemRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.any(Object),
          }),
        }),
      );
      expect(itemRepo.update).toHaveBeenCalledWith('item-1', { status: 'scrapped' });
      expect(itemRepo.update).toHaveBeenCalledWith('item-2', { status: 'scrapped' });
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('should return return record by ID', async () => {
      const ret = makeReturn();
      (returnRepo.findOne as any).mockResolvedValue(ret);

      const result = await service.findById('return-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('return-uuid-1');
    });

    it('should throw NotFoundException when return not found', async () => {
      (returnRepo.findOne as any).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    function makeQueryBuilder(data: Return[], total: number): any {
      const qb: any = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: (jest.fn() as any).mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('should return paginated list of returns', async () => {
      const returns = [makeReturn()];
      const qb = makeQueryBuilder(returns, 1);
      (returnRepo.createQueryBuilder as any).mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply returnType filter', async () => {
      const qb = makeQueryBuilder([], 0);
      (returnRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ returnType: 'sale' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'ret.returnType = :returnType',
        { returnType: 'sale' },
      );
    });
  });
});
