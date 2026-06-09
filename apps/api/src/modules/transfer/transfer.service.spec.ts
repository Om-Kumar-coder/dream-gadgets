import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransferService } from './transfer.service';
import { EventService } from '../../common/events/event.service';
import { StockTransfer } from './entities/stock-transfer.entity';
import { StockTransferItem } from './entities/stock-transfer-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Branch } from '../auth/entities/user.entity';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-uuid-1',
    imei: '359999000000001',
    condition: 'mint',
    status: 'available',
    branchId: 'branch-from',
    purchasePrice: 10000,
    totalCost: 10000,
    taxAmount: 0,
    ...overrides,
  } as InventoryItem;
}

function makeTransfer(overrides: Partial<StockTransfer> = {}): StockTransfer {
  return {
    id: 'transfer-uuid-1',
    transferNumber: 'TRF-FROM-2025-123456',
    fromBranchId: 'branch-from',
    toBranchId: 'branch-to',
    status: 'initiated',
    notes: null,
    initiatedById: 'user-1',
    receivedById: null,
    initiatedAt: new Date(),
    receivedAt: null,
    rejectionReason: null,
    items: [],
    createdAt: new Date(),
    ...overrides,
  } as StockTransfer;
}

function makeTransferItem(overrides: Partial<StockTransferItem> = {}): StockTransferItem {
  return {
    id: 'ti-uuid-1',
    transferId: 'transfer-uuid-1',
    itemId: 'item-uuid-1',
    imei: '359999000000001',
    status: 'pending',
    notes: null,
    ...overrides,
  } as StockTransferItem;
}

function makeBranch(id: string, code: string): Branch {
  return { id, code, name: `Branch ${code}`, isActive: true } as Branch;
}

// ─── Mock factories ──────────────────────────────────────────────────────────

