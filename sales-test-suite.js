#!/usr/bin/env node
/**
 * Sales Flow Test Suite — Live VPS
 * Tests: Create sale, verify inventory deducted, financial data, permissions
 *
 * API: { status: "success"|"error", data: {...} }
 */

const https = require('https');

const BRANCHES = {
  MAIN: '20af0e99-886e-4f8f-bf7e-1fd98360d91d',
  CHETLA: '8d876f4f-aa29-4169-8da8-0a8c07d88b9a',
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

function ok(r) { if (!r) return false; if (r.httpStatus === 204) return true; return r.apiStatus === 'success' && r.httpStatus >= 200 && r.httpStatus < 300; }
function denied(r) { return !r || r.httpStatus === 401 || r.httpStatus === 403 || r.apiStatus === 'error'; }
function jwtPayload(token) { try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); } catch { return {}; } }

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
        if (res.statusCode === 204) { resolve({ httpStatus: 204, apiStatus: 'success', data: null }); return; }
        try { const p = JSON.parse(raw); resolve({ httpStatus: res.statusCode, apiStatus: p.status, data: p.data, message: p.message || p.error }); }
        catch { resolve({ httpStatus: res.statusCode, apiStatus: 'parse_error', data: null, raw: raw.substring(0, 300) }); }
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

async function login(phone, password) { return httpsRequest('POST', '/auth/login', null, { identifier: phone, password }); }
function getToken(resp) { return ok(resp) ? resp.data?.accessToken : null; }

async function findAvailableItems(token, branchId, count = 3) {
  const resp = await api.get(token, `/inventory?branchId=${branchId}&limit=50`);
  if (!ok(resp)) return [];
  const items = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
  return items.filter(i => i.status === 'available' && i.branchId === branchId).slice(0, count);
}

async function getSalesCount(token, branchId) {
  const resp = await api.get(token, `/sales?branchId=${branchId}&limit=200`);
  if (!ok(resp)) return -1;
  const items = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
  return items.filter(s => s.branchId === branchId).length;
}

async function getDashboardKPIs(token) {
  const resp = await api.get(token, '/reports/dashboard');
  return ok(resp) ? resp.data : null;
}

async function main() {
  console.log('🧪 Sales Flow Test Suite — Live VPS');
  console.log(`Target: https://dreamgadgets.in/api/v1`);
  console.log(`Time: ${new Date().toISOString()}`);

  // ─── 1. SETUP ─────────────────────────────────────────────────────
  section('1. Setup & Login');

  const ownerLogin = await login('9800000001', 'Test@1234');
  const ownerToken = getToken(ownerLogin);
  test('Owner login', ownerToken ? 'pass' : 'fail');
  if (!ownerToken) { console.log('  Cannot continue'); return; }

  const jwt = jwtPayload(ownerToken);
  test('Owner has sales.create', jwt.permissions?.includes('sales.create') ? 'pass' : 'fail');
  test('Owner has sales.view', jwt.permissions?.includes('sales.view') ? 'pass' : 'fail');
  test('Owner has sales.approve', jwt.permissions?.includes('sales.approve') ? 'pass' : 'fail');

  // Find available items
  const items = await findAvailableItems(ownerToken, BRANCHES.MAIN, 3);
  test('Found available items', items.length >= 2 ? 'pass' : 'fail', `found ${items.length}`);
  if (items.length < 2) { console.log('  Need at least 2 items'); return; }

  const item1 = items[0];
  const item2 = items[1];
  console.log(`\n  Using items: ${item1.id.substring(0, 8)} (₹${item1.sellingPrice}) and ${item2.id.substring(0, 8)} (₹${item2.sellingPrice})`);

  // Get baseline counts
  const salesBefore = await getSalesCount(ownerToken, BRANCHES.MAIN);
  test('Sales count baseline', salesBefore >= 0 ? 'pass' : 'fail', `${salesBefore} sales`);

  const dashBefore = await getDashboardKPIs(ownerToken);
  test('Dashboard KPIs loaded', !!dashBefore ? 'pass' : 'fail');

  // ─── 2. PERMISSION CHECKS ─────────────────────────────────────────
  section('2. Sales Permission Checks');

  // Create a limited user (calling_staff has sales.view but NOT sales.create)
  const TS = Date.now().toString().slice(-6);
  const limitedPhone = `97000${TS}31`;
  const rolesResp = await api.get(ownerToken, '/admin/roles');
  const roles = rolesResp.data || [];
  const roleMap = {};
  for (const r of roles) roleMap[r.name] = r.id;

  const createLimited = await api.post(ownerToken, '/admin/users', {
    firstName: 'Test', lastName: 'NoSaleCreate', phone: limitedPhone,
    password: 'Test@1234', roleId: roleMap['calling_staff'], branchId: BRANCHES.MAIN,
  });
  const limitedId = createLimited.data?.id;

  const limitedLogin = await login(limitedPhone, 'Test@1234');
  const limitedToken = getToken(limitedLogin);
  test('Limited user login', limitedToken ? 'pass' : 'fail');

  if (limitedToken) {
    const lj = jwtPayload(limitedToken);
    test('Limited has NO sales.create', !lj.permissions?.includes('sales.create') ? 'pass' : 'fail');

    const hackSale = await api.post(limitedToken, '/sales', {
      branchId: BRANCHES.MAIN,
      items: [{ itemId: item1.id, unitPrice: 100 }],
      payments: [{ method: 'cash', amount: 100 }],
    });
    test('Limited: create sale blocked', denied(hackSale) ? 'pass' : 'fail', `http=${hackSale.httpStatus}`);
  }

  // ─── 3. VALIDATION ────────────────────────────────────────────────
  section('3. Sale Validation');

  // Wrong branch item
  const wrongBranch = await api.post(ownerToken, '/sales', {
    branchId: BRANCHES.CHETLA,
    items: [{ itemId: item1.id, unitPrice: 100 }],
    payments: [{ method: 'cash', amount: 100 }],
  });
  test('Wrong branch item rejected', denied(wrongBranch) ? 'pass' : 'fail', `http=${wrongBranch.httpStatus}`);

  // Non-existent item
  const fakeItem = await api.post(ownerToken, '/sales', {
    branchId: BRANCHES.MAIN,
    items: [{ itemId: '00000000-0000-0000-0000-000000000000', unitPrice: 100 }],
    payments: [{ method: 'cash', amount: 100 }],
  });
  test('Non-existent item rejected', denied(fakeItem) ? 'pass' : 'fail', `http=${fakeItem.httpStatus}`);

  // Payment mismatch
  const mismatch = await api.post(ownerToken, '/sales', {
    branchId: BRANCHES.MAIN,
    items: [{ itemId: item1.id, unitPrice: 100 }],
    payments: [{ method: 'cash', amount: 50 }], // Only 50 for 100 item
  });
  test('Payment mismatch rejected', denied(mismatch) ? 'pass' : 'fail', `http=${mismatch.httpStatus}`);

  // Empty items
  const emptyItems = await api.post(ownerToken, '/sales', {
    branchId: BRANCHES.MAIN,
    items: [],
    payments: [{ method: 'cash', amount: 100 }],
  });
  test('Empty items rejected', denied(emptyItems) ? 'pass' : 'fail', `http=${emptyItems.httpStatus}`);

  // ─── 4. CREATE SALE ───────────────────────────────────────────────
  section('4. Create Sale (POS)');

  // Get fresh items right before sale creation
  const freshItems = await findAvailableItems(ownerToken, BRANCHES.MAIN, 2);
  test('Fresh items available for sale', freshItems.length >= 2 ? 'pass' : 'fail', `found ${freshItems.length}`);
  if (freshItems.length < 2) { console.log('  Skipping sale creation — not enough items'); return; }

  const fi1 = freshItems[0];
  const fi2 = freshItems[1];
  const salePrice1 = parseFloat(String(fi1.sellingPrice)) || 94999;
  const salePrice2 = parseFloat(String(fi2.sellingPrice)) || 69999;

  // No taxRate = 0, so total = subtotal. Payment must match total.
  const totalAmount = salePrice1 + salePrice2;

  console.log(`  Fresh items: ${fi1.id.substring(0, 8)} (₹${salePrice1}) + ${fi2.id.substring(0, 8)} (₹${salePrice2}) = ₹${totalAmount}`);

  const createSale = await api.post(ownerToken, '/sales', {
    branchId: BRANCHES.MAIN,
    items: [
      { itemId: fi1.id, unitPrice: salePrice1 },
      { itemId: fi2.id, unitPrice: salePrice2 },
    ],
    payments: [
      { method: 'cash', amount: totalAmount },
    ],
    notes: 'Test sale from automated suite',
  });

  test('Sale created', ok(createSale) ? 'pass' : 'fail', `http=${createSale.httpStatus}`);

  const saleId = createSale.data?.id;
  const invoiceNumber = createSale.data?.invoiceNumber;
  test('Sale has ID', !!saleId ? 'pass' : 'fail');
  test('Invoice number format', invoiceNumber?.startsWith('DG-MAIN-') ? 'pass' : 'fail', invoiceNumber);
  test('Sale payment status = paid', createSale.data?.paymentStatus === 'paid' ? 'pass' : 'fail', createSale.data?.paymentStatus);
  test('Sale branch = MAIN', createSale.data?.branchId === BRANCHES.MAIN ? 'pass' : 'fail');
  test('Total amount calculated', createSale.data?.totalAmount > 0 ? 'pass' : 'fail', createSale.data?.totalAmount);
  test('Notes preserved', createSale.data?.notes === 'Test sale from automated suite' ? 'pass' : 'fail');

  // ─── 5. INVENTORY DEDUCTED ────────────────────────────────────────
  section('5. Inventory Deducted After Sale');

  // Items should now be 'sold'
  const item1After = await findItemStatus(ownerToken, fi1.id);
  const item2After = await findItemStatus(ownerToken, fi2.id);

  async function findItemStatus(token, itemId) {
    for (const [name, id] of Object.entries(BRANCHES)) {
      const resp = await api.get(token, `/inventory?branchId=${id}&limit=200`);
      if (!ok(resp)) continue;
      const items = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      const found = items.find(i => i.id === itemId);
      if (found) return found;
    }
    return null;
  }

  test('Item 1 status = sold', item1After?.status === 'sold' ? 'pass' : 'fail', item1After?.status);
  test('Item 2 status = sold', item2After?.status === 'sold' ? 'pass' : 'fail', item2After?.status);

  // Items should no longer be available
  test('Item 1 no longer available', item1After?.status !== 'available' ? 'pass' : 'fail');
  test('Item 2 no longer available', item2After?.status !== 'available' ? 'pass' : 'fail');

  // ─── 6. CANNOT RESELL ALREADY SOLD ITEM ───────────────────────────
  section('6. Cannot Resell Sold Items');

  const resell = await api.post(ownerToken, '/sales', {
    branchId: BRANCHES.MAIN,
    items: [{ itemId: fi1.id, unitPrice: salePrice1 }],
    payments: [{ method: 'cash', amount: salePrice1 }],
  });
  test('Resell rejected', denied(resell) ? 'pass' : 'fail', `http=${resell.httpStatus}`);

  // ─── 7. VIEW SALE ─────────────────────────────────────────────────
  section('7. View Sale');

  const viewSale = await api.get(ownerToken, `/sales/${saleId}`);
  test('View sale by ID', ok(viewSale) ? 'pass' : 'fail', `http=${viewSale.httpStatus}`);

  if (ok(viewSale)) {
    const s = viewSale.data;
    test('Sale items count', s.items?.length === 2 ? 'pass' : 'fail', `${s.items?.length} items`);
    test('Sale payment status = paid', s.paymentStatus === 'paid' ? 'pass' : 'fail', s.paymentStatus);
    test('Payments recorded', s.payments?.length >= 1 ? 'pass' : 'fail');
    test('Invoice number', s.invoiceNumber?.startsWith('DG-MAIN-') ? 'pass' : 'fail');
  }

  // List sales
  const listSales = await api.get(ownerToken, '/sales');
  test('List sales', ok(listSales) ? 'pass' : 'fail');
  if (ok(listSales)) {
    const salesList = Array.isArray(listSales.data) ? listSales.data : (listSales.data?.data || []);
    test('Our sale in list', salesList.some(s => s.id === saleId) ? 'pass' : 'fail');
  }

  // Filter by branch
  const filterBranch = await api.get(ownerToken, `/sales?branchId=${BRANCHES.MAIN}`);
  test('Filter by branch', ok(filterBranch) ? 'pass' : 'fail');

  // ─── 8. SALES COUNT INCREASED ─────────────────────────────────────
  section('8. Sales Count Increased');

  const salesAfter = await getSalesCount(ownerToken, BRANCHES.MAIN);
  test('Sales count increased', salesAfter > salesBefore ? 'pass' : 'fail',
    `${salesBefore} → ${salesAfter}`);

  // ─── 9. FINANCIAL DATA (Owner) ────────────────────────────────────
  section('9. Financial Data (Owner)');

  const dashAfter = await getDashboardKPIs(ownerToken);
  test('Dashboard KPIs still accessible', !!dashAfter ? 'pass' : 'fail');

  if (dashAfter) {
    test('Dashboard has todaySalesCount', dashAfter.todaySalesCount !== undefined ? 'pass' : 'fail');
    test('Dashboard has todaySalesValue', dashAfter.todaySalesValue !== undefined ? 'pass' : 'fail');
    test('Dashboard has activeStockCount', dashAfter.activeStockCount !== undefined ? 'pass' : 'fail');
  }

  // ─── 10. FINANCIAL DATA BLOCKED FOR STAFF ─────────────────────────
  section('10. Financial Data Blocked for Staff');

  if (limitedToken) {
    const staffDash = await api.get(limitedToken, '/reports/dashboard');
    test('Staff: dashboard blocked', denied(staffDash) ? 'pass' : 'fail', `http=${staffDash.httpStatus}`);
  }

  // ─── 11. CROSS-BRANCH SALE PREVENTION ─────────────────────────────
  section('11. Cross-Branch Sale Prevention');

  // Create CHETLA staff
  const chetlaPhone = `97000${TS}41`;
  const createChetlaStaff = await api.post(ownerToken, '/admin/users', {
    firstName: 'Test', lastName: 'ChetlaSale', phone: chetlaPhone,
    password: 'Test@1234', roleId: roleMap['shop_sales'], branchId: BRANCHES.CHETLA,
  });
  const chetlaStaffId = createChetlaStaff.data?.id;

  const chetlaLogin = await login(chetlaPhone, 'Test@1234');
  const chetlaToken = getToken(chetlaLogin);
  test('CHETLA staff login', chetlaToken ? 'pass' : 'fail');

  if (chetlaToken) {
    // Try to sell an item from MAIN branch
    const crossSale = await api.post(chetlaToken, '/sales', {
      branchId: BRANCHES.MAIN,
      items: [{ itemId: item1.id, unitPrice: 100 }],
      payments: [{ method: 'cash', amount: 100 }],
    });
    test('Staff: cross-branch sale blocked', denied(crossSale) ? 'pass' : 'fail', `http=${crossSale.httpStatus}`);
  }

  // ─── 12. UNAUTHENTICATED ACCESS ───────────────────────────────────
  section('12. Unauthenticated Access');

  const noAuthList = await api.get(null, '/sales');
  test('No token: list sales → 401', noAuthList.httpStatus === 401 ? 'pass' : 'fail');

  const noAuthCreate = await api.post(null, '/sales', {
    branchId: BRANCHES.MAIN, items: [], payments: [],
  });
  test('No token: create sale → 401', noAuthCreate.httpStatus === 401 ? 'pass' : 'fail');

  // ─── CLEANUP ───────────────────────────────────────────────────────
  section('Cleanup');

  for (const uid of [limitedId, chetlaStaffId].filter(Boolean)) {
    const del = await api.del(ownerToken, `/admin/users/${uid}`);
    test(`Delete user ${uid?.substring(0, 8)}...`, ok(del) ? 'pass' : 'fail');
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
