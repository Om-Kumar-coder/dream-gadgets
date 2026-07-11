import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AccessoryService } from './accessory.service';
import { Accessory } from './entities/accessory.entity';
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeAccessory(overrides = {}) {
    return {
        id: 'acc-uuid-1',
        sku: 'CHG-001',
        name: 'Fast Charger 20W',
        description: 'USB-C fast charger',
        brandId: 'brand-1',
        modelId: null,
        category: 'charger',
        purchasePrice: 500,
        sellingPrice: 799,
        wholesalePrice: 600,
        stockQuantity: 50,
        reorderLevel: 10,
        status: 'available',
        isOnline: true,
        hsnCode: '85044010',
        taxRate: 18,
        notes: null,
        branchId: 'branch-1',
        specs: null,
        photos: null,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
function makeRepo() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
        query: jest.fn(),
    };
}
// ─── Test suite ──────────────────────────────────────────────────────────────
describe('AccessoryService', () => {
    let service;
    let accessoryRepo;
    beforeEach(async () => {
        accessoryRepo = makeRepo();
        const module = await Test.createTestingModule({
            providers: [
                AccessoryService,
                { provide: getRepositoryToken(Accessory), useValue: accessoryRepo },
            ],
        }).compile();
        service = module.get(AccessoryService);
    });
    // ─── create() ──────────────────────────────────────────────────────────────
    describe('create()', () => {
        const baseDto = {
            sku: 'CHG-001',
            name: 'Fast Charger 20W',
            category: 'charger',
            purchasePrice: 500,
        };
        it('should create an accessory with valid DTO', async () => {
            accessoryRepo.findOne.mockResolvedValue(null);
            const saved = makeAccessory();
            accessoryRepo.create.mockReturnValue(saved);
            accessoryRepo.save.mockResolvedValue(saved);
            const result = await service.create(baseDto, 'user-1');
            expect(result).toBeDefined();
            expect(result.sku).toBe('CHG-001');
            expect(accessoryRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                sku: 'CHG-001',
                createdById: 'user-1',
                status: 'available',
            }));
            expect(accessoryRepo.save).toHaveBeenCalled();
        });
        it('should reject duplicate SKU', async () => {
            accessoryRepo.findOne.mockResolvedValue(makeAccessory());
            await expect(service.create(baseDto, 'user-1')).rejects.toThrow(ConflictException);
            await expect(service.create(baseDto, 'user-1')).rejects.toMatchObject({
                response: { code: 'SKU_DUPLICATE' },
            });
        });
    });
    // ─── findAll() ────────────────────────────────────────────────────────────
    describe('findAll()', () => {
        function makeQueryBuilder(data, total) {
            const qb = {
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([data, total]),
            };
            return qb;
        }
        it('should return paginated list of accessories', async () => {
            const accessories = [makeAccessory()];
            const qb = makeQueryBuilder(accessories, 1);
            accessoryRepo.createQueryBuilder.mockReturnValue(qb);
            const result = await service.findAll({ page: 1, limit: 20 });
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
        it('should apply category filter', async () => {
            const qb = makeQueryBuilder([], 0);
            accessoryRepo.createQueryBuilder.mockReturnValue(qb);
            await service.findAll({ category: 'charger' });
            expect(qb.andWhere).toHaveBeenCalledWith('acc.category = :category', { category: 'charger' });
        });
        it('should apply status filter', async () => {
            const qb = makeQueryBuilder([], 0);
            accessoryRepo.createQueryBuilder.mockReturnValue(qb);
            await service.findAll({ status: 'available' });
            expect(qb.andWhere).toHaveBeenCalledWith('acc.status = :status', { status: 'available' });
        });
        it('should apply search across sku, name, and brand name', async () => {
            const qb = makeQueryBuilder([], 0);
            accessoryRepo.createQueryBuilder.mockReturnValue(qb);
            await service.findAll({ search: 'charger' });
            expect(qb.andWhere).toHaveBeenCalledWith('(acc.sku ILIKE :search OR acc.name ILIKE :search OR brand.name ILIKE :search)', { search: '%charger%' });
        });
        it('should apply price range filters', async () => {
            const qb = makeQueryBuilder([], 0);
            accessoryRepo.createQueryBuilder.mockReturnValue(qb);
            await service.findAll({ minPrice: 100, maxPrice: 1000 });
            expect(qb.andWhere).toHaveBeenCalledWith('acc.sellingPrice >= :minPrice', { minPrice: 100 });
            expect(qb.andWhere).toHaveBeenCalledWith('acc.sellingPrice <= :maxPrice', { maxPrice: 1000 });
        });
    });
    // ─── findById() ──────────────────────────────────────────────────────────
    describe('findById()', () => {
        it('should return accessory when found', async () => {
            const acc = makeAccessory();
            accessoryRepo.findOne.mockResolvedValue(acc);
            const result = await service.findById('acc-uuid-1');
            expect(result).toBeDefined();
            expect(result.id).toBe('acc-uuid-1');
            expect(accessoryRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'acc-uuid-1' },
                relations: ['brand', 'model', 'branch'],
            });
        });
        it('should throw NotFoundException when not found', async () => {
            accessoryRepo.findOne.mockResolvedValue(null);
            await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
    // ─── findBySku() ─────────────────────────────────────────────────────────
    describe('findBySku()', () => {
        it('should return accessory when found by SKU', async () => {
            const acc = makeAccessory();
            accessoryRepo.findOne.mockResolvedValue(acc);
            const result = await service.findBySku('CHG-001');
            expect(result.sku).toBe('CHG-001');
        });
        it('should throw NotFoundException when SKU not found', async () => {
            accessoryRepo.findOne.mockResolvedValue(null);
            await expect(service.findBySku('NON-EXISTENT')).rejects.toThrow(NotFoundException);
        });
    });
    // ─── update() ────────────────────────────────────────────────────────────
    describe('update()', () => {
        it('should update accessory fields', async () => {
            const acc = makeAccessory();
            accessoryRepo.findOne.mockResolvedValue(acc);
            accessoryRepo.save.mockResolvedValue({ ...acc, name: 'Updated Charger' });
            const result = await service.update('acc-uuid-1', { name: 'Updated Charger' });
            expect(result.name).toBe('Updated Charger');
            expect(accessoryRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Charger' }));
        });
        it('should reject duplicate SKU when changing SKU', async () => {
            const acc = makeAccessory({ sku: 'CHG-001' });
            const existingWithNewSku = makeAccessory({ id: 'other-id', sku: 'CHG-002' });
            accessoryRepo.findOne
                .mockResolvedValueOnce(acc) // first call: findById
                .mockResolvedValueOnce(existingWithNewSku); // second call: duplicate check
            await expect(service.update('acc-uuid-1', { sku: 'CHG-002' })).rejects.toThrow(ConflictException);
        });
        it('should allow updating SKU to the same value', async () => {
            const acc = makeAccessory({ sku: 'CHG-001' });
            accessoryRepo.findOne.mockResolvedValue(acc);
            accessoryRepo.save.mockResolvedValue(acc);
            const result = await service.update('acc-uuid-1', { sku: 'CHG-001' });
            expect(result).toBeDefined();
            // Should NOT have checked for duplicate since SKU didn't change
            expect(accessoryRepo.findOne).toHaveBeenCalledTimes(1);
        });
        it('should throw NotFoundException when accessory not found', async () => {
            accessoryRepo.findOne.mockResolvedValue(null);
            await expect(service.update('non-existent', { name: 'test' })).rejects.toThrow(NotFoundException);
        });
    });
    // ─── adjustStock() ───────────────────────────────────────────────────────
    describe('adjustStock()', () => {
        it('should increase stock with positive quantity', async () => {
            const acc = makeAccessory({ stockQuantity: 50 });
            accessoryRepo.findOne.mockResolvedValue(acc);
            accessoryRepo.save.mockResolvedValue({ ...acc, stockQuantity: 60 });
            const result = await service.adjustStock('acc-uuid-1', 10, 'restock from vendor');
            expect(result.stockQuantity).toBe(60);
        });
        it('should decrease stock with negative quantity', async () => {
            const acc = makeAccessory({ stockQuantity: 50 });
            accessoryRepo.findOne.mockResolvedValue(acc);
            accessoryRepo.save.mockResolvedValue({ ...acc, stockQuantity: 40 });
            const result = await service.adjustStock('acc-uuid-1', -10, 'sold to customer');
            expect(result.stockQuantity).toBe(40);
        });
        it('should reject adjustment that would make stock negative', async () => {
            const acc = makeAccessory({ stockQuantity: 5 });
            accessoryRepo.findOne.mockResolvedValue(acc);
            await expect(service.adjustStock('acc-uuid-1', -10, 'sale')).rejects.toThrow(BadRequestException);
            await expect(service.adjustStock('acc-uuid-1', -10, 'sale')).rejects.toMatchObject({
                response: { code: 'INSUFFICIENT_STOCK' },
            });
        });
        it('should throw NotFoundException when accessory not found', async () => {
            accessoryRepo.findOne.mockResolvedValue(null);
            await expect(service.adjustStock('non-existent', 5, 'test')).rejects.toThrow(NotFoundException);
        });
    });
    // ─── toggleOnline() ──────────────────────────────────────────────────────
    describe('toggleOnline()', () => {
        it('should toggle from false to true', async () => {
            const acc = makeAccessory({ isOnline: false });
            accessoryRepo.findOne.mockResolvedValue(acc);
            accessoryRepo.save.mockResolvedValue({ ...acc, isOnline: true });
            const result = await service.toggleOnline('acc-uuid-1');
            expect(result.isOnline).toBe(true);
        });
        it('should toggle from true to false', async () => {
            const acc = makeAccessory({ isOnline: true });
            accessoryRepo.findOne.mockResolvedValue(acc);
            accessoryRepo.save.mockResolvedValue({ ...acc, isOnline: false });
            const result = await service.toggleOnline('acc-uuid-1');
            expect(result.isOnline).toBe(false);
        });
    });
    // ─── getLowStockAlerts() ─────────────────────────────────────────────────
    describe('getLowStockAlerts()', () => {
        it('should return accessories with stock below reorder level', async () => {
            const lowStockItems = [
                makeAccessory({ stockQuantity: 3, reorderLevel: 10 }),
                makeAccessory({ stockQuantity: 5, reorderLevel: 10 }),
            ];
            accessoryRepo.query.mockResolvedValue(lowStockItems);
            const result = await service.getLowStockAlerts();
            expect(result).toHaveLength(2);
            expect(accessoryRepo.query).toHaveBeenCalled();
        });
        it('should return empty array when all stock is sufficient', async () => {
            accessoryRepo.query.mockResolvedValue([]);
            const result = await service.getLowStockAlerts();
            expect(result).toEqual([]);
        });
    });
});
//# sourceMappingURL=accessory.service.spec.js.map