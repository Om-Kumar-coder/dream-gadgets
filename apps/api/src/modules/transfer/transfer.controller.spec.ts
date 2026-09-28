/**
 * Transfer controller authorization tests (P2-7).
 *
 * Verifies the controller-level branch scoping added on top of the service:
 *  - POST /transfers: staff may only ship FROM their own branch;
 *    cross-branch roles (owner, multi-store manager, store manager) unrestricted.
 *  - GET /transfers/:id: staff may only view transfers involving their branch.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';

function makeService(): any {
  return {
    create: jest.fn(async (_dto: any, _userId: string) => ({ id: 'tr-1' })),
    findById: jest.fn(async (_id: string) => ({
      id: _id,
      fromBranchId: 'branch-A',
      toBranchId: 'branch-B',
    })),
  } as any;
}

function makeUser(role: string, branchId: string | null) {
  return { sub: 'user-1', role, branchId };
}

describe('TransferController — branch scoping (P2-7)', () => {
  let controller: TransferController;
  let service: any;

  beforeEach(() => {
    service = makeService();
    const reflector: any = { getAllAndOverride: jest.fn().mockReturnValue(undefined) };
    controller = new TransferController(service);
  });

  describe('POST /transfers (create)', () => {
    const dto = { fromBranchId: 'branch-A', toBranchId: 'branch-B', itemIds: ['item-1'] };

    it('allows staff to transfer from their own branch', async () => {
      await expect(
        controller.create(dto as any, makeUser('shop_sales', 'branch-A')),
      ).resolves.toBeDefined();
    });

    it('blocks staff transferring from another branch (BRANCH_SCOPE_VIOLATION)', async () => {
      await expect(
        controller.create(dto as any, makeUser('shop_sales', 'branch-Z')),
      ).rejects.toMatchObject({ response: { code: 'BRANCH_SCOPE_VIOLATION' } });
      expect(service.create).not.toHaveBeenCalled();
    });

    it('allows branchless owner to transfer between any stores', async () => {
      await expect(
        controller.create(dto as any, makeUser('shop_owner', null)),
      ).resolves.toBeDefined();
    });

    it('allows multi_store_manager to transfer between any stores', async () => {
      await expect(
        controller.create(dto as any, makeUser('multi_store_manager', null)),
      ).resolves.toBeDefined();
    });

    it('allows store_manager (cross-branch role) even with a branchId', async () => {
      await expect(
        controller.create(dto as any, makeUser('store_manager', 'branch-Z')),
      ).resolves.toBeDefined();
    });
  });

  describe('GET /transfers/:id (findById)', () => {
    it('allows staff to view a transfer involving their branch (as source)', async () => {
      await expect(
        controller.findById('tr-1', makeUser('shop_sales', 'branch-A')),
      ).resolves.toBeDefined();
    });

    it('allows staff to view a transfer involving their branch (as destination)', async () => {
      await expect(
        controller.findById('tr-1', makeUser('shop_sales', 'branch-B')),
      ).resolves.toBeDefined();
    });

    it('blocks staff from viewing an unrelated branch transfer (BRANCH_SCOPE_VIOLATION)', async () => {
      await expect(
        controller.findById('tr-1', makeUser('shop_sales', 'branch-C')),
      ).rejects.toMatchObject({ response: { code: 'BRANCH_SCOPE_VIOLATION' } });
    });

    it('allows branchless owner to view any transfer', async () => {
      await expect(
        controller.findById('tr-1', makeUser('shop_owner', null)),
      ).resolves.toBeDefined();
    });
  });
});
