import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { Brand } from './entities/brand.entity';
import { Model } from './entities/model.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { calculateWarrantyExpiry, ItemCondition } from '../../common/utils/business-logic';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a valid IMEI using Luhn algorithm */
function generateValidIMEI(base: string): string {
  const digits = base.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

const VALID_IMEI = generateValidIMEI('35999900000000');

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-uuid-1',
    imei: VALID_IMEI,
    imei2: null as any,
    status: 'available',
    condition: 'mint',
    purchasePrice: 10000,
    taxAmount: 0,
    totalCost: 10000,
    taxRate: 0,
    brandId: 'brand-1',
    modelId: 'model-1',
    branchId: 'branch-1',
    boxType: 'with_box',
    isOnline: false,
    birthdayOffer: false,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as InventoryItem;
}

// ─── Mock factories ──────────────────────────────────────────────────────────

function makeItemRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    count: jest.fn() as any,
    createQueryBuilder: jest.fn() as any,
  };
}

function makePhotoRepo(): any {
  return {
    findOne: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    count: jest.fn() as any,
    remove: jest.fn() as any,
  };
}

function makeDataSource(): any {
  return { query: (jest.fn() as any).mockResolvedValue([]) };
}

function makeConfigService(): any {
  return {
    get: (jest.fn() as any).mockImplementation((key: string) => {
      const map: Record<string, string> = {
        CDN_BASE_URL: 'https://cdn.example.com',
        AWS_REGION: 'ap-south-1',
        S3_BUCKET: 'test-bucket',
      };
      return map[key] ?? null;
    }),
  };
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('InventoryService', () => {
  let service: InventoryService;
  let itemRepo: any;
  let photoRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    itemRepo = makeItemRepo();
    photoRepo = makePhotoRepo();
    dataSource = makeDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
        { provide: getRepositoryToken(ItemPhoto), useValue: photoRepo },
        { provide: getRepositoryToken(Brand), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Model), useValue: { findOne: jest.fn() } },
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: makeConfigService() },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  // ─── 5.2: IMEI validation ──────────────────────────────────────────────────

  describe('create()', () => {
    const baseDto: CreateInventoryItemDto = {
      imei: VALID_IMEI,
      brandId: 'brand-1',
      modelId: 'model-1',
      boxType: 'with_box',
      condition: 'mint',
      purchasePrice: 10000,
      branchId: 'branch-1',
      taxAmount: 0,
      taxRate: 0,
    } as CreateInventoryItemDto;

    it('should reject an invalid IMEI (fails Luhn check)', async () => {
      const dto = { ...baseDto, imei: '123456789012345' };
      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'user-1')).rejects.toMatchObject({
        response: { code: 'IMEI_INVALID' },
      });
    });

    it('should reject a non-15-digit IMEI', async () => {
      const dto = { ...baseDto, imei: '12345' };
      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject a duplicate IMEI', async () => {
      (itemRepo.findOne as any).mockResolvedValue(makeItem());
      const dto = { ...baseDto, imei: VALID_IMEI };
      await expect(service.create(dto, 'user-1')).rejects.toThrow(ConflictException);
      await expect(service.create(dto, 'user-1')).rejects.toMatchObject({
        response: { code: 'IMEI_DUPLICATE' },
      });
    });

    it('should compute totalCost = purchasePrice + taxAmount', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      const savedItem = makeItem({ purchasePrice: 10000, taxAmount: 1800, totalCost: 11800 });
      (itemRepo.create as any).mockReturnValue(savedItem);
      (itemRepo.save as any).mockResolvedValue(savedItem);

      const dto = { ...baseDto, purchasePrice: 10000, taxAmount: 1800 };
      const result = await service.create(dto, 'user-1');

      expect(itemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalCost: 11800 }),
      );
      expect(result.totalCost).toBe(11800);
    });

    it('should set status to "available" on creation', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      const savedItem = makeItem({ status: 'available' });
      (itemRepo.create as any).mockReturnValue(savedItem);
      (itemRepo.save as any).mockResolvedValue(savedItem);

      await service.create(baseDto, 'user-1');

      expect(itemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'available' }),
      );
    });

    it('should set warrantyExpiry to 12 months for sealed_pack', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      const firstInvoiceDate = new Date('2024-01-01');
      const expectedExpiry = calculateWarrantyExpiry(firstInvoiceDate, ItemCondition.SEALED_PACK);

      const savedItem = makeItem({ warrantyExpiry: expectedExpiry! });
      (itemRepo.create as any).mockReturnValue(savedItem);
      (itemRepo.save as any).mockResolvedValue(savedItem);

      const dto = { ...baseDto, condition: 'sealed_pack', firstInvoiceDate: '2024-01-01' };
      await service.create(dto, 'user-1');

      expect(itemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ warrantyExpiry: expectedExpiry }),
      );
    });

    it('should set warrantyExpiry to 6 months for open_box', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      const firstInvoiceDate = new Date('2024-01-01');
      const expectedExpiry = calculateWarrantyExpiry(firstInvoiceDate, ItemCondition.OPEN_BOX);

      const savedItem = makeItem({ warrantyExpiry: expectedExpiry! });
      (itemRepo.create as any).mockReturnValue(savedItem);
      (itemRepo.save as any).mockResolvedValue(savedItem);

      const dto = { ...baseDto, condition: 'open_box', firstInvoiceDate: '2024-01-01' };
      await service.create(dto, 'user-1');

      expect(itemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ warrantyExpiry: expectedExpiry }),
      );
    });

    it('should set warrantyExpiry to null for mint condition', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      const savedItem = makeItem({ warrantyExpiry: undefined });
      (itemRepo.create as any).mockReturnValue(savedItem);
      (itemRepo.save as any).mockResolvedValue(savedItem);

      const dto = { ...baseDto, condition: 'mint', firstInvoiceDate: '2024-01-01' };
      await service.create(dto, 'user-1');

      expect(itemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ warrantyExpiry: null }),
      );
    });

    it('should create item successfully with valid IMEI and no duplicate', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      const savedItem = makeItem();
      (itemRepo.create as any).mockReturnValue(savedItem);
      (itemRepo.save as any).mockResolvedValue(savedItem);

      const result = await service.create(baseDto, 'user-1');
      expect(result).toBeDefined();
      expect(result.imei).toBe(VALID_IMEI);
    });
  });

  // ─── 5.6: Status state machine ────────────────────────────────────────────

  describe('update() - status transitions', () => {
    it('should allow valid transition: available → sold', async () => {
      const item = makeItem({ status: 'available' });
      (itemRepo.findOne as any).mockResolvedValue(item);
      (itemRepo.save as any).mockResolvedValue({ ...item, status: 'sold' });
      (dataSource.query as any).mockResolvedValue([]);

      const result = await service.update(item.id, { status: 'sold' } as any, 'user-1');
      expect(result.status).toBe('sold');
    });

    it('should allow valid transition: available → booked', async () => {
      const item = makeItem({ status: 'available' });
      (itemRepo.findOne as any).mockResolvedValue(item);
      (itemRepo.save as any).mockResolvedValue({ ...item, status: 'booked' });
      (dataSource.query as any).mockResolvedValue([]);

      const result = await service.update(item.id, { status: 'booked' } as any, 'user-1');
      expect(result.status).toBe('booked');
    });

    it('should reject invalid transition: available → returned', async () => {
      const item = makeItem({ status: 'available' });
      (itemRepo.findOne as any).mockResolvedValue(item);

      await expect(
        service.update(item.id, { status: 'returned' } as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(item.id, { status: 'returned' } as any, 'user-1'),
      ).rejects.toMatchObject({ response: { code: 'INVALID_STATUS_TRANSITION' } });
    });

    it('should reject invalid transition: sold → available', async () => {
      const item = makeItem({ status: 'sold' });
      (itemRepo.findOne as any).mockResolvedValue(item);

      await expect(
        service.update(item.id, { status: 'available' } as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition: scrapped → available', async () => {
      const item = makeItem({ status: 'scrapped' });
      (itemRepo.findOne as any).mockResolvedValue(item);

      await expect(
        service.update(item.id, { status: 'available' } as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition: sold → returned', async () => {
      const item = makeItem({ status: 'sold' });
      (itemRepo.findOne as any).mockResolvedValue(item);
      (itemRepo.save as any).mockResolvedValue({ ...item, status: 'returned' });
      (dataSource.query as any).mockResolvedValue([]);

      const result = await service.update(item.id, { status: 'returned' } as any, 'user-1');
      expect(result.status).toBe('returned');
    });

    it('should allow valid transition: returned → available', async () => {
      const item = makeItem({ status: 'returned' });
      (itemRepo.findOne as any).mockResolvedValue(item);
      (itemRepo.save as any).mockResolvedValue({ ...item, status: 'available' });
      (dataSource.query as any).mockResolvedValue([]);

      const result = await service.update(item.id, { status: 'available' } as any, 'user-1');
      expect(result.status).toBe('available');
    });
  });

  // ─── 5.4: findById / findByImei ───────────────────────────────────────────

  describe('findById()', () => {
    it('should return item when found', async () => {
      const item = makeItem();
      (itemRepo.findOne as any).mockResolvedValue(item);
      const result = await service.findById(item.id);
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when item not found', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByImei()', () => {
    it('should return item when found by IMEI', async () => {
      const item = makeItem();
      (itemRepo.findOne as any).mockResolvedValue(item);
      const result = await service.findByImei(VALID_IMEI);
      expect(result.imei).toBe(VALID_IMEI);
    });

    it('should throw NotFoundException when IMEI not found', async () => {
      (itemRepo.findOne as any).mockResolvedValue(null);
      await expect(service.findByImei('999999999999999')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 5.10: Price suggestion ───────────────────────────────────────────────

  describe('getPriceSuggestion()', () => {
    it('should return median and count from query result', async () => {
      (dataSource.query as any).mockResolvedValue([{ median: '15000.00', count: '5' }]);
      const result = await service.getPriceSuggestion('model-1', 'mint');
      expect(result.median).toBe(15000);
      expect(result.count).toBe(5);
    });

    it('should return null median when no sales data', async () => {
      (dataSource.query as any).mockResolvedValue([{ median: null, count: '0' }]);
      const result = await service.getPriceSuggestion('model-1', 'mint');
      expect(result.median).toBeNull();
      expect(result.count).toBe(0);
    });

    it('should handle query failure gracefully', async () => {
      (dataSource.query as any).mockRejectedValue(new Error('DB error'));
      const result = await service.getPriceSuggestion('model-1', 'mint');
      expect(result.median).toBeNull();
      expect(result.count).toBe(0);
    });
  });

  // ─── 5.11: City stock ─────────────────────────────────────────────────────

  describe('getCityStock()', () => {
    it('should return branch availability grouped by city', async () => {
      (dataSource.query as any).mockResolvedValue([
        { branchId: 'branch-1', city: 'Mumbai', count: '10' },
        { branchId: 'branch-2', city: 'Delhi', count: '5' },
      ]);
      const result = await service.getCityStock('model-1');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ branchId: 'branch-1', city: 'Mumbai', count: 10 });
      expect(result[1]).toEqual({ branchId: 'branch-2', city: 'Delhi', count: 5 });
    });

    it('should return empty array when no stock', async () => {
      (dataSource.query as any).mockResolvedValue([]);
      const result = await service.getCityStock('model-1');
      expect(result).toEqual([]);
    });

    it('should handle query failure gracefully', async () => {
      (dataSource.query as any).mockRejectedValue(new Error('DB error'));
      const result = await service.getCityStock('model-1');
      expect(result).toEqual([]);
    });
  });

  // ─── 5.7: Photos ──────────────────────────────────────────────────────────

  describe('addPhoto()', () => {
    it('should add a photo when under the 10-photo limit', async () => {
      const item = makeItem();
      (itemRepo.findOne as any).mockResolvedValue(item);
      (photoRepo.count as any).mockResolvedValue(3);
      const photo = {
        id: 'photo-1',
        itemId: item.id,
        s3Key: 'inventory/item-1/photo.jpg',
        cdnUrl: 'https://cdn.example.com/inventory/item-1/photo.jpg',
        sortOrder: 0,
      };
      (photoRepo.create as any).mockReturnValue(photo);
      (photoRepo.save as any).mockResolvedValue(photo);

      const result = await service.addPhoto(item.id, 'inventory/item-1/photo.jpg', 0);
      expect(result.s3Key).toBe('inventory/item-1/photo.jpg');
    });

    it('should reject adding photo when 10 photos already exist', async () => {
      const item = makeItem();
      (itemRepo.findOne as any).mockResolvedValue(item);
      (photoRepo.count as any).mockResolvedValue(10);

      await expect(service.addPhoto(item.id, 'some-key', 0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePhoto()', () => {
    it('should delete photo when found', async () => {
      const item = makeItem();
      (itemRepo.findOne as any).mockResolvedValue(item);
      const photo = { id: 'photo-1', itemId: item.id };
      (photoRepo.findOne as any).mockResolvedValue(photo);
      (photoRepo.remove as any).mockResolvedValue(photo);

      await expect(service.deletePhoto(item.id, 'photo-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException when photo not found', async () => {
      const item = makeItem();
      (itemRepo.findOne as any).mockResolvedValue(item);
      (photoRepo.findOne as any).mockResolvedValue(null);

      await expect(service.deletePhoto(item.id, 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 5.8: Toggle online ───────────────────────────────────────────────────

  describe('toggleOnline()', () => {
    it('should toggle isOnline from false to true', async () => {
      const item = makeItem({ isOnline: false });
      (itemRepo.findOne as any).mockResolvedValue(item);
      (itemRepo.save as any).mockResolvedValue({ ...item, isOnline: true });

      const result = await service.toggleOnline(item.id, 'user-1');
      expect(result.isOnline).toBe(true);
    });

    it('should toggle isOnline from true to false', async () => {
      const item = makeItem({ isOnline: true });
      (itemRepo.findOne as any).mockResolvedValue(item);
      (itemRepo.save as any).mockResolvedValue({ ...item, isOnline: false });

      const result = await service.toggleOnline(item.id, 'user-1');
      expect(result.isOnline).toBe(false);
    });
  });
});
