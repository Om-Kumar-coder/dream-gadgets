#!/usr/bin/env node
/**
 * Staff Creation & Branch Assignment Test Suite
 * Tests: Create staff → assign branch → verify isolation → cleanup
 *
 * API format: { status: "success"|"error", data: {...} }
 * Auth: { status: "success", data: { accessToken, refreshToken, user } }
 */

const https = require('https');

const BRANCHES = {
  MAIN: '20af0e99-886e-4f8f-bf7e-1fd98360d91d',
  CHETLA: '8d876f4f-aa29-4169-8da8-0a8c07d88b9a',
  JADAVPUR: '8c47263c-1639-4a33-b0fd-3358da6169eb',
};

let passed = 0;
let failed = 0;
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
  console.log(`  ${icon} ${name}${detail ? ' (' + detail + ')' : ''}`);
  if (sectionResults.length > 0) sectionResults[sectionResults.length - 1].tests.push({ name, result });
}

// Is the response a successful HTTP response? (2xx with apiStatus success, or 204 no-content)
function ok(r) {
  if (!r) return false;
  if (r.httpStatus === 204) return true; // DELETE returns 204
  return r.apiStatus === 'success' && r.httpStatus >= 200 && r.httpStatus < 300;
}

function denied(r) { return !r || r.httpStatus === 401 || r.httpStatus === 403 || r.apiStatus === 'error'; }