function makeQueryRunner(): any {
  return {
    connect: jest.fn() as any,
    startTransaction: jest.fn() as any,
    commitTransaction: jest.fn() as any,
    rollbackTransaction: jest.fn() as any,
    release: jest.fn() as any,
    manager: {
      create: jest.fn() as any,
      save: jest.fn() as any,
      update: jest.fn() as any,
    },
  };
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('TransferService', () => {
  let service: TransferService;
  let transferRepo: any;
  let transferItemRepo: any;
  let itemRepo: any;
  let branchRepo: any;
  let dataSource: any;
  let queryRunner: any;

  beforeEach(async () => {
    queryRunner = makeQueryRunner();

    transferRepo = {
      findOne: jest.fn() as any,
      createQueryBuilder: jest.fn() as any,
    };
    transferItemRepo = {
      findOne: jest.fn() as any,
    };
    itemRepo = {
      find: jest.fn() as any,
      findOne: jest.fn() as any,
    };
    branchRepo = {
      findOne: jest.fn() as any,
    };
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner) as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        { provide: getRepositoryToken(StockTransfer), useValue: transferRepo },
        { provide: getRepositoryToken(StockTransferItem), useValue: transferItemRepo },
        { provide: getRepositoryToken(InventoryItem), useValue: itemRepo },
        { provide: getRepositoryToken(Branch), useValue: branchRepo },
        { provide: DataSource, useValue: dataSource },
        {
          provide: EventService,
          useValue: {
            emitTransferCreated: jest.fn(),
            emitTransferReceived: jest.fn(),
            emitTransferUpdated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
  });

  // ─── 9.2: Create transfer ─────────────────────────────────────────────────

  describe('create()', () => {
    const baseDto = {
      fromBranchId: 'branch-from',
      toBranchId: 'branch-to',
      itemIds: ['item-uuid-1'],
    };

    beforeEach(() => {
      (branchRepo.findOne as any).mockResolvedValue(makeBranch('branch-from', 'FROM'));
      const savedTransfer = makeTransfer();
      (queryRunner.manager.create as any).mockReturnValue(savedTransfer);
      (queryRunner.manager.save as any).mockResolvedValue(savedTransfer);
      (queryRunner.manager.update as any).mockResolvedValue({ affected: 1 });
      (transferRepo.findOne as any).mockResolvedValue(makeTransfer({ items: [] }));
    });

    it('should create a transfer with valid items', async () => {
      const item = makeItem({ branchId: 'branch-from', status: 'available' });
      (itemRepo.find as any).mockResolvedValue([item]);

      const result = await service.create(baseDto, 'user-1');

      expect(result).toBeDefined();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should reject if fromBranchId equals toBranchId', async () => {
      const dto = { ...baseDto, toBranchId: 'branch-from' };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'user-1')).rejects.toMatchObject({
        response: { code: 'SAME_BRANCH' },
      });
    });

    it('should throw NotFoundException when items not found', async () => {
      (itemRepo.find as any).mockResolvedValue([]); // no items found

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should reject if item does not belong to fromBranch', async () => {
      const item = makeItem({ branchId: 'other-branch', status: 'available' });
      (itemRepo.find as any).mockResolvedValue([item]);

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(baseDto, 'user-1')).rejects.toMatchObject({
        response: { code: 'ITEM_WRONG_BRANCH' },
      });
    });

    it('should reject if item is not available', async () => {
      const item = makeItem({ branchId: 'branch-from', status: 'sold' });
      (itemRepo.find as any).mockResolvedValue([item]);

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(baseDto, 'user-1')).rejects.toMatchObject({
        response: { code: 'ITEM_NOT_AVAILABLE' },
      });
    });

    it('should set items status to transferred on create', async () => {
      const item = makeItem({ branchId: 'branch-from', status: 'available' });
      (itemRepo.find as any).mockResolvedValue([item]);

      await service.create(baseDto, 'user-1');

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        InventoryItem,
        item.id,
        { status: 'transferred' },
      );
    });

    it('should generate a transfer number with TRF- prefix', async () => {
      const item = makeItem({ branchId: 'branch-from', status: 'available' });
      (itemRepo.find as any).mockResolvedValue([item]);

      await service.create(baseDto, 'user-1');

      const createCall = (queryRunner.manager.create as any).mock.calls[0][1];
      expect(createCall.transferNumber).toMatch(/^TRF-/);
    });
  });

  // ─── 9.3: Get transfer by ID ──────────────────────────────────────────────

  describe('findById()', () => {
    it('should return transfer when found', async () => {
      const transfer = makeTransfer();
      (transferRepo.findOne as any).mockResolvedValue(transfer);

      const result = await service.findById('transfer-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('transfer-uuid-1');
    });

    it('should throw NotFoundException when transfer not found', async () => {
      (transferRepo.findOne as any).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 9.3: List transfers ──────────────────────────────────────────────────

  describe('findAll()', () => {
    function makeQueryBuilder(data: StockTransfer[], total: number): any {
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
      const transfers = [makeTransfer()];
      const qb = makeQueryBuilder(transfers, 1);
      (transferRepo.createQueryBuilder as any).mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply status filter', async () => {
      const qb = makeQueryBuilder([], 0);
      (transferRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ status: 'received' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'transfer.status = :status',
        { status: 'received' },
      );
    });
  });

  // ─── 9.4: Receive transfer ────────────────────────────────────────────────

  describe('receive()', () => {
    it('should update confirmed items to received and move to toBranch', async () => {
      const transferItem = makeTransferItem({ itemId: 'item-uuid-1' });
      const transfer = makeTransfer({ status: 'initiated', items: [transferItem] });
      (transferRepo.findOne as any).mockResolvedValue(transfer);
      (queryRunner.manager.update as any).mockResolvedValue({ affected: 1 });

      await service.receive('transfer-uuid-1', ['item-uuid-1'], 'user-2');

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        StockTransferItem,
        transferItem.id,
        { status: 'received' },
      );
      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        InventoryItem,
        'item-uuid-1',
        { branchId: 'branch-to', status: 'available' },
      );
    });

    it('should reject if transfer is not in initiated or in_transit status', async () => {
      const transfer = makeTransfer({ status: 'received' });
      (transferRepo.findOne as any).mockResolvedValue(transfer);

      await expect(service.receive('transfer-uuid-1', ['item-uuid-1'], 'user-2')).rejects.toThrow(BadRequestException);
    });

    it('should set receivedById and receivedAt on transfer', async () => {
      const transferItem = makeTransferItem({ itemId: 'item-uuid-1' });
      const transfer = makeTransfer({ status: 'initiated', items: [transferItem] });
      (transferRepo.findOne as any).mockResolvedValue(transfer);
      (queryRunner.manager.update as any).mockResolvedValue({ affected: 1 });

      await service.receive('transfer-uuid-1', ['item-uuid-1'], 'user-2');

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        StockTransfer,
        'transfer-uuid-1',
        expect.objectContaining({ status: 'received', receivedById: 'user-2' }),
      );
    });
  });

  // ─── 9.5: Reject transfer ─────────────────────────────────────────────────

  describe('reject()', () => {
    it('should restore all items to available at fromBranch', async () => {
      const transferItem = makeTransferItem({ itemId: 'item-uuid-1' });
      const transfer = makeTransfer({ status: 'initiated', items: [transferItem] });
      (transferRepo.findOne as any).mockResolvedValue(transfer);
      (queryRunner.manager.update as any).mockResolvedValue({ affected: 1 });

      await service.reject('transfer-uuid-1', 'Wrong items');

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        InventoryItem,
        'item-uuid-1',
        { branchId: 'branch-from', status: 'available' },
      );
    });

    it('should record rejection reason', async () => {
      const transferItem = makeTransferItem({ itemId: 'item-uuid-1' });
      const transfer = makeTransfer({ status: 'initiated', items: [transferItem] });
      (transferRepo.findOne as any).mockResolvedValue(transfer);
      (queryRunner.manager.update as any).mockResolvedValue({ affected: 1 });

      await service.reject('transfer-uuid-1', 'Damaged items');

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        StockTransfer,
        'transfer-uuid-1',
        expect.objectContaining({ status: 'rejected', rejectionReason: 'Damaged items' }),
      );
    });

    it('should reject if transfer is not in initiated or in_transit status', async () => {
      const transfer = makeTransfer({ status: 'received' });
      (transferRepo.findOne as any).mockResolvedValue(transfer);

      await expect(service.reject('transfer-uuid-1', 'reason')).rejects.toThrow(BadRequestException);
    });
  });
});
