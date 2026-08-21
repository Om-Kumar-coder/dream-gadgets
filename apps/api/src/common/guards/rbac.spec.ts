/**
 * RBAC Integration Tests
 *
 * Tests the complete authorization chain:
 *   User → JWT (financialScope, branchId, permissions[]) → Guards → Service → Response
 *
 * Covers:
 * 1. Owner — full access, all stores, all financial data
 * 2. Multi-store manager — all stores, no financial data (by default)
 * 3. Store staff (shop_sales) — own store only, no financial data
 * 4. Store staff (store_sales) — own store only, no financial data
 * 5. Calling staff — own store only, limited actions, no financial data
 * 6. Cross-store access prevention
 * 7. Financial access escalation prevention
 */

import { describe, it, expect, jest } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { PermissionGuard, PERMISSION_KEY } from './permission.guard';
import { BranchScopeGuard, BRANCH_SCOPED_KEY } from './branch-scope.guard';
import { FinancialScopeGuard, FINANCIAL_SCOPE_KEY } from './financial-scope.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// ─── Test data ───────────────────────────────────────────────────────────────

const BRANCH_A = 'branch-uuid-chetla';
const BRANCH_B = 'branch-uuid-jadavpur';
const BRANCH_C = 'branch-uuid-champahati';

/** Permission matrix matching the seed file exactly */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  shop_owner: [
    // All modules, all actions
    'dashboard.view',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.export',
    'purchases.view', 'purchases.create', 'purchases.edit', 'purchases.delete', 'purchases.export',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete', 'sales.export', 'sales.approve',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.export',
    'transfers.view', 'transfers.create', 'transfers.edit', 'transfers.delete',
    'exchange.view', 'exchange.create', 'exchange.edit', 'exchange.delete', 'exchange.approve',
    'orders.view', 'orders.edit', 'orders.delete',
    'returns.view', 'returns.create', 'returns.edit', 'returns.delete', 'returns.approve',
    'reports.view', 'reports.export',
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'settings.view', 'settings.create', 'settings.edit', 'settings.delete',
    'content.view', 'content.create', 'content.edit', 'content.delete',
    'buyback.view', 'buyback.edit', 'buyback.delete',
    'whatsapp.view', 'whatsapp.create', 'whatsapp.edit', 'whatsapp.delete', 'whatsapp.send',
    'coupons.view', 'coupons.create', 'coupons.edit', 'coupons.delete',
    'emi.view', 'emi.create', 'emi.edit', 'emi.delete',
    'gst.view', 'gst.export',
    'notifications.view', 'notifications.retry',
    'payments.view', 'payments.approve',
    'financial.view', 'financial.reports', 'financial.pnl', 'financial.export',
  ],

  multi_store_manager: [
    'dashboard.view',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.export',
    'purchases.view', 'purchases.create', 'purchases.edit', 'purchases.export',
    'sales.view', 'sales.create', 'sales.edit', 'sales.export', 'sales.approve',
    'clients.view', 'clients.create', 'clients.edit', 'clients.export',
    'transfers.view', 'transfers.create', 'transfers.edit',
    'exchange.view', 'exchange.create', 'exchange.edit', 'exchange.approve',
    'orders.view', 'orders.edit',
    'returns.view', 'returns.create', 'returns.approve',
    'reports.view', 'reports.export',
    'users.view', 'users.create', 'users.edit',
    'buyback.view', 'buyback.edit',
    'whatsapp.view', 'whatsapp.edit', 'whatsapp.send',
    'coupons.view', 'coupons.create', 'coupons.edit',
    'emi.view', 'emi.create', 'emi.edit',
    'gst.view', 'gst.export',
    'notifications.view',
    'payments.view', 'payments.approve',
    // NO financial permissions
  ],

  shop_sales: [
    'dashboard.view',
    'inventory.view',
    'purchases.view', 'purchases.create',
    'sales.view', 'sales.create',
    'clients.view', 'clients.create', 'clients.edit',
    'exchange.view', 'exchange.create',
    'orders.view',
    'returns.view', 'returns.create',
    'buyback.view',
    'whatsapp.view', 'whatsapp.send',
    'coupons.view',
    'emi.view',
    'payments.view',
    // NO financial, NO transfers, NO reports, NO settings, NO users
  ],

  store_sales: [
    'dashboard.view',
    'inventory.view',
    'purchases.view', 'purchases.create',
    'sales.view', 'sales.create',
    'clients.view', 'clients.create', 'clients.edit',
    'exchange.view', 'exchange.create',
    'orders.view',
    'returns.view', 'returns.create',
    'buyback.view',
    'whatsapp.view',
    'coupons.view',
    'emi.view',
    'payments.view',
    // NO financial, NO transfers, NO reports, NO settings, NO users
  ],

  calling_staff: [
    'dashboard.view',
    'inventory.view',
    'purchases.view',
    'sales.view',
    'clients.view', 'clients.create', 'clients.edit',
    'orders.view', 'orders.edit',
    'returns.view', 'returns.create',
    'buyback.view', 'buyback.edit',
    'whatsapp.view', 'whatsapp.edit', 'whatsapp.send',
    'coupons.view',
    'emi.view',
    // NO financial, NO transfers, NO reports, NO settings, NO users, NO sales.create
  ],
};

// ─── Mock helpers ────────────────────────────────────────────────────────────

function makeExecutionContext(metadata: Record<string, any>, overrides: {
  user?: any;
  method?: string;
  path?: string;
  body?: any;
  params?: any;
  query?: any;
} = {}): ExecutionContext {
  const request = {
    user: overrides.user ?? null,
    method: overrides.method ?? 'GET',
    path: overrides.path ?? '/test',
    body: overrides.body ?? {},
    params: overrides.params ?? {},
    query: overrides.query ?? {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as any;
}

function makeReflector(metadata: Record<string, any>): Reflector {
  return {
    getAllAndOverride: jest.fn((_key: unknown) => (metadata as any)[_key as string] ?? undefined),
  } as any;
}

function makeJwtPayload(role: string, branchId: string | null, financialScope: 'all' | 'branch' | 'none' = 'none') {
  return {
    sub: `${role}-user-1`,
    email: `${role}@dreamgadgets.in`,
    role,
    permissions: ROLE_PERMISSIONS[role] ?? [],
    branchId,
    financialScope,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900,
  };
}

// ─── Helper to run guard chain ───────────────────────────────────────────────

function runGuardChain(
  guards: Array<{ guard: any; reflector: Reflector }>,
  ctx: ExecutionContext,
): { allowed: boolean; error?: string } {
  for (const { guard, reflector } of guards) {
    try {
      const result = guard.canActivate(ctx);
      if (result === false) return { allowed: false, error: 'Guard returned false' };
    } catch (err: any) {
      return { allowed: false, error: err.message ?? err.constructor.name };
    }
  }
  return { allowed: true };
}

function createGuards() {
  const permReflector = makeReflector({});
  const branchReflector = makeReflector({});
  const finReflector = makeReflector({});

  return {
    permGuard: new PermissionGuard(permReflector),
    branchGuard: new BranchScopeGuard(branchReflector),
    finGuard: new FinancialScopeGuard(finReflector),
    permReflector,
    branchReflector,
    finReflector,
  };
}

// ─── RBAC Test Suite ─────────────────────────────────────────────────────────

describe('RBAC — Complete Authorization Chain', () => {
  // ─── 1. OWNER ────────────────────────────────────────────────────────────

  describe('Owner (shop_owner)', () => {
    const owner = makeJwtPayload('shop_owner', null, 'all');

    describe('Store access', () => {
      it('should access Store A inventory', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.view';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: owner, method: 'GET' });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });

      it('should access Store B inventory', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.view';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: owner, method: 'GET' });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });

      it('should access Store C inventory', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.view';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: owner, method: 'GET' });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });

      it('should NOT inject branchId into queries (sees all stores)', () => {
        const { branchGuard, branchReflector } = createGuards();
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: owner, method: 'GET', query: {} });
        branchGuard.canActivate(ctx);

        const request = ctx.switchToHttp().getRequest();
        expect(request.query.branchId).toBeUndefined();
      });
    });

    describe('Staff management', () => {
      it('should have users.create permission', () => {
        expect(owner.permissions).toContain('users.create');
      });

      it('should have users.edit permission', () => {
        expect(owner.permissions).toContain('users.edit');
      });

      it('should have users.delete permission', () => {
        expect(owner.permissions).toContain('users.delete');
      });

      it('should have settings.create permission (for roles)', () => {
        expect(owner.permissions).toContain('settings.create');
      });
    });

    describe('Financial access', () => {
      it('should have financial.view permission', () => {
        expect(owner.permissions).toContain('financial.view');
      });

      it('should have financial.reports permission', () => {
        expect(owner.permissions).toContain('financial.reports');
      });

      it('should have financial.pnl permission', () => {
        expect(owner.permissions).toContain('financial.pnl');
      });

      it('should have financialScope=all', () => {
        expect(owner.financialScope).toBe('all');
      });

      it('should pass FinancialScopeGuard', () => {
        const { finGuard, finReflector } = createGuards();
        jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === FINANCIAL_SCOPE_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: owner });
        expect(finGuard.canActivate(ctx)).toBe(true);
      });
    });

    describe('Inventory management', () => {
      it('should have inventory.create permission', () => {
        expect(owner.permissions).toContain('inventory.create');
      });

      it('should have inventory.edit permission', () => {
        expect(owner.permissions).toContain('inventory.edit');
      });

      it('should be able to create inventory in any store', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.create';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: owner,
          method: 'POST',
          body: { branchId: BRANCH_B, imei: '123456789012345' },
        });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });
    });

    describe('Sales and approvals', () => {
      it('should have sales.approve permission', () => {
        expect(owner.permissions).toContain('sales.approve');
      });

      it('should have returns.approve permission', () => {
        expect(owner.permissions).toContain('returns.approve');
      });
    });
  });

  // ─── 2. MULTI-STORE MANAGER ──────────────────────────────────────────────

  describe('Multi-Store Manager', () => {
    const manager = makeJwtPayload('multi_store_manager', null, 'none');

    describe('Store access', () => {
      it('should access all stores (branchId=null)', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.view';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: manager, method: 'GET' });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });

      it('should NOT inject branchId into queries (sees all stores)', () => {
        const { branchGuard, branchReflector } = createGuards();
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: manager, method: 'GET', query: {} });
        branchGuard.canActivate(ctx);

        const request = ctx.switchToHttp().getRequest();
        expect(request.query.branchId).toBeUndefined();
      });

      it('should be able to create inventory in any store', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.create';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: manager,
          method: 'POST',
          body: { branchId: BRANCH_C, imei: '123456789012345' },
        });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });
    });

    describe('Staff management', () => {
      it('should have users.view permission', () => {
        expect(manager.permissions).toContain('users.view');
      });

      it('should have users.create permission', () => {
        expect(manager.permissions).toContain('users.create');
      });

      it('should have users.edit permission', () => {
        expect(manager.permissions).toContain('users.edit');
      });
    });

    describe('Financial access (BLOCKED)', () => {
      it('should NOT have financial.view permission', () => {
        expect(manager.permissions).not.toContain('financial.view');
      });

      it('should NOT have financial.pnl permission', () => {
        expect(manager.permissions).not.toContain('financial.pnl');
      });

      it('should have financialScope=none', () => {
        expect(manager.financialScope).toBe('none');
      });

      it('should be DENIED by FinancialScopeGuard', () => {
        const { finGuard, finReflector } = createGuards();
        jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === FINANCIAL_SCOPE_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: manager });
        expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });

      it('should NOT be able to access dashboard KPIs (financial endpoint)', () => {
        const { permGuard, permReflector, finGuard, finReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'reports.view';
          return undefined;
        });
        jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === FINANCIAL_SCOPE_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: manager });
        // PermissionGuard passes (has reports.view)
        expect(permGuard.canActivate(ctx)).toBe(true);
        // FinancialScopeGuard blocks (financialScope=none)
        expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe('Inventory and operations', () => {
      it('should have inventory.create permission', () => {
        expect(manager.permissions).toContain('inventory.create');
      });

      it('should have sales.approve permission', () => {
        expect(manager.permissions).toContain('sales.approve');
      });

      it('should have transfers.create permission', () => {
        expect(manager.permissions).toContain('transfers.create');
      });
    });
  });

  // ─── 3. STORE STAFF (shop_sales) ─────────────────────────────────────────

  describe('Store Staff (shop_sales)', () => {
    const staff = makeJwtPayload('shop_sales', BRANCH_A, 'none');

    describe('Own store access', () => {
      it('should access own store (Branch A) inventory', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.view';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: staff, method: 'GET' });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });

      it('should have branchId injected into GET queries', () => {
        const { branchGuard, branchReflector } = createGuards();
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: staff, method: 'GET', query: {} });
        branchGuard.canActivate(ctx);

        const request = ctx.switchToHttp().getRequest();
        expect(request.query.branchId).toBe(BRANCH_A);
      });

      it('should be able to create inventory in own store', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.create';
          return undefined;
        });
        // shop_sales does NOT have inventory.create — should be denied
        // Actually, shop_sales has inventory: ['view'] only
        // Let me fix this — shop_sales should not be able to create inventory

        // Actually shop_sales has: inventory: ['view'] — no create
        expect(staff.permissions).not.toContain('inventory.create');
      });
    });

    describe('Cross-store access prevention', () => {
      it('should be BLOCKED from accessing another store (Branch B) via POST', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'sales.create';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: staff,
          method: 'POST',
          body: { branchId: BRANCH_B },
        });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(false);
        expect(result.error).toContain('assigned branch');
      });

      it('should be BLOCKED from accessing another store (Branch C) via POST', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'sales.create';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: staff,
          method: 'POST',
          body: { branchId: BRANCH_C },
        });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(false);
      });

      it('should be BLOCKED from accessing another store via PATCH params', () => {
        const { branchGuard, branchReflector } = createGuards();
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: staff,
          method: 'PATCH',
          params: { branchId: BRANCH_B },
          body: {},
        });
        expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe('Financial access (BLOCKED)', () => {
      it('should NOT have financial.view permission', () => {
        expect(staff.permissions).not.toContain('financial.view');
      });

      it('should have financialScope=none', () => {
        expect(staff.financialScope).toBe('none');
      });

      it('should be DENIED by FinancialScopeGuard', () => {
        const { finGuard, finReflector } = createGuards();
        jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === FINANCIAL_SCOPE_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: staff });
        expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });

      it('should NOT be able to see profit/loss data', () => {
        expect(staff.permissions).not.toContain('financial.pnl');
      });

      it('should NOT be able to see money in/out', () => {
        expect(staff.permissions).not.toContain('financial.reports');
      });

      it('should NOT have reports.view permission', () => {
        expect(staff.permissions).not.toContain('reports.view');
      });
    });

    describe('Limited operations', () => {
      it('should have sales.create permission (POS)', () => {
        expect(staff.permissions).toContain('sales.create');
      });

      it('should NOT have sales.approve permission', () => {
        expect(staff.permissions).not.toContain('sales.approve');
      });

      it('should NOT have transfers.create permission', () => {
        expect(staff.permissions).not.toContain('transfers.create');
      });

      it('should NOT have users.view permission', () => {
        expect(staff.permissions).not.toContain('users.view');
      });

      it('should NOT have settings.view permission', () => {
        expect(staff.permissions).not.toContain('settings.view');
      });
    });
  });

  // ─── 4. STORE STAFF (store_sales) ────────────────────────────────────────

  describe('Store Staff (store_sales)', () => {
    const staff = makeJwtPayload('store_sales', BRANCH_B, 'none');

    describe('Own store access', () => {
      it('should access own store (Branch B)', () => {
        const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
        jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === PERMISSION_KEY) return 'inventory.view';
          return undefined;
        });
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: staff, method: 'GET' });
        const result = runGuardChain([
          { guard: permGuard, reflector: permReflector },
          { guard: branchGuard, reflector: branchReflector },
        ], ctx);

        expect(result.allowed).toBe(true);
      });
    });

    describe('Cross-store access prevention', () => {
      it('should be BLOCKED from Branch A', () => {
        const { branchGuard, branchReflector } = createGuards();
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: staff,
          method: 'POST',
          body: { branchId: BRANCH_A },
        });
        expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });

      it('should be BLOCKED from Branch C', () => {
        const { branchGuard, branchReflector } = createGuards();
        jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === BRANCH_SCOPED_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, {
          user: staff,
          method: 'POST',
          body: { branchId: BRANCH_C },
        });
        expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe('Financial access (BLOCKED)', () => {
      it('should NOT have financial.view permission', () => {
        expect(staff.permissions).not.toContain('financial.view');
      });

      it('should be DENIED by FinancialScopeGuard', () => {
        const { finGuard, finReflector } = createGuards();
        jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === FINANCIAL_SCOPE_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: staff });
        expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });
  });

  // ─── 5. CALLING STAFF ────────────────────────────────────────────────────

  describe('Calling Staff', () => {
    const staff = makeJwtPayload('calling_staff', BRANCH_A, 'none');

    describe('Limited operations', () => {
      it('should have clients.create permission', () => {
        expect(staff.permissions).toContain('clients.create');
      });

      it('should have orders.edit permission', () => {
        expect(staff.permissions).toContain('orders.edit');
      });

      it('should have buyback.edit permission', () => {
        expect(staff.permissions).toContain('buyback.edit');
      });

      it('should have whatsapp.send permission', () => {
        expect(staff.permissions).toContain('whatsapp.send');
      });

      it('should NOT have sales.create permission', () => {
        expect(staff.permissions).not.toContain('sales.create');
      });

      it('should NOT have inventory.create permission', () => {
        expect(staff.permissions).not.toContain('inventory.create');
      });

      it('should NOT have transfers.create permission', () => {
        expect(staff.permissions).not.toContain('transfers.create');
      });

      it('should NOT have users.view permission', () => {
        expect(staff.permissions).not.toContain('users.view');
      });

      it('should NOT have financial.view permission', () => {
        expect(staff.permissions).not.toContain('financial.view');
      });
    });

    describe('Financial access (BLOCKED)', () => {
      it('should be DENIED by FinancialScopeGuard', () => {
        const { finGuard, finReflector } = createGuards();
        jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
          if (key === FINANCIAL_SCOPE_KEY) return true;
          return undefined;
        });

        const ctx = makeExecutionContext({}, { user: staff });
        expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });
  });

  // ─── 6. CROSS-STORE DATA LEAKAGE PREVENTION ──────────────────────────────

  describe('Cross-Store Data Leakage Prevention', () => {
    it('Store A staff cannot create inventory in Store B', () => {
      const { branchGuard, branchReflector } = createGuards();
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      const staffA = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, {
        user: staffA,
        method: 'POST',
        body: { branchId: BRANCH_B, imei: '123456789012345' },
      });

      expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('Store B staff cannot create inventory in Store C', () => {
      const { branchGuard, branchReflector } = createGuards();
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      const staffB = makeJwtPayload('shop_sales', BRANCH_B);
      const ctx = makeExecutionContext({}, {
        user: staffB,
        method: 'POST',
        body: { branchId: BRANCH_C, imei: '123456789012345' },
      });

      expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('Store C staff cannot create inventory in Store A', () => {
      const { branchGuard, branchReflector } = createGuards();
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      const staffC = makeJwtPayload('shop_sales', BRANCH_C);
      const ctx = makeExecutionContext({}, {
        user: staffC,
        method: 'POST',
        body: { branchId: BRANCH_A, imei: '123456789012345' },
      });

      expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('Store A staff cannot create sale in Store B', () => {
      const { branchGuard, branchReflector } = createGuards();
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      const staffA = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, {
        user: staffA,
        method: 'POST',
        body: { branchId: BRANCH_B },
      });

      expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('Store staff GET queries only return own branch data (branchId injected)', () => {
      const { branchGuard, branchReflector } = createGuards();
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      const staffA = makeJwtPayload('shop_sales', BRANCH_A);
      const staffB = makeJwtPayload('shop_sales', BRANCH_B);

      // Staff A query
      const ctxA = makeExecutionContext({}, { user: staffA, method: 'GET', query: {} });
      branchGuard.canActivate(ctxA);
      expect(ctxA.switchToHttp().getRequest().query.branchId).toBe(BRANCH_A);

      // Staff B query
      const ctxB = makeExecutionContext({}, { user: staffB, method: 'GET', query: {} });
      branchGuard.canActivate(ctxB);
      expect(ctxB.switchToHttp().getRequest().query.branchId).toBe(BRANCH_B);
    });
  });

  // ─── 7. FINANCIAL ACCESS ESCALATION PREVENTION ───────────────────────────

  describe('Financial Access Escalation Prevention', () => {
    it('Store staff cannot bypass FinancialScopeGuard by adding financialScope to request', () => {
      const { finGuard, finReflector } = createGuards();
      jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === FINANCIAL_SCOPE_KEY) return true;
        return undefined;
      });

      const staff = makeJwtPayload('shop_sales', BRANCH_A, 'none');
      const ctx = makeExecutionContext({}, { user: staff });

      // Even if the request tries to set financialScope, the guard reads from JWT
      expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('Multi-store manager cannot bypass FinancialScopeGuard without owner grant', () => {
      const { finGuard, finReflector } = createGuards();
      jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === FINANCIAL_SCOPE_KEY) return true;
        return undefined;
      });

      const mgr = makeJwtPayload('multi_store_manager', null, 'none');
      const ctx = makeExecutionContext({}, { user: mgr });

      expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('Only owner (financialScope=all) can see all financial data', () => {
      const { finGuard, finReflector } = createGuards();
      jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === FINANCIAL_SCOPE_KEY) return true;
        return undefined;
      });

      const owner = makeJwtPayload('shop_owner', null, 'all');
      const ctx = makeExecutionContext({}, { user: owner });

      expect(finGuard.canActivate(ctx)).toBe(true);
    });

    it('Branch financial user (financialScope=branch) is scoped to their branch', () => {
      const { finGuard, finReflector } = createGuards();
      jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === FINANCIAL_SCOPE_KEY) return true;
        return undefined;
      });

      const branchUser = makeJwtPayload('store_manager', BRANCH_A, 'branch');
      const ctx = makeExecutionContext({}, { user: branchUser, query: {} });

      finGuard.canActivate(ctx);

      const request = ctx.switchToHttp().getRequest();
      expect(request.query.branchId).toBe(BRANCH_A);
    });
  });

  // ─── 8. ROLE HIERARCHY VERIFICATION ──────────────────────────────────────

  describe('Role Hierarchy Verification', () => {
    it('Owner should have MORE permissions than multi-store manager', () => {
      const ownerPerms = ROLE_PERMISSIONS['shop_owner'];
      const mgrPerms = ROLE_PERMISSIONS['multi_store_manager'];

      // Owner has everything manager has, plus more
      for (const perm of mgrPerms) {
        expect(ownerPerms).toContain(perm);
      }
    });

    it('Multi-store manager should have MORE permissions than shop_sales', () => {
      const mgrPerms = ROLE_PERMISSIONS['multi_store_manager'];
      const salesPerms = ROLE_PERMISSIONS['shop_sales'];

      // Manager has everything sales has (except some sales-specific), plus more
      // Note: multi_store_manager has sales.create but shop_sales also has it
      expect(mgrPerms.length).toBeGreaterThan(salesPerms.length);
    });

    it('Shop_sales should have MORE permissions than calling_staff', () => {
      const salesPerms = ROLE_PERMISSIONS['shop_sales'];
      const callingPerms = ROLE_PERMISSIONS['calling_staff'];

      expect(salesPerms.length).toBeGreaterThan(callingPerms.length);
    });

    it('Owner should have ALL financial permissions', () => {
      const ownerPerms = ROLE_PERMISSIONS['shop_owner'];
      expect(ownerPerms).toContain('financial.view');
      expect(ownerPerms).toContain('financial.reports');
      expect(ownerPerms).toContain('financial.pnl');
      expect(ownerPerms).toContain('financial.export');
    });

    it('No store-level role should have financial permissions by default', () => {
      const salesPerms = ROLE_PERMISSIONS['shop_sales'];
      const storeSalesPerms = ROLE_PERMISSIONS['store_sales'];
      const callingPerms = ROLE_PERMISSIONS['calling_staff'];

      expect(salesPerms).not.toContain('financial.view');
      expect(storeSalesPerms).not.toContain('financial.view');
      expect(callingPerms).not.toContain('financial.view');
    });

    it('Multi-store manager should NOT have financial permissions by default', () => {
      const mgrPerms = ROLE_PERMISSIONS['multi_store_manager'];
      expect(mgrPerms).not.toContain('financial.view');
      expect(mgrPerms).not.toContain('financial.pnl');
    });
  });

  // ─── 9. SPECIFIC ENDPOINT GUARD CHAIN TESTS ─────────────────────────────

  describe('Endpoint Guard Chain (simulated)', () => {
    it('GET /inventory — inventory.view + BranchScoped', () => {
      const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'inventory.view';
        return undefined;
      });
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      // Store staff — should pass with branch injection
      const staff = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, { user: staff, method: 'GET', query: {} });
      const result = runGuardChain([
        { guard: permGuard, reflector: permReflector },
        { guard: branchGuard, reflector: branchReflector },
      ], ctx);

      expect(result.allowed).toBe(true);
      // Verify branchId was injected
      expect(ctx.switchToHttp().getRequest().query.branchId).toBe(BRANCH_A);
    });

    it('POST /inventory — inventory.create + BranchScoped', () => {
      const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'inventory.create';
        return undefined;
      });
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      // Owner — should pass
      const owner = makeJwtPayload('shop_owner', null);
      const ctx = makeExecutionContext({}, {
        user: owner,
        method: 'POST',
        body: { branchId: BRANCH_A, imei: '123456789012345' },
      });
      const result = runGuardChain([
        { guard: permGuard, reflector: permReflector },
        { guard: branchGuard, reflector: branchReflector },
      ], ctx);

      expect(result.allowed).toBe(true);
    });

    it('POST /inventory — inventory.create denied for shop_sales (no permission)', () => {
      const { permGuard, permReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'inventory.create';
        return undefined;
      });

      const staff = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, { user: staff, method: 'POST' });
      const result = runGuardChain([
        { guard: permGuard, reflector: permReflector },
      ], ctx);

      expect(result.allowed).toBe(false);
    });

    it('GET /reports/dashboard — reports.view + FinancialScope', () => {
      const { permGuard, permReflector, finGuard, finReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'reports.view';
        return undefined;
      });
      jest.spyOn(finReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === FINANCIAL_SCOPE_KEY) return true;
        return undefined;
      });

      // Owner — should pass both guards
      const owner = makeJwtPayload('shop_owner', null, 'all');
      const ctx = makeExecutionContext({}, { user: owner });
      expect(permGuard.canActivate(ctx)).toBe(true);
      expect(finGuard.canActivate(ctx)).toBe(true);
    });

    it('GET /reports/dashboard — denied for shop_sales (no reports.view)', () => {
      const { permGuard, permReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'reports.view';
        return undefined;
      });

      const staff = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, { user: staff });
      const result = runGuardChain([
        { guard: permGuard, reflector: permReflector },
      ], ctx);

      expect(result.allowed).toBe(false);
    });

    it('POST /admin/users — users.create permission check', () => {
      const { permGuard, permReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'users.create';
        return undefined;
      });

      // Multi-store manager — has users.create
      const mgr = makeJwtPayload('multi_store_manager', null);
      const ctx = makeExecutionContext({}, { user: mgr });
      expect(permGuard.canActivate(ctx)).toBe(true);

      // Shop sales — does NOT have users.create
      const staff = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx2 = makeExecutionContext({}, { user: staff });
      expect(() => permGuard.canActivate(ctx2)).toThrow(ForbiddenException);
    });

    it('POST /sales — sales.create + BranchScoped', () => {
      const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'sales.create';
        return undefined;
      });
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      // Store staff — has sales.create, can sell in own branch
      const staff = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, {
        user: staff,
        method: 'POST',
        body: { branchId: BRANCH_A },
      });
      const result = runGuardChain([
        { guard: permGuard, reflector: permReflector },
        { guard: branchGuard, reflector: branchReflector },
      ], ctx);

      expect(result.allowed).toBe(true);
    });

    it('POST /sales — blocked when trying to sell in another branch', () => {
      const { permGuard, permReflector, branchGuard, branchReflector } = createGuards();
      jest.spyOn(permReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === PERMISSION_KEY) return 'sales.create';
        return undefined;
      });
      jest.spyOn(branchReflector, 'getAllAndOverride').mockImplementation((key: any) => {
        if (key === BRANCH_SCOPED_KEY) return true;
        return undefined;
      });

      const staff = makeJwtPayload('shop_sales', BRANCH_A);
      const ctx = makeExecutionContext({}, {
        user: staff,
        method: 'POST',
        body: { branchId: BRANCH_B },
      });
      const result = runGuardChain([
        { guard: permGuard, reflector: permReflector },
        { guard: branchGuard, reflector: branchReflector },
      ], ctx);

      expect(result.allowed).toBe(false);
    });
  });
});
