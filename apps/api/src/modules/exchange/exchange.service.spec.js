import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeDevice } from './entities/exchange-device.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { calculateExchangePrice } from '../../common/utils/business-logic';
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeExchange(overrides = {}) {
    return {
        id: 'exchange-uuid-1',
        clientId: 'client-1',
        saleId: null,
        brandId: 'brand-1',
        modelId: 'model-1',
        imei: '359999000000001',
        colour: 'Black',
        storage: '128GB',
        condition: 'good',
        batteryHealth: 85,
        conditionNotes: null,
        exchangePrice: 8000,
        photos: null,
        kycVerified: false,
        addedToInventory: false,
        inventoryItemId: null,
        createdBy: null,
        createdById: 'user-1',
        createdAt: new Date(),
        ...overrides,
    };
}
function makeInventoryItem(overrides = {}) {
    return {
        id: 'item-uuid-1',
        imei: '359999000000001',
        condition: 'good',
        status: 'available',
        branchId: 'branch-1',
        purchasePrice: 8000,
        totalCost: 8000,
        taxAmount: 0,
        taxRate: 0,
        boxType: 'without_box',
        ...overrides,
    };
}
// ─── Mock factories ──────────────────────────────────────────────────────────
function makeExchangeRepo() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
        manager: {
            createQueryBuilder: jest.fn(),
        },
    };
}
function makeItemRepo() {
    return {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
}
// ─── Test suite ──────────────────────────────────────────────────────────────
describe('ExchangeService', () => {
    let service;
    let exchangeRepo;
    let itemRepo;
    beforeEach(async () => {
        exchangeRepo = makeExchangeRepo();
        itemRepo = makeItemRepo();
        const module = await Test.createTestingModule({
            providers: [
                ExchangeService,
                { provide: getRepositoryToken(ExchangeDevice), useValue: exchangeRepo },
                { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
            ],
        }).compile();
        service = module.get(ExchangeService);
    });
    // ─── 10.2: Create exchange ────────────────────────────────────────────────
    describe('create()', () => {
        const baseDto = {
            clientId: 'client-1',
            brandId: 'brand-1',
            modelId: 'model-1',
            imei: '359999000000001',
            condition: 'good',
            batteryHealth: 85,
            exchangePrice: 8000,
        };
        it('should create an exchange with valid data', async () => {
            const savedExchange = makeExchange();
            exchangeRepo.create.mockReturnValue(savedExchange);
            exchangeRepo.save.mockResolvedValue(savedExchange);
            const result = await service.create(baseDto, 'user-1');
            expect(result).toBeDefined();
            expect(result.exchangePrice).toBe(8000);
            expect(exchangeRepo.save).toHaveBeenCalled();
        });
        it('should set addedToInventory to false on creation', async () => {
            const savedExchange = makeExchange({ addedToInventory: false });
            exchangeRepo.create.mockReturnValue(savedExchange);
            exchangeRepo.save.mockResolvedValue(savedExchange);
            await service.create(baseDto, 'user-1');
            expect(exchangeRepo.create).toHaveBeenCalledWith(expect.objectContaining({ addedToInventory: false }));
        });
        it('should store condition assessment notes', async () => {
            const conditionNotes = { screen: 'good', body: 'scratched', battery: 'ok', buttons: 'ok', camera: 'ok' };
            const dto = { ...baseDto, conditionNotes };
            const savedExchange = makeExchange({ conditionNotes });
            exchangeRepo.create.mockReturnValue(savedExchange);
            exchangeRepo.save.mockResolvedValue(savedExchange);
            await service.create(dto, 'user-1');
            expect(exchangeRepo.create).toHaveBeenCalledWith(expect.objectContaining({ conditionNotes }));
        });
    });
    // ─── 10.5: Get exchange by ID ─────────────────────────────────────────────
    describe('findById()', () => {
        it('should return exchange when found', async () => {
            const exchange = makeExchange();
            exchangeRepo.findOne.mockResolvedValue(exchange);
            const result = await service.findById('exchange-uuid-1');
            expect(result).toBeDefined();
            expect(result.id).toBe('exchange-uuid-1');
        });
        it('should throw NotFoundException when exchange not found', async () => {
            exchangeRepo.findOne.mockResolvedValue(null);
            await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
    // ─── 10.5: List exchanges ─────────────────────────────────────────────────
    describe('findAll()', () => {
        function makeQueryBuilder(data, total) {
            const qb = {
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([data, total]),
            };
            return qb;
        }
        it('should return paginated list', async () => {
            const exchanges = [makeExchange()];
            const qb = makeQueryBuilder(exchanges, 1);
            exchangeRepo.createQueryBuilder.mockReturnValue(qb);
            const result = await service.findAll({ page: 1, limit: 20 });
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
        it('should apply clientId filter', async () => {
            const qb = makeQueryBuilder([], 0);
            exchangeRepo.createQueryBuilder.mockReturnValue(qb);
            await service.findAll({ clientId: 'client-1' });
            expect(qb.andWhere).toHaveBeenCalledWith('exchange.clientId = :clientId', { clientId: 'client-1' });
        });
        it('should apply addedToInventory filter', async () => {
            const qb = makeQueryBuilder([], 0);
            exchangeRepo.createQueryBuilder.mockReturnValue(qb);
            await service.findAll({ addedToInventory: false });
            expect(qb.andWhere).toHaveBeenCalledWith('exchange.addedToInventory = :addedToInventory', { addedToInventory: false });
        });
    });
    // ─── 10.5: Update exchange ────────────────────────────────────────────────
    describe('update()', () => {
        it('should update exchange fields', async () => {
            const exchange = makeExchange();
            const updated = { ...exchange, exchangePrice: 9000 };
            exchangeRepo.findOne.mockResolvedValue(exchange);
            exchangeRepo.save.mockResolvedValue(updated);
            const result = await service.update('exchange-uuid-1', { exchangePrice: 9000 });
            expect(result.exchangePrice).toBe(9000);
        });
        it('should throw NotFoundException when exchange not found', async () => {
            exchangeRepo.findOne.mockResolvedValue(null);
            await expect(service.update('non-existent', { exchangePrice: 9000 })).rejects.toThrow(NotFoundException);
        });
    });
    // ─── 10.3: Price suggestion ───────────────────────────────────────────────
    describe('suggestPrice()', () => {
        it('should return calculated price using formula', async () => {
            const result = await service.suggestPrice({
                basePrice: 10000,
                batteryHealth: 85,
                monthsSinceFirstInvoice: 6,
            });
            // batteryHealth >= 80 → factor 1.0, months <= 12 → factor 1.0
            expect(result.suggestedPrice).toBe(10000);
            expect(result.basePrice).toBe(10000);
        });
        it('should apply battery factor for health < 80', async () => {
            const result = await service.suggestPrice({
                basePrice: 10000,
                batteryHealth: 70,
                monthsSinceFirstInvoice: 6,
            });
            // batteryHealth 60-79 → factor 0.85
            expect(result.suggestedPrice).toBe(8500);
        });
        it('should apply age factor for months > 12', async () => {
            const result = await service.suggestPrice({
                basePrice: 10000,
                batteryHealth: 85,
                monthsSinceFirstInvoice: 18,
            });
            // months 13-24 → factor 0.80
            expect(result.suggestedPrice).toBe(8000);
        });
        it('should apply both factors for old device with low battery', async () => {
            const result = await service.suggestPrice({
                basePrice: 10000,
                batteryHealth: 50,
                monthsSinceFirstInvoice: 30,
            });
            // batteryHealth < 60 → 0.70, months > 24 → 0.65
            const expected = calculateExchangePrice(10000, 50, 30);
            expect(result.suggestedPrice).toBe(expected);
            expect(result.suggestedPrice).toBeLessThanOrEqual(10000);
            expect(result.suggestedPrice).toBeGreaterThanOrEqual(0);
        });
        it('should always return price between 0 and basePrice', async () => {
            const testCases = [
                { basePrice: 5000, batteryHealth: 30, monthsSinceFirstInvoice: 36 },
                { basePrice: 20000, batteryHealth: 100, monthsSinceFirstInvoice: 0 },
                { basePrice: 0, batteryHealth: 80, monthsSinceFirstInvoice: 12 },
            ];
            for (const tc of testCases) {
                const result = await service.suggestPrice(tc);
                expect(result.suggestedPrice).toBeGreaterThanOrEqual(0);
                expect(result.suggestedPrice).toBeLessThanOrEqual(tc.basePrice);
            }
        });
    });
    // ─── 10.4: Add to inventory ───────────────────────────────────────────────
    describe('addToInventory()', () => {
        it('should create inventory item and update exchange record', async () => {
            const exchange = makeExchange({ addedToInventory: false });
            const newItem = makeInventoryItem({ id: 'new-item-uuid' });
            exchangeRepo.findOne
                .mockResolvedValueOnce(exchange) // first call: find exchange
                .mockResolvedValueOnce({ ...exchange, addedToInventory: true, inventoryItemId: 'new-item-uuid' }); // second call: findById
            itemRepo.create.mockReturnValue(newItem);
            itemRepo.save.mockResolvedValue(newItem);
            exchangeRepo.save.mockResolvedValue({ ...exchange, addedToInventory: true, inventoryItemId: 'new-item-uuid' });
            const result = await service.addToInventory('exchange-uuid-1', { branchId: 'branch-1' });
            expect(itemRepo.save).toHaveBeenCalled();
            expect(exchangeRepo.save).toHaveBeenCalledWith(expect.objectContaining({ addedToInventory: true }));
        });
        it('should throw BadRequestException if already added to inventory', async () => {
            const exchange = makeExchange({ addedToInventory: true });
            exchangeRepo.findOne.mockResolvedValue(exchange);
            await expect(service.addToInventory('exchange-uuid-1', { branchId: 'branch-1' })).rejects.toThrow(BadRequestException);
            await expect(service.addToInventory('exchange-uuid-1', { branchId: 'branch-1' })).rejects.toMatchObject({ response: { code: 'ALREADY_IN_INVENTORY' } });
        });
        it('should throw NotFoundException when exchange not found', async () => {
            exchangeRepo.findOne.mockResolvedValue(null);
            await expect(service.addToInventory('non-existent', { branchId: 'branch-1' })).rejects.toThrow(NotFoundException);
        });
        it('should use exchangePrice as purchasePrice when not provided', async () => {
            const exchange = makeExchange({ addedToInventory: false, exchangePrice: 7500 });
            const newItem = makeInventoryItem({ purchasePrice: 7500, totalCost: 7500 });
            exchangeRepo.findOne
                .mockResolvedValueOnce(exchange)
                .mockResolvedValueOnce({ ...exchange, addedToInventory: true });
            itemRepo.create.mockReturnValue(newItem);
            itemRepo.save.mockResolvedValue(newItem);
            exchangeRepo.save.mockResolvedValue({ ...exchange, addedToInventory: true });
            await service.addToInventory('exchange-uuid-1', { branchId: 'branch-1' });
            expect(itemRepo.create).toHaveBeenCalledWith(expect.objectContaining({ purchasePrice: 7500 }));
        });
    });
    // ─── 10.6: Price guide ────────────────────────────────────────────────────
    describe('getPriceGuide()', () => {
        it('should return empty array when table does not exist', async () => {
            const mockQb = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockRejectedValue(new Error('relation does not exist')),
            };
            exchangeRepo.manager.createQueryBuilder.mockReturnValue(mockQb);
            const result = await service.getPriceGuide();
            expect(result).toEqual([]);
        });
        it('should return price guide data when table exists', async () => {
            const priceGuideData = [
                { modelId: 'model-1', condition: 'good', basePrice: 8000 },
                { modelId: 'model-1', condition: 'mint', basePrice: 10000 },
            ];
            const mockQb = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue(priceGuideData),
            };
            exchangeRepo.manager.createQueryBuilder.mockReturnValue(mockQb);
            const result = await service.getPriceGuide();
            expect(result).toHaveLength(2);
        });
    });
});
//# sourceMappingURL=exchange.service.spec.js.map