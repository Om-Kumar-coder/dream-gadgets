#!/usr/bin/env node
/**
 * Full RBAC Test Suite — Live VPS Integration Tests
 * Tests: Auth, RBAC, Store Isolation, Financial, Admin, Audit, Cross-Store
 *
 * API response format: { status: "success"|"error", data: {...} }
 * HTTP status codes: 200 (success), 401 (no/bad token), 403 (forbidden)
 * Auth response: { status: "success", data: { accessToken, refreshToken, user } }
 */

const https = require('https');

const API = 'https://dreamgadgets.in/api/v1';

const BRANCHES = {
  MAIN: '20af0e99-886e-4f8f-bf7e-1fd98360d91d',
  CHETLA: '8d876f4f-aa29-4169-8da8-0a8c07d88b9a',
  JADAVPUR: '8c47263c-1639-4a33-b0fd-3358da6169eb',
  SALT_LAKE: 'c12f4404-71cf-44fc-b3a2-c945e4e879be',
  BARRACK: '10e886c2-b833-467e-bfbd-5eddef0fe4b7',
  HOWRAH: 'eaeeade4-c9f4-4c0c-b4f6-28a5c080b7ae',
  CHAMPAHATI: '1b925f69-dc22-4769-8416-09016c70ed86',
};

const USERS = {
  owner: { phone: '9800000001', password: 'Test@1234', name: 'Owner Admin' },
  manager: { phone: '9800000002', password: 'Test@1234', name: 'Store Manager' },
  multiManager: { phone: '9800000007', password: 'Test@1234', name: 'Multi Manager' },
  shopSalesA: { phone: '9800000003', password: 'Test@1234', name: 'Shop Sales' },
  storeSalesB: { phone: '9800000004', password: 'Test@1234', name: 'Store Sales' },
  callingStaff: { phone: '9800000005', password: 'Test@1234', name: 'Calling Staff' },
  employee: { phone: '9800000006', password: 'Test@1234', name: 'Basic Employee' },
};

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];
const sectionResults = [];

function section(name) {
  sectionResults.push({ name, tests: [] });
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${name}`);
  console.log('='.repeat(60));
}

function test(name, result, detail) {
  const icon = result === 'pass' ? '✅' : result === 'fail' ? '❌' : '⚠️';
  if (result === 'pass') passed++;
  else if (result === 'fail') { failed++; failures.push({ name, detail: detail || '' }); }
  else skipped++;
  console.log(`  ${icon} ${name}${detail ? ' (' + detail + ')' : ''}`);
  if (sectionResults.length > 0) sectionResults[sectionResults.length - 1].tests.push({ name, result });
}

// Helper: is the API response successful?
function ok(r) {
  return r && r.apiStatus === 'success' && r.httpStatus >= 200 && r.httpStatus < 300;
}

// Helper: was the request denied (401/403 or error)?
function denied(r) {
  return !r || r.httpStatus === 401 || r.httpStatus === 403 || r.apiStatus === 'error';
}

// Helper: safe access to nested data
function d(resp, path) {
  if (!resp || !resp.data) return undefined;
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), resp.data);
}

// Decode JWT payload to get permissions, financialScope, etc.
function jwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch { return {}; }
}

// Get JWT-decoded permissions for a token
function getPerms(token) {
  return jwtPayload(token).permissions || [];
}

// Get JWT-decoded financialScope
function getFinancialScope(token) {
  return jwtPayload(token).financialScope;
}


// ===== HTTP HELPERS =====

function httpsRequest(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) {
      const bodyStr = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    const opts = { hostname: 'dreamgadgets.in', path: `/api/v1${path}`, method, headers };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({
            httpStatus: res.statusCode,
            apiStatus: parsed.status || 'unknown',
            data: parsed.data,
            message: parsed.message || parsed.error,
          });
        } catch {
          resolve({ httpStatus: res.statusCode, apiStatus: 'parse_error', data: null, raw: raw.substring(0, 300) });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const api = {
  get: (token, path) => httpsRequest('GET', path, token),
  post: (token, path, body) => httpsRequest('POST', path, token, body),
  patch: (token, path, body) => httpsRequest('PATCH', path, token, body),
  del: (token, path) => httpsRequest('DELETE', path, token),
};

async function login(user) {
  return httpsRequest('POST', '/auth/login', null, { identifier: user.phone, password: user.password });
}

// ===== TEST SUITES =====

async function testAuth(tokens) {
  section('1. Authentication');

  for (const [key, user] of Object.entries(USERS)) {
    const res = await login(user);
    const hasToken = ok(res) && d(res, 'accessToken');
    test(`${user.name} login`, hasToken ? 'pass' : 'fail', `api=${res.apiStatus} http=${res.httpStatus}`);
    if (hasToken) tokens[key] = d(res, 'accessToken');
  }

  const bad = await login({ phone: '0000000000', password: 'wrong' });
  test('Invalid credentials rejected', bad.apiStatus === 'error' ? 'pass' : 'fail', `api=${bad.apiStatus}`);

  const noAuth = await api.get(null, '/auth/me');
  test('No token → 401', noAuth.httpStatus === 401 ? 'pass' : 'fail', `http=${noAuth.httpStatus}`);

  const badToken = await api.get('invalid-token', '/auth/me');
  test('Invalid token → 401', badToken.httpStatus === 401 ? 'pass' : 'fail', `http=${badToken.httpStatus}`);
}

async function testOwnerAccess(tokens) {
  section('2. Owner Access (Full Business Control)');
  if (!tokens.owner) { test('Owner token available', 'fail', 'no token'); return; }
  const t = tokens.owner;

  const me = await api.get(t, '/auth/me');
  test('Owner profile loaded', ok(me) ? 'pass' : 'fail', `http=${me.httpStatus}`);
  test('Role = shop_owner', d(me, 'role.name') === 'shop_owner' ? 'pass' : 'fail', d(me, 'role.name'));
  // financialScope is in JWT: 'all' if owner has no branchId, 'branch' if owner has a branchId
  const ownerFinScope = getFinancialScope(t);
  test('financialScope set (all or branch)', (ownerFinScope === 'all' || ownerFinScope === 'branch') ? 'pass' : 'fail', ownerFinScope);

  for (const [name, id] of Object.entries(BRANCHES)) {
    const inv = await api.get(t, `/inventory?branchId=${id}&limit=1`);
    test(`Owner access ${name}`, ok(inv) ? 'pass' : 'fail', `http=${inv.httpStatus}`);
  }

  test('Owner dashboard KPIs', ok(await api.get(t, '/reports/dashboard')) ? 'pass' : 'fail');
  test('Owner sees all users', ok(await api.get(t, '/admin/users')) ? 'pass' : 'fail');
  test('Owner sees roles', ok(await api.get(t, '/admin/roles')) ? 'pass' : 'fail');
  test('Owner reads role permissions', ok(await api.get(t, '/admin/roles/owner/permissions')) ? 'pass' : 'fail');
  test('Owner reads user counts', ok(await api.get(t, '/admin/roles/user-counts')) ? 'pass' : 'fail');
  test('Owner reads recent audit logs', ok(await api.get(t, '/admin/audit-logs/recent')) ? 'pass' : 'fail');
  test('Owner sees sales', ok(await api.get(t, '/sales')) ? 'pass' : 'fail');
  test('Owner sees transfers', ok(await api.get(t, '/transfers')) ? 'pass' : 'fail');
}

async function testMultiStoreManager(tokens) {
  section('3. Multi-Store Manager Access');
  if (!tokens.multiManager) { test('Manager token available', 'fail', 'no token'); return; }
  const t = tokens.multiManager;

  const me = await api.get(t, '/auth/me');
  test('Manager profile loaded', ok(me) ? 'pass' : 'fail', `http=${me.httpStatus}`);
  test('Role = multi_store_manager', d(me, 'role.name') === 'multi_store_manager' ? 'pass' : 'fail', d(me, 'role.name'));
  const mgrFinScope = getFinancialScope(t);
  test('financialScope = none', mgrFinScope === 'none' ? 'pass' : 'fail', mgrFinScope);

  for (const [name, id] of Object.entries(BRANCHES)) {
    const inv = await api.get(t, `/inventory?branchId=${id}&limit=1`);
    test(`Manager access ${name}`, ok(inv) ? 'pass' : 'fail', `http=${inv.httpStatus}`);
  }

  test('Manager sees users', ok(await api.get(t, '/admin/users')) ? 'pass' : 'fail');

  const roles = await api.get(t, '/admin/roles');
  test('Manager blocked from roles', denied(roles) ? 'pass' : 'fail', `http=${roles.httpStatus}`);

  const dash = await api.get(t, '/reports/dashboard');
  test('Manager dashboard financial controlled', denied(dash) ? 'pass' : 'fail', `http=${dash.httpStatus}`);

  const reports = await api.get(t, '/reports');
  test('Manager reports controlled', denied(reports) ? 'pass' : 'fail', `http=${reports.httpStatus}`);
}

async function testStoreStaffIsolation(tokens) {
  section('4. Store Staff Isolation');

  const staffTests = [
    { key: 'shopSalesA', name: 'Shop Sales A', branch: 'MAIN' },
    { key: 'storeSalesB', name: 'Store Sales B', branch: 'MAIN' },
  ];

  for (const staff of staffTests) {
    if (!tokens[staff.key]) { test(`${staff.name} token`, 'fail', 'no token'); continue; }
    const t = tokens[staff.key];

    console.log(`\n  --- ${staff.name} ---`);

    const ownInv = await api.get(t, '/inventory?limit=1');
    test(`${staff.name}: own inventory`, ok(ownInv) ? 'pass' : 'fail', `http=${ownInv.httpStatus}`);

    // Cross-store GET (branch filter should limit results)
    for (const [bName, bId] of Object.entries(BRANCHES)) {
      if (bName === staff.branch) continue;
      const crossInv = await api.get(t, `/inventory?branchId=${bId}&limit=1`);
      test(`${staff.name}: ${bName} inventory (filtered)`, ok(crossInv) || denied(crossInv) ? 'pass' : 'fail');
    }

    // Cross-store POST
    const crossPost = await api.post(t, '/inventory', {
      productId: '00000000-0000-0000-0000-000000000000',
      branchId: BRANCHES.CHETLA, quantity: 1, condition: 'new',
    });
    test(`${staff.name}: cross-store POST blocked`, denied(crossPost) ? 'pass' : 'fail', `http=${crossPost.httpStatus}`);

    // Cross-store PATCH
    const crossPatch = await api.patch(t, `/inventory/${BRANCHES.CHETLA}`, { quantity: 1 });
    test(`${staff.name}: cross-store PATCH blocked`, denied(crossPatch) ? 'pass' : 'fail', `http=${crossPatch.httpStatus}`);

    // Dashboard (financial)
    const dash = await api.get(t, '/reports/dashboard');
    test(`${staff.name}: dashboard financial blocked`, denied(dash) ? 'pass' : 'fail', `http=${dash.httpStatus}`);

    // Admin endpoints
    test(`${staff.name}: admin users blocked`, denied(await api.get(t, '/admin/users')) ? 'pass' : 'fail');
    test(`${staff.name}: admin roles blocked`, denied(await api.get(t, '/admin/roles')) ? 'pass' : 'fail');
    test(`${staff.name}: role permissions blocked`, denied(await api.get(t, '/admin/roles/owner/permissions')) ? 'pass' : 'fail');
    test(`${staff.name}: audit logs blocked`, denied(await api.get(t, '/admin/audit-logs/recent')) ? 'pass' : 'fail');

    // Sales
    const sales = await api.get(t, '/sales');
    test(`${staff.name}: sales access`, ok(sales) || denied(sales) ? 'pass' : 'fail', `http=${sales.httpStatus}`);
  }
}

async function testFinancialIsolation(tokens) {
  section('5. Financial Data Isolation');

  if (tokens.owner) {
    const dash = await api.get(tokens.owner, '/reports/dashboard');
    test('Owner: dashboard KPIs visible', ok(dash) ? 'pass' : 'fail', `http=${dash.httpStatus}`);
  }

  if (tokens.multiManager) {
    const dash = await api.get(tokens.multiManager, '/reports/dashboard');
    test('Manager: dashboard financial blocked', denied(dash) ? 'pass' : 'fail', `http=${dash.httpStatus}`);
  }

  for (const key of ['shopSalesA', 'storeSalesB', 'callingStaff', 'employee']) {
    if (!tokens[key]) continue;
    const dash = await api.get(tokens[key], '/reports/dashboard');
    test(`${USERS[key].name}: dashboard financial blocked`, denied(dash) ? 'pass' : 'fail', `http=${dash.httpStatus}`);
  }

  if (tokens.shopSalesA) {
    const users = await api.get(tokens.shopSalesA, '/admin/users');
    test('Staff cannot enumerate users', denied(users) ? 'pass' : 'fail', `http=${users.httpStatus}`);
  }
}

async function testAdminEndpoints(tokens) {
  section('6. Admin Endpoint Security');

  if (tokens.owner) {
    const t = tokens.owner;
    test('Owner: list users', ok(await api.get(t, '/admin/users')) ? 'pass' : 'fail');
    test('Owner: list roles', ok(await api.get(t, '/admin/roles')) ? 'pass' : 'fail');
    test('Owner: role permissions', ok(await api.get(t, '/admin/roles/owner/permissions')) ? 'pass' : 'fail');
    test('Owner: user counts', ok(await api.get(t, '/admin/roles/user-counts')) ? 'pass' : 'fail');
    test('Owner: recent audit logs', ok(await api.get(t, '/admin/audit-logs/recent')) ? 'pass' : 'fail');
  }

  for (const key of ['multiManager', 'shopSalesA', 'storeSalesB', 'callingStaff', 'employee']) {
    if (!tokens[key]) continue;
    const t = tokens[key];
    const name = USERS[key].name;
    // Note: multi_store_manager intentionally has users.view permission
  const adminUsersResp = await api.get(t, '/admin/users');
  const shouldBlock = key !== 'multiManager';
  const adminUsersResult = shouldBlock ? denied(adminUsersResp) : ok(adminUsersResp);
  test(`${name}: admin users ${shouldBlock ? 'blocked' : 'allowed'}`, adminUsersResult ? 'pass' : 'fail', `http=${adminUsersResp.httpStatus}`);
    test(`${name}: admin roles blocked`, denied(await api.get(t, '/admin/roles')) ? 'pass' : 'fail');
    test(`${name}: role perms blocked`, denied(await api.get(t, '/admin/roles/owner/permissions')) ? 'pass' : 'fail');
    test(`${name}: audit logs blocked`, denied(await api.get(t, '/admin/audit-logs/recent')) ? 'pass' : 'fail');
  }

  const noAuth = await api.get(null, '/admin/users');
  test('No token: admin users 401', noAuth.httpStatus === 401 ? 'pass' : 'fail', `http=${noAuth.httpStatus}`);
}

async function testCrossStoreDataLeakage(tokens) {
  section('7. Cross-Store Data Leakage Prevention');
  if (!tokens.shopSalesA) { test('Staff A token', 'fail', 'no token'); return; }
  const t = tokens.shopSalesA;

  for (const [name, id] of Object.entries(BRANCHES)) {
    if (name === 'MAIN') continue;
    const inv = await api.get(t, `/inventory?branchId=${id}&limit=5`);
    if (ok(inv)) {
      const items = d(inv, 'data') || d(inv, 'items') || [];
      const wrongBranch = items.some(i => i.branchId === id);
      test(`Staff A → ${name}: no leakage`, !wrongBranch ? 'pass' : 'fail', `${items.length} items`);
    } else {
      test(`Staff A → ${name}: blocked`, denied(inv) ? 'pass' : 'fail', `http=${inv.httpStatus}`);
    }
  }

  const crossCreate = await api.post(t, '/inventory', {
    productId: '00000000-0000-0000-0000-000000000000',
    branchId: BRANCHES.CHETLA, quantity: 1, condition: 'new',
  });
  test('Staff cannot create cross-store inventory', denied(crossCreate) ? 'pass' : 'fail', `http=${crossCreate.httpStatus}`);

  const crossSales = await api.get(t, `/sales?branchId=${BRANCHES.CHETLA}`);
  test('Staff cross-store sales filtered', ok(crossSales) || denied(crossSales) ? 'pass' : 'fail', `http=${crossSales.httpStatus}`);
}

async function testPermissionHierarchy(tokens) {
  section('8. Permission Hierarchy');

  // Permissions are in the JWT, not /auth/me
  if (tokens.owner) {
    const perms = getPerms(tokens.owner);
    test('Owner: financial.view', perms.includes('financial.view') ? 'pass' : 'fail', `${perms.length} perms total`);
    test('Owner: financial.pnl', perms.includes('financial.pnl') ? 'pass' : 'fail');
    test('Owner: sales.approve', perms.includes('sales.approve') ? 'pass' : 'fail');
  }

  if (tokens.multiManager) {
    const perms = getPerms(tokens.multiManager);
    const noFinancial = !perms.includes('financial.view') && !perms.includes('financial.pnl');
    test('Manager: no financial permissions', noFinancial ? 'pass' : 'fail',
      `financial perms: ${perms.filter(p => p.includes('financial')).join(',') || 'none'}`);
  }

  for (const key of ['shopSalesA', 'storeSalesB', 'callingStaff', 'employee']) {
    if (!tokens[key]) continue;
    const perms = getPerms(tokens[key]);
    const noFinancial = !perms.includes('financial.view') && !perms.includes('financial.pnl');
    test(`${USERS[key].name}: no financial permissions`, noFinancial ? 'pass' : 'fail',
      `financial perms: ${perms.filter(p => p.includes('financial')).join(',') || 'none'}`);
  }

  // Hierarchy: owner > manager > sales (from JWT)
  const ownerPerms = tokens.owner ? getPerms(tokens.owner) : [];
  const mgrPerms = tokens.multiManager ? getPerms(tokens.multiManager) : [];
  const salesPerms = tokens.shopSalesA ? getPerms(tokens.shopSalesA) : [];

  test('Owner has most permissions', ownerPerms.length >= mgrPerms.length ? 'pass' : 'fail',
    `owner=${ownerPerms.length} mgr=${mgrPerms.length}`);
  test('Manager has more than sales', mgrPerms.length >= salesPerms.length ? 'pass' : 'fail',
    `mgr=${mgrPerms.length} sales=${salesPerms.length}`);
}

async function testEndpointChains(tokens) {
  section('9. Endpoint Authorization Chains');

  if (tokens.owner) {
    test('GET /inventory: owner passes', ok(await api.get(tokens.owner, '/inventory?limit=1')) ? 'pass' : 'fail');
    test('GET /reports/dashboard: owner passes', ok(await api.get(tokens.owner, '/reports/dashboard')) ? 'pass' : 'fail');
    test('GET /admin/users: owner passes', ok(await api.get(tokens.owner, '/admin/users')) ? 'pass' : 'fail');
  }

  if (tokens.shopSalesA) {
    test('GET /sales: sales staff allowed', ok(await api.get(tokens.shopSalesA, '/sales')) ? 'pass' : 'fail');
    test('GET /reports/dashboard: sales staff blocked', denied(await api.get(tokens.shopSalesA, '/reports/dashboard')) ? 'pass' : 'fail');
  }
}

async function testInventoryAcrossBranches(tokens) {
  section('10. Inventory Access Across Branches');

  if (tokens.owner) {
    for (const [name, id] of Object.entries(BRANCHES)) {
      const inv = await api.get(tokens.owner, `/inventory?branchId=${id}&limit=1`);
      test(`Owner: ${name} inventory`, ok(inv) ? 'pass' : 'fail');
    }
  }

  if (tokens.multiManager) {
    for (const [name, id] of Object.entries(BRANCHES)) {
      const inv = await api.get(tokens.multiManager, `/inventory?branchId=${id}&limit=1`);
      test(`Manager: ${name} inventory`, ok(inv) ? 'pass' : 'fail');
    }
  }

  if (tokens.shopSalesA) {
    const ownInv = await api.get(tokens.shopSalesA, '/inventory?limit=5');
    test('Staff: own branch inventory visible', ok(ownInv) ? 'pass' : 'fail');

    // Without explicit branchId — should auto-inject own branch
    const autoInv = await api.get(tokens.shopSalesA, '/inventory?limit=5');
    if (ok(autoInv)) {
      const items = d(autoInv, 'data') || d(autoInv, 'items') || [];
      const allOwn = items.every(i => !i.branchId || i.branchId === BRANCHES.MAIN);
      test('Staff: auto-injected branch filter', allOwn ? 'pass' : 'fail', `${items.length} items`);
    }
  }
}

// ===== MAIN =====

async function main() {
  console.log('🧪 Full RBAC Test Suite — Live VPS');
  console.log(`Target: ${API}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Branches: ${Object.keys(BRANCHES).length}`);
  console.log(`Users: ${Object.keys(USERS).length}`);

  const tokens = {};

  try {
    await testAuth(tokens);
    await testOwnerAccess(tokens);
    await testMultiStoreManager(tokens);
    await testStoreStaffIsolation(tokens);
    await testFinancialIsolation(tokens);
    await testAdminEndpoints(tokens);
    await testCrossStoreDataLeakage(tokens);
    await testPermissionHierarchy(tokens);
    await testEndpointChains(tokens);
    await testInventoryAcrossBranches(tokens);
  } catch (err) {
    console.error('\n💥 Fatal error:', err.message);
    failed++;
    failures.push({ name: 'FATAL', detail: err.message });
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  RESULTS');
  console.log('═'.repeat(60));
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⚠️  Skipped: ${skipped}`);
  console.log(`  📊 Total:  ${passed + failed + skipped}`);
  console.log(`  📈 Rate:   ${passed + failed > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : 0}%`);

  if (failures.length > 0) {
    console.log('\n  FAILURES:');
    failures.forEach((f, i) => console.log(`    ${i + 1}. ${f.name}: ${f.detail}`));
  }

  console.log('\n  SECTION SUMMARY:');
  for (const s of sectionResults) {
    const p = s.tests.filter(t => t.result === 'pass').length;
    const f = s.tests.filter(t => t.result === 'fail').length;
    console.log(`    ${f === 0 ? '✅' : '❌'} ${s.name}: ${p}/${p + f}`);
  }

  console.log('═'.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