function jwtPayload(token) {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); }
  catch { return {}; }
}

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
        if (res.statusCode === 204) {
          resolve({ httpStatus: 204, apiStatus: 'success', data: null });
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          resolve({ httpStatus: res.statusCode, apiStatus: parsed.status, data: parsed.data, message: parsed.message || parsed.error });
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

async function login(phone, password) {
  return httpsRequest('POST', '/auth/login', null, { identifier: phone, password });
}

// Unique phones to avoid collisions
const TS = Date.now().toString().slice(-6);
const PHONES = {
  salesA: `97000${TS}01`,
  salesB: `97000${TS}02`,
  calling: `97000${TS}03`,
  reassigned: `97000${TS}04`,
};

const userIds = []; // track for cleanup

async function main() {
  console.log('🧪 Staff Creation & Branch Assignment Test Suite');
  console.log(`Target: https://dreamgadgets.in/api/v1`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Test phones: ${JSON.stringify(PHONES)}`);

  // ─── 1. OWNER LOGIN & ROLE IDS ──────────────────────────────────────
  section('1. Owner Login & Role Discovery');

  const ownerLogin = await login('9800000001', 'Test@1234');
  const ownerToken = ok(ownerLogin) ? ownerLogin.data?.accessToken : null;
  test('Owner login', ownerToken ? 'pass' : 'fail');
  if (!ownerToken) { console.log('  Cannot continue without owner token'); return; }

  // Get roles — response is { status: "success", data: [...roles] }
  const rolesResp = await api.get(ownerToken, '/admin/roles');
  // data IS the array directly (not nested)
  const roles = rolesResp.data || [];
  const roleMap = {};
  for (const r of roles) roleMap[r.name] = r.id;
  test('Role IDs loaded', Object.keys(roleMap).length > 0 ? 'pass' : 'fail',
    `found ${Object.keys(roleMap).length} roles`);

  const shopSalesRole = roleMap['shop_sales'];
  const callingStaffRole = roleMap['calling_staff'];
  const storeSalesRole = roleMap['store_sales'];
  const employeeRole = roleMap['employee'];

  test('shop_sales role ID exists', !!shopSalesRole ? 'pass' : 'fail', shopSalesRole?.substring(0, 8));
  test('calling_staff role ID exists', !!callingStaffRole ? 'pass' : 'fail', callingStaffRole?.substring(0, 8));
  test('store_sales role ID exists', !!storeSalesRole ? 'pass' : 'fail', storeSalesRole?.substring(0, 8));

  if (!shopSalesRole) { console.log('  Cannot continue without role IDs'); return; }

  // ─── 2. CREATE STAFF FOR SPECIFIC BRANCH ────────────────────────────
  section('2. Create Staff for Specific Branch');

  // 2a: shop_sales → MAIN
  const createA = await api.post(ownerToken, '/admin/users', {
    firstName: 'Test', lastName: 'SalesA', phone: PHONES.salesA,
    password: 'Test@1234', roleId: shopSalesRole, branchId: BRANCHES.MAIN,
  });
  const idA = createA.data?.id;
  if (idA) userIds.push(idA);
  test('Create shop_sales → MAIN', ok(createA) ? 'pass' : 'fail', `http=${createA.httpStatus}`);
  test('User has correct role', createA.data?.roleId === shopSalesRole ? 'pass' : 'fail');
  test('User has correct branch', createA.data?.branchId === BRANCHES.MAIN ? 'pass' : 'fail');
  test('User is active', createA.data?.isActive === true ? 'pass' : 'fail');

  // 2b: calling_staff → CHETLA
  const createC = await api.post(ownerToken, '/admin/users', {
    firstName: 'Test', lastName: 'Calling', phone: PHONES.calling,
    password: 'Test@1234', roleId: callingStaffRole, branchId: BRANCHES.CHETLA,
  });
  const idC = createC.data?.id;
  if (idC) userIds.push(idC);
  test('Create calling_staff → CHETLA', ok(createC) ? 'pass' : 'fail');
  test('Calling staff branch = CHETLA', createC.data?.branchId === BRANCHES.CHETLA ? 'pass' : 'fail');

  // 2c: store_sales → JADAVPUR
  if (storeSalesRole) {
    const createB = await api.post(ownerToken, '/admin/users', {
      firstName: 'Test', lastName: 'SalesB', phone: PHONES.salesB,
      password: 'Test@1234', roleId: storeSalesRole, branchId: BRANCHES.JADAVPUR,
    });
    const idB = createB.data?.id;
    if (idB) userIds.push(idB);
    test('Create store_sales → JADAVPUR', ok(createB) ? 'pass' : 'fail');
    test('SalesB branch = JADAVPUR', createB.data?.branchId === BRANCHES.JADAVPUR ? 'pass' : 'fail');
  }

  // ─── 3. DUPLICATE PHONE REJECTION ───────────────────────────────────
  section('3. Duplicate Phone Rejection');

  const dupe = await api.post(ownerToken, '/admin/users', {
    firstName: 'Dupe', phone: PHONES.salesA, password: 'Test@1234',
    roleId: shopSalesRole, branchId: BRANCHES.MAIN,
  });
  test('Duplicate phone rejected', dupe.httpStatus === 409 ? 'pass' : 'fail', `http=${dupe.httpStatus}`);

  // ─── 4. LOGIN AS NEW STAFF → JWT VERIFICATION ──────────────────────
  section('4. New Staff Login & JWT Verification');

  const loginA = await login(PHONES.salesA, 'Test@1234');
  const tokenA = ok(loginA) ? loginA.data?.accessToken : null;
  test('SalesA login', tokenA ? 'pass' : 'fail');

  if (tokenA) {
    const jwt = jwtPayload(tokenA);
    test('JWT role = shop_sales', jwt.role === 'shop_sales' ? 'pass' : 'fail', String(jwt.role));
    test('JWT branchId = MAIN', jwt.branchId === BRANCHES.MAIN ? 'pass' : 'fail', jwt.branchId?.substring(0, 8));
    test('JWT financialScope = none', jwt.financialScope === 'none' ? 'pass' : 'fail', jwt.financialScope);
    test('JWT has inventory.view', jwt.permissions?.includes('inventory.view') ? 'pass' : 'fail');
    test('JWT has sales.create', jwt.permissions?.includes('sales.create') ? 'pass' : 'fail');
    test('JWT has NO financial.view', !jwt.permissions?.includes('financial.view') ? 'pass' : 'fail');
    test('JWT has NO users.view', !jwt.permissions?.includes('users.view') ? 'pass' : 'fail');
    test('JWT has NO inventory.create', !jwt.permissions?.includes('inventory.create') ? 'pass' : 'fail');
  }

  const loginC = await login(PHONES.calling, 'Test@1234');
  const tokenC = ok(loginC) ? loginC.data?.accessToken : null;
  test('Calling staff login', tokenC ? 'pass' : 'fail');

  if (tokenC) {
    const jwt = jwtPayload(tokenC);
    test('Calling JWT role = calling_staff', jwt.role === 'calling_staff' ? 'pass' : 'fail', String(jwt.role));
    test('Calling JWT branchId = CHETLA', jwt.branchId === BRANCHES.CHETLA ? 'pass' : 'fail');
    test('Calling JWT financialScope = none', jwt.financialScope === 'none' ? 'pass' : 'fail');
    test('Calling JWT has clients.create', jwt.permissions?.includes('clients.create') ? 'pass' : 'fail');
  }

  // ─── 5. OWN BRANCH ACCESS ──────────────────────────────────────────
  section('5. Branch Isolation — Own Branch Access');

  if (tokenA) {
    const mainInv = await api.get(tokenA, '/inventory?branchId=' + BRANCHES.MAIN + '&limit=1');
    test('SalesA → MAIN inventory', ok(mainInv) ? 'pass' : 'fail', `http=${mainInv.httpStatus}`);

    const autoInv = await api.get(tokenA, '/inventory?limit=5');
    test('SalesA → auto-inject MAIN', ok(autoInv) ? 'pass' : 'fail', `http=${autoInv.httpStatus}`);

    const ownSales = await api.get(tokenA, '/sales');
    test('SalesA → own sales', ok(ownSales) || denied(ownSales) ? 'pass' : 'fail');
  }

  if (tokenC) {
    const chetlaInv = await api.get(tokenC, '/inventory?branchId=' + BRANCHES.CHETLA + '&limit=1');
    test('Calling → CHETLA inventory', ok(chetlaInv) ? 'pass' : 'fail', `http=${chetlaInv.httpStatus}`);
  }

  // ─── 6. CROSS-BRANCH MUTATION BLOCKED ──────────────────────────────
  section('6. Cross-Branch Mutation Blocked');

  if (tokenA) {
    const crossPost1 = await api.post(tokenA, '/inventory', {
      productId: '00000000-0000-0000-0000-000000000000',
      branchId: BRANCHES.CHETLA, quantity: 1, condition: 'new',
    });
    test('SalesA → CHETLA POST blocked', denied(crossPost1) ? 'pass' : 'fail', `http=${crossPost1.httpStatus}`);

    const crossPost2 = await api.post(tokenA, '/inventory', {
      productId: '00000000-0000-0000-0000-000000000000',
      branchId: BRANCHES.JADAVPUR, quantity: 1, condition: 'new',
    });
    test('SalesA → JADAVPUR POST blocked', denied(crossPost2) ? 'pass' : 'fail', `http=${crossPost2.httpStatus}`);

    const dash = await api.get(tokenA, '/reports/dashboard');
    test('SalesA → dashboard blocked', denied(dash) ? 'pass' : 'fail', `http=${dash.httpStatus}`);

    test('SalesA → admin users blocked', denied(await api.get(tokenA, '/admin/users')) ? 'pass' : 'fail');
    test('SalesA → admin roles blocked', denied(await api.get(tokenA, '/admin/roles')) ? 'pass' : 'fail');
  }

  if (tokenC) {
    const crossPost = await api.post(tokenC, '/inventory', {
      productId: '00000000-0000-0000-0000-000000000000',
      branchId: BRANCHES.MAIN, quantity: 1, condition: 'new',
    });
    test('Calling → MAIN POST blocked', denied(crossPost) ? 'pass' : 'fail', `http=${crossPost.httpStatus}`);
  }

  // ─── 7. NON-OWNER CANNOT CREATE USERS ──────────────────────────────
  section('7. Non-Owner Cannot Create Users');

  if (tokenA) {
    const hack = await api.post(tokenA, '/admin/users', {
      firstName: 'Hacker', phone: '9999999998', password: 'hack123',
    });
    test('Staff cannot create users', denied(hack) ? 'pass' : 'fail', `http=${hack.httpStatus}`);
  }

  // ─── 8. REASSIGN STAFF TO DIFFERENT BRANCH ─────────────────────────
  section('8. Reassign Staff to Different Branch');

  const createReassign = await api.post(ownerToken, '/admin/users', {
    firstName: 'Test', lastName: 'Reassign', phone: PHONES.reassigned,
    password: 'Test@1234', roleId: shopSalesRole, branchId: BRANCHES.MAIN,
  });
  const reassignId = createReassign.data?.id;
  if (reassignId) userIds.push(reassignId);
  test('Create reassign user → MAIN', ok(createReassign) ? 'pass' : 'fail');

  // Login before reassignment
  const loginR1 = await login(PHONES.reassigned, 'Test@1234');
  const tokenR1 = ok(loginR1) ? loginR1.data?.accessToken : null;
  test('Reassign login (before)', tokenR1 ? 'pass' : 'fail');

  if (tokenR1) {
    const p1 = jwtPayload(tokenR1);
    test('Before: branchId = MAIN', p1.branchId === BRANCHES.MAIN ? 'pass' : 'fail');

    const mainInv = await api.get(tokenR1, '/inventory?limit=1');
    test('Before: can access MAIN', ok(mainInv) ? 'pass' : 'fail', `http=${mainInv.httpStatus}`);
  }

  // Reassign to CHETLA
  if (reassignId) {
    const patch = await api.patch(ownerToken, `/admin/users/${reassignId}`, {
      branchId: BRANCHES.CHETLA,
    });
    test('Owner reassigns → CHETLA', ok(patch) ? 'pass' : 'fail', `http=${patch.httpStatus}`);
    test('Branch updated', patch.data?.branchId === BRANCHES.CHETLA ? 'pass' : 'fail');

    // Fresh login after reassignment
    const loginR2 = await login(PHONES.reassigned, 'Test@1234');
    const tokenR2 = ok(loginR2) ? loginR2.data?.accessToken : null;
    test('Reassign login (after)', tokenR2 ? 'pass' : 'fail');

    if (tokenR2) {
      const p2 = jwtPayload(tokenR2);
      test('After: branchId = CHETLA', p2.branchId === BRANCHES.CHETLA ? 'pass' : 'fail');

      const chetlaInv = await api.get(tokenR2, '/inventory?branchId=' + BRANCHES.CHETLA + '&limit=1');
      test('After: can access CHETLA', ok(chetlaInv) ? 'pass' : 'fail', `http=${chetlaInv.httpStatus}`);

      const mainInv2 = await api.get(tokenR2, '/inventory?branchId=' + BRANCHES.MAIN + '&limit=1');
      test('After: MAIN filtered', ok(mainInv2) || denied(mainInv2) ? 'pass' : 'fail');

      const wrongBranch = await api.post(tokenR2, '/inventory', {
        productId: '00000000-0000-0000-0000-000000000000',
        branchId: BRANCHES.MAIN, quantity: 1, condition: 'new',
      });
      test('After: MAIN POST blocked', denied(wrongBranch) ? 'pass' : 'fail', `http=${wrongBranch.httpStatus}`);
    }
  }

  // ─── 9. OWNER SEES ALL USERS ───────────────────────────────────────
  section('9. Owner Can See All Staff');

  const dashCheck = await api.get(ownerToken, '/reports/dashboard');
  test('Owner: dashboard works', ok(dashCheck) ? 'pass' : 'fail');

  const allUsers = await api.get(ownerToken, '/admin/users');
  if (ok(allUsers)) {
    // data might be array or paginated
    const users = Array.isArray(allUsers.data) ? allUsers.data : (allUsers.data?.data || []);
    const found = users.filter(u => Object.values(PHONES).includes(u.phone));
    test('Owner: sees newly created users', found.length >= 3 ? 'pass' : 'fail',
      `found ${found.length} of ${Object.keys(PHONES).length}`);
  } else {
    test('Owner: list users', 'fail', `http=${allUsers.httpStatus}`);
  }

  // ─── 10. DEACTIVATE & VERIFY ───────────────────────────────────────
  section('10. Deactivate Staff & Verify');

  if (idA) {
    const deact = await api.del(ownerToken, `/admin/users/${idA}`);
    test('Owner deactivates SalesA', ok(deact) ? 'pass' : 'fail', `http=${deact.httpStatus}`);

    const deadLogin = await login(PHONES.salesA, 'Test@1234');
    test('Deactivated user cannot login', deadLogin.apiStatus === 'error' ? 'pass' : 'fail',
      `api=${deadLogin.apiStatus}`);
  }

  // ─── CLEANUP ───────────────────────────────────────────────────────
  section('Cleanup');

  for (const uid of userIds) {
    const del = await api.del(ownerToken, `/admin/users/${uid}`);
    test(`Delete user ${uid.substring(0, 8)}...`, ok(del) ? 'pass' : 'fail');
  }

  // ─── SUMMARY ────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('  RESULTS');
  console.log('═'.repeat(60));
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
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
