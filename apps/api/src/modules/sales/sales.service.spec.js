import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fc from 'fast-check';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from './entities/payment.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';
import { validatePaymentSplits } from '../../common/utils/business-logic';
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeInventoryItem(overrides = {}) {
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
    };
}
function makeSale(overrides = {}) {
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
    };
}
function makeSaleItem(overrides = {}) {
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
    };
}
// ─── Mock factories ──────────────────────────────────────────────────────────
function makeSaleRepo() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
}
function makeSaleItemRepo() {
    return {
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
}
function makePaymentRepo() {
    return {
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
}
function makeItemRepo() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
    };
}
function makeBranchRepo() {
    return {
        findOne: jest.fn(),
    };
}
function makeDataSource(_overrides = {}) {
    const qr = {
        connect: jest.fn().mockImplementation(() => Promise.resolve()),
        startTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
        commitTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
        rollbackTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
        release: jest.fn().mockImplementation(() => Promise.resolve()),
        manager: {
            create: jest.fn((Entity, data) => ({ ...data })),
            save: jest.fn((_Entity, data) => Promise.resolve({ id: 'new-id', ...data })),
            update: jest.fn().mockImplementation(() => Promise.resolve({ affected: 1 })),
            query: jest.fn().mockImplementation(() => Promise.resolve([])),
        },
    };
    return {
        createQueryRunner: jest.fn().mockReturnValue(qr),
    };
}
function makeConfigService() {
    return {
        get: jest.fn().mockReturnValue('redis://localhost:6379'),
    };
}
// ─── Mock Redis ──────────────────────────────────────────────────────────────
const mockRedis = {
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
    let service;
    let saleRepo;
    let saleItemRepo;
    let paymentRepo;
    let itemRepo;
    let branchRepo;
    let dataSource;
    beforeEach(async () => {
        jest.clearAllMocks();
        saleRepo = makeSaleRepo();
        saleItemRepo = makeSaleItemRepo();
        paymentRepo = makePaymentRepo();
        itemRepo = makeItemRepo();
        branchRepo = makeBranchRepo();
        dataSource = makeDataSource();
        const module = await Test.createTestingModule({
            providers: [
                SalesService,
                { provide: getRepositoryToken(Sale), useValue: saleRepo },
                { provide: getRepositoryToken(SaleItem), useValue: saleItemRepo },
                { provide: getRepositoryToken(Payment), useValue: paymentRepo },
                { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
                { provide: getRepositoryToken(Branch), useValue: branchRepo },
                { provide: DataSource, useValue: dataSource },
                { provide: ConfigService, useValue: makeConfigService() },
            ],
        }).compile();
        service = module.get(SalesService);
        // Inject mock redis directly to avoid real connection
        service.redisClient = mockRedis;
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
            await expect(service.create({ ...baseDto, payments: [{ method: 'cash', amount: 10000 }] }, 'user-1', 'shop_sales')).rejects.toThrow(BadRequestException);
        });
        it('should reject sale when item not found', async () => {
            itemRepo.find.mockResolvedValue([]);
            await expect(service.create({ ...baseDto, payments: [{ method: 'cash', amount: 10000 }] }, 'user-1', 'shop_sales')).rejects.toThrow(NotFoundException);
        });
    });
    // ─── 7.5: Discount authorization ─────────────────────────────────────────
    describe('create() — discount authorization', () => {
        function makeSaleDto(discountAmount, payments) {
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
        function makeQueryBuilder(data, total) {
            const qb = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([data, total]),
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
            expect(qr.manager.update).toHaveBeenCalledWith(InventoryItem, 'item-uuid-1', { status: 'available' });
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
            expect(mockRedis.set).toHaveBeenCalledWith('pos:lock:item-uuid-1', '1', { EX: 900 });
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
            fc.assert(fc.property(
            // Generate 1-5 positive integer amounts (avoids float precision issues)
            fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 1, maxLength: 5 }), (amounts) => {
                const total = amounts.reduce((a, b) => a + b, 0);
                const splits = amounts.map((amount) => ({ amount, method: 'cash' }));
                // When splits exactly sum to total, validation must pass
                return validatePaymentSplits(splits, total) === true;
            }), { numRuns: 200 });
        });
        it('should hold: splits sum !== total (by >0.01) implies validation fails', () => {
            fc.assert(fc.property(fc.integer({ min: 1, max: 10000 }), fc.integer({ min: 1, max: 1000 }), (total, delta) => {
                // Splits that are clearly off by more than 0.01
                const splits = [{ amount: total + delta + 1, method: 'cash' }];
                return validatePaymentSplits(splits, total) === false;
            }), { numRuns: 200 });
        });
        it('should hold: tolerance of 0.01 is respected', () => {
            fc.assert(fc.property(fc.float({ min: 1, max: 10000, noNaN: true }), (total) => {
                // Within tolerance
                const withinTolerance = [{ amount: total + 0.005, method: 'cash' }];
                const outsideTolerance = [{ amount: total + 0.02, method: 'cash' }];
                return (validatePaymentSplits(withinTolerance, total) === true &&
                    validatePaymentSplits(outsideTolerance, total) === false);
            }), { numRuns: 200 });
        });
        it('should hold: multi-split completeness invariant', () => {
            fc.assert(fc.property(
            // Generate 2-4 split amounts that sum to a known total
            fc.array(fc.integer({ min: 100, max: 5000 }), { minLength: 2, maxLength: 4 }), (amounts) => {
                const total = amounts.reduce((a, b) => a + b, 0);
                const splits = amounts.map((amount) => ({ amount, method: 'cash' }));
                return validatePaymentSplits(splits, total) === true;
            }), { numRuns: 300 });
        });
    });
});
//# sourceMappingURL=sales.service.spec.js.map