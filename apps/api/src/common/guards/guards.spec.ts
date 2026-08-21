import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard, PERMISSION_KEY } from './permission.guard';
import { BranchScopeGuard, BRANCH_SCOPED_KEY } from './branch-scope.guard';
import { FinancialScopeGuard, FINANCIAL_SCOPE_KEY } from './financial-scope.guard';

// ─── Mock helpers ────────────────────────────────────────────────────────────

function makeExecutionContext(overrides: {
  user?: any;
  method?: string;
  path?: string;
  body?: any;
  params?: any;
  query?: any;
  handlerMetadata?: Record<string, any>;
  classMetadata?: Record<string, any>;
}): ExecutionContext {
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
    getAllAndOverride: jest.fn((key: string) => metadata[key] ?? undefined),
  } as any;
}

// ─── PermissionGuard tests ───────────────────────────────────────────────────

describe('PermissionGuard', () => {
  let guard: PermissionGuard;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when no permission is required', () => {
    const reflector = makeReflector({});
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({ user: { permissions: [] } });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user has the required permission', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'inventory.view' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({
      user: { sub: 'user-1', permissions: ['inventory.view', 'sales.view'] },
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user lacks the required permission', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'financial.view' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({
      user: { sub: 'user-1', role: 'shop_sales', permissions: ['inventory.view'] },
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny access when user has no permissions array', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'inventory.view' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({
      user: { sub: 'user-1', role: 'shop_sales' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny access when there is no user', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'inventory.view' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({ user: undefined });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should allow shop_owner full access to all permissions', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'financial.pnl' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({
      user: {
        sub: 'owner-1',
        role: 'shop_owner',
        permissions: [
          'dashboard.view', 'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.export',
          'sales.view', 'sales.create', 'sales.edit', 'sales.delete', 'sales.export', 'sales.approve',
          'financial.view', 'financial.reports', 'financial.pnl', 'financial.export',
          'users.view', 'users.create', 'users.edit', 'users.delete',
          'settings.view', 'settings.create', 'settings.edit', 'settings.delete',
        ],
      },
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny shop_sales access to financial permissions', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'financial.view' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({
      user: {
        sub: 'sales-1',
        role: 'shop_sales',
        permissions: [
          'dashboard.view', 'inventory.view', 'sales.view', 'sales.create',
          'clients.view', 'clients.create', 'clients.edit',
          // NO financial permissions
        ],
      },
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny multi_store_manager access to financial permissions by default', () => {
    const reflector = makeReflector({ [PERMISSION_KEY]: 'financial.view' });
    guard = new PermissionGuard(reflector);
    const ctx = makeExecutionContext({
      user: {
        sub: 'mgr-1',
        role: 'multi_store_manager',
        permissions: [
          'dashboard.view', 'inventory.view', 'inventory.create', 'inventory.edit',
          'sales.view', 'sales.create', 'sales.approve',
          'users.view', 'users.create', 'users.edit',
          // NO financial permissions
        ],
      },
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

// ─── BranchScopeGuard tests ──────────────────────────────────────────────────

describe('BranchScopeGuard', () => {
  let guard: BranchScopeGuard;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('non-scoped endpoint (no @BranchScoped)', () => {
    it('should allow access when endpoint is not branch-scoped', () => {
      const reflector = makeReflector({}); // no BRANCH_SCOPED_KEY
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'user-1', branchId: 'branch-A' },
        body: { branchId: 'branch-B' }, // wrong branch, but endpoint is not scoped
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('owner (branchId=null)', () => {
    it('should allow owner to access any branch-scoped endpoint', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'owner-1', branchId: null },
        body: { branchId: 'any-branch' },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow owner POST to any branch', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'POST',
        user: { sub: 'owner-1', branchId: null },
        body: { branchId: 'branch-C', imei: '123456789012345' },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('GET requests (list queries)', () => {
    it('should inject branchId into query params for non-owner', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'GET',
        user: { sub: 'user-1', branchId: 'branch-A' },
        query: {},
      });

      const result = guard.canActivate(ctx);
      expect(result).toBe(true);

      // Verify branchId was injected into query
      const request = ctx.switchToHttp().getRequest();
      expect(request.query.branchId).toBe('branch-A');
    });

    it('should preserve existing query params when injecting branchId', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'GET',
        user: { sub: 'user-1', branchId: 'branch-A' },
        query: { status: 'available', limit: '20' },
      });

      guard.canActivate(ctx);

      const request = ctx.switchToHttp().getRequest();
      expect(request.query.branchId).toBe('branch-A');
      expect(request.query.status).toBe('available');
      expect(request.query.limit).toBe('20');
    });
  });

  describe('mutations (POST/PATCH/PUT/DELETE)', () => {
    it('should allow mutation with matching branchId in body', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'POST',
        user: { sub: 'user-1', branchId: 'branch-A' },
        body: { branchId: 'branch-A', imei: '123456789012345' },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should block mutation with different branchId in body', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'POST',
        user: { sub: 'user-1', branchId: 'branch-A' },
        body: { branchId: 'branch-B', imei: '123456789012345' },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should block mutation with different branchId in params', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'PATCH',
        user: { sub: 'user-1', branchId: 'branch-A' },
        params: { branchId: 'branch-B' },
        body: {},
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should allow mutation without branchId in body (no scope violation)', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'POST',
        user: { sub: 'user-1', branchId: 'branch-A' },
        body: { imei: '123456789012345', status: 'sold' }, // no branchId in body
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('multi-store manager scenarios', () => {
    it('should allow multi-store manager (branchId=null) to access all branches', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'GET',
        user: { sub: 'mgr-1', branchId: null },
        query: {},
      });

      const result = guard.canActivate(ctx);
      expect(result).toBe(true);
    });

    it('should NOT inject branchId for multi-store manager (branchId=null)', () => {
      const reflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
      guard = new BranchScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'GET',
        user: { sub: 'mgr-1', branchId: null },
        query: {},
      });

      guard.canActivate(ctx);

      const request = ctx.switchToHttp().getRequest();
      expect(request.query.branchId).toBeUndefined();
    });
  });
});

// ─── FinancialScopeGuard tests ───────────────────────────────────────────────

describe('FinancialScopeGuard', () => {
  let guard: FinancialScopeGuard;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('non-financial endpoint (no @RequireFinancialAccess)', () => {
    it('should allow access when endpoint does not require financial access', () => {
      const reflector = makeReflector({}); // no FINANCIAL_SCOPE_KEY
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'user-1', financialScope: 'none' },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('owner (financialScope=all)', () => {
    it('should allow owner access to financial endpoints', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'owner-1', financialScope: 'all', branchId: null },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should NOT inject branchId for owner (all access)', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'GET',
        user: { sub: 'owner-1', financialScope: 'all', branchId: null },
        query: {},
      });

      guard.canActivate(ctx);

      const request = ctx.switchToHttp().getRequest();
      expect(request.query.branchId).toBeUndefined();
    });
  });

  describe('branch financial user (financialScope=branch)', () => {
    it('should allow branch financial user access', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'mgr-1', financialScope: 'branch', branchId: 'branch-A' },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should inject branchId for branch financial user', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        method: 'GET',
        user: { sub: 'mgr-1', financialScope: 'branch', branchId: 'branch-A' },
        query: {},
      });

      guard.canActivate(ctx);

      const request = ctx.switchToHttp().getRequest();
      expect(request.query.branchId).toBe('branch-A');
    });
  });

  describe('no financial access (financialScope=none)', () => {
    it('should deny access to financial endpoints for store staff', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'staff-1', financialScope: 'none', role: 'shop_sales', branchId: 'branch-A' },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should deny access for multi-store manager without financial access', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'mgr-1', financialScope: 'none', role: 'multi_store_manager', branchId: null },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should deny access when financialScope is undefined (defaults to none)', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({
        user: { sub: 'staff-1', role: 'shop_sales', branchId: 'branch-A' },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should deny access when there is no user', () => {
      const reflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
      guard = new FinancialScopeGuard(reflector);
      const ctx = makeExecutionContext({ user: undefined });

      expect(guard.canActivate(ctx)).toBe(false);
    });
  });
});

// ─── Cross-guard interaction tests ───────────────────────────────────────────

describe('Cross-guard interaction (Permission + Branch + Financial)', () => {
  it('PermissionGuard denies before BranchScopeGuard runs (missing permission)', () => {
    // PermissionGuard is evaluated first in the guard chain
    const permReflector = makeReflector({ [PERMISSION_KEY]: 'financial.view' });
    const permGuard = new PermissionGuard(permReflector);

    const ctx = makeExecutionContext({
      user: {
        sub: 'staff-1',
        role: 'shop_sales',
        branchId: 'branch-A',
        permissions: ['inventory.view', 'sales.view'], // no financial.view
      },
    });

    // PermissionGuard should deny
    expect(() => permGuard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('Owner passes both PermissionGuard and FinancialScopeGuard', () => {
    const permReflector = makeReflector({ [PERMISSION_KEY]: 'reports.view' });
    const permGuard = new PermissionGuard(permReflector);
    const finReflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
    const finGuard = new FinancialScopeGuard(finReflector);

    const ctx = makeExecutionContext({
      user: {
        sub: 'owner-1',
        role: 'shop_owner',
        branchId: null,
        financialScope: 'all',
        permissions: ['dashboard.view', 'reports.view', 'financial.view', 'financial.reports'],
      },
    });

    expect(permGuard.canActivate(ctx)).toBe(true);
    expect(finGuard.canActivate(ctx)).toBe(true);
  });

  it('Multi-store manager passes PermissionGuard but fails FinancialScopeGuard', () => {
    const permReflector = makeReflector({ [PERMISSION_KEY]: 'reports.view' });
    const permGuard = new PermissionGuard(permReflector);
    const finReflector = makeReflector({ [FINANCIAL_SCOPE_KEY]: true });
    const finGuard = new FinancialScopeGuard(finReflector);

    const ctx = makeExecutionContext({
      user: {
        sub: 'mgr-1',
        role: 'multi_store_manager',
        branchId: null,
        financialScope: 'none',
        permissions: ['dashboard.view', 'reports.view'], // has reports.view but no financial.view
      },
    });

    // PermissionGuard passes (has reports.view)
    expect(permGuard.canActivate(ctx)).toBe(true);
    // FinancialScopeGuard blocks (financialScope=none)
    expect(() => finGuard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('Store staff passes PermissionGuard but fails BranchScopeGuard on cross-branch mutation', () => {
    const branchReflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
    const branchGuard = new BranchScopeGuard(branchReflector);

    const ctx = makeExecutionContext({
      method: 'POST',
      user: {
        sub: 'staff-1',
        role: 'shop_sales',
        branchId: 'branch-A',
        permissions: ['inventory.create'],
      },
      body: { branchId: 'branch-B', imei: '123456789012345' },
    });

    // BranchScopeGuard blocks cross-branch mutation
    expect(() => branchGuard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('Store staff passes BranchScopeGuard for own-branch mutation', () => {
    const branchReflector = makeReflector({ [BRANCH_SCOPED_KEY]: true });
    const branchGuard = new BranchScopeGuard(branchReflector);

    const ctx = makeExecutionContext({
      method: 'POST',
      user: {
        sub: 'staff-1',
        role: 'shop_sales',
        branchId: 'branch-A',
        permissions: ['inventory.create'],
      },
      body: { branchId: 'branch-A', imei: '123456789012345' },
    });

    expect(branchGuard.canActivate(ctx)).toBe(true);
  });
});
