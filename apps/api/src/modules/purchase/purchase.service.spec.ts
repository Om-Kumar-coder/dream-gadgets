import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Purchase } from './entities/purchase.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
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
    ...overrides,
  } as InventoryItem;
}

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
  return {
    id: 'purchase-uuid-1',
    invoiceNumber: 'PUR-BRAN-2025-123456',
    vendorName: 'Test Vendor',
    vendorId: null,
    branchId: 'branch-1',
    totalAmount: 10000,
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

// ─── Mock factories ──────────────────────────────────────────────────────────

function makePurchaseRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    createQueryBuilder: jest.fn() as any,
  };
}

function makeItemRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    findByIds: jest.fn() as any,
    update: jest.fn() as any,
  };
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('PurchaseService', () => {
  let service: PurchaseService;
  let purchaseRepo: any;
  let itemRepo: any;

  beforeEach(async () => {
    purchaseRepo = makePurchaseRepo();
    itemRepo = makeItemRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        { provide: getRepositoryToken(Purchase), useValue: purchaseRepo },
        { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
  });

  // ─── 6.2: Create purchase ─────────────────────────────────────────────────

  describe('create()', () => {
    const baseDto = {
      vendorName: 'Test Vendor',
      branchId: 'branch-1',
      purchaseDate: '2025-01-01',
      itemIds: ['item-uuid-1'],
    };

    it('should create a purchase with valid data', async () => {
      const item = makeItem({ totalCost: 10000 });
      const savedPurchase = makePurchase({ totalAmount: 10000 });

      (itemRepo.findByIds as any).mockResolvedValue([item]);
      (purchaseRepo.create as any).mockReturnValue(savedPurchase);
      (purchaseRepo.save as any).mockResolvedValue(savedPurchase);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });

      const result = await service.create(baseDto, 'user-1');

      expect(result).toBeDefined();
      expect(result.vendorName).toBe('Test Vendor');
      expect(purchaseRepo.save).toHaveBeenCalled();
    });

    it('should reject create with no items (empty array)', async () => {
      const dto = { ...baseDto, itemIds: [] };
      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'user-1')).rejects.toMatchObject({
        response: { code: 'NO_ITEMS' },
      });
    });

    it('should throw NotFoundException when item IDs do not exist', async () => {
      (itemRepo.findByIds as any).mockResolvedValue([]); // no items found

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should compute totalAmount as sum of item totalCosts', async () => {
      const items = [
        makeItem({ id: 'item-1', totalCost: 10000 }),
        makeItem({ id: 'item-2', totalCost: 15000 }),
      ];
      const dto = { ...baseDto, itemIds: ['item-1', 'item-2'] };
      const savedPurchase = makePurchase({ totalAmount: 25000 });

      (itemRepo.findByIds as any).mockResolvedValue(items);
      (purchaseRepo.create as any).mockReturnValue(savedPurchase);
      (purchaseRepo.save as any).mockResolvedValue(savedPurchase);
      (itemRepo.update as any).mockResolvedValue({ affected: 2 });

      await service.create(dto, 'user-1');

      expect(purchaseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: 25000 }),
      );
    });

    it('should link items to the purchase after creation', async () => {
      const item = makeItem({ totalCost: 10000 });
      const savedPurchase = makePurchase({ id: 'purchase-uuid-1' });

      (itemRepo.findByIds as any).mockResolvedValue([item]);
      (purchaseRepo.create as any).mockReturnValue(savedPurchase);
      (purchaseRepo.save as any).mockResolvedValue(savedPurchase);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });

      await service.create(baseDto, 'user-1');

      expect(itemRepo.update).toHaveBeenCalledWith(
        ['item-uuid-1'],
        expect.objectContaining({ purchaseId: 'purchase-uuid-1' }),
      );
    });

    it('should generate a unique invoice number', async () => {
      const item = makeItem({ totalCost: 10000 });
      const savedPurchase = makePurchase();

      (itemRepo.findByIds as any).mockResolvedValue([item]);
      (purchaseRepo.create as any).mockReturnValue(savedPurchase);
      (purchaseRepo.save as any).mockResolvedValue(savedPurchase);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });

      await service.create(baseDto, 'user-1');

      const createCall = (purchaseRepo.create as any).mock.calls[0][0];
      expect(createCall.invoiceNumber).toMatch(/^PUR-/);
    });

    it('should default status to "completed"', async () => {
      const item = makeItem({ totalCost: 10000 });
      const savedPurchase = makePurchase({ status: 'completed' });

      (itemRepo.findByIds as any).mockResolvedValue([item]);
      (purchaseRepo.create as any).mockReturnValue(savedPurchase);
      (purchaseRepo.save as any).mockResolvedValue(savedPurchase);
      (itemRepo.update as any).mockResolvedValue({ affected: 1 });

      await service.create(baseDto, 'user-1');

      expect(purchaseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' }),
      );
    });
  });

  // ─── 6.3: Get purchase by ID ──────────────────────────────────────────────

  describe('findById()', () => {
    it('should return purchase with linked items', async () => {
      const purchase = makePurchase();
      const items = [makeItem({ purchaseId: purchase.id })];

      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (itemRepo.find as any).mockResolvedValue(items);

      const result = await service.findById(purchase.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(purchase.id);
      expect((result as any).items).toHaveLength(1);
    });

    it('should throw NotFoundException when purchase not found', async () => {
      (purchaseRepo.findOne as any).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 6.3: List purchases ─────────────────────────────────────────────────

  describe('findAll()', () => {
    function makeQueryBuilder(data: Purchase[], total: number): any {
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

    it('should return paginated list of purchases', async () => {
      const purchases = [makePurchase()];
      const qb = makeQueryBuilder(purchases, 1);
      (purchaseRepo.createQueryBuilder as any).mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply branchId filter when provided', async () => {
      const qb = makeQueryBuilder([], 0);
      (purchaseRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ branchId: 'branch-1' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'purchase.branchId = :branchId',
        { branchId: 'branch-1' },
      );
    });

    it('should apply status filter when provided', async () => {
      const qb = makeQueryBuilder([], 0);
      (purchaseRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ status: 'completed' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'purchase.status = :status',
        { status: 'completed' },
      );
    });

    it('should apply vendorName filter when provided', async () => {
      const qb = makeQueryBuilder([], 0);
      (purchaseRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ vendorName: 'Test' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'purchase.vendorName ILIKE :vendorName',
        { vendorName: '%Test%' },
      );
    });
  });

  // ─── 6.4: Update purchase ─────────────────────────────────────────────────

  describe('update()', () => {
    it('should update purchase fields', async () => {
      const purchase = makePurchase();
      const updated = { ...purchase, vendorName: 'New Vendor', notes: 'Updated notes' };

      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (purchaseRepo.save as any).mockResolvedValue(updated);

      const result = await service.update(purchase.id, {
        vendorName: 'New Vendor',
        notes: 'Updated notes',
      });

      expect(result.vendorName).toBe('New Vendor');
      expect(result.notes).toBe('Updated notes');
    });

    it('should throw NotFoundException when purchase not found', async () => {
      (purchaseRepo.findOne as any).mockResolvedValue(null);

      await expect(service.update('non-existent', { vendorName: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should convert purchaseDate string to Date object', async () => {
      const purchase = makePurchase();
      (purchaseRepo.findOne as any).mockResolvedValue(purchase);
      (purchaseRepo.save as any).mockResolvedValue({ ...purchase, purchaseDate: new Date('2025-06-01') });

      await service.update(purchase.id, { purchaseDate: '2025-06-01' });

      const saveCall = (purchaseRepo.save as any).mock.calls[0][0];
      expect(saveCall.purchaseDate).toBeInstanceOf(Date);
    });
  });
});
