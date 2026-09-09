const { chromium } = require('playwright');
const BASE = 'https://dreamgadgets.in';

const roles = [
  { phone: '9800000001', name: 'Owner', slug: 'shop_owner' },
  { phone: '9800000007', name: 'Multi-Store Mgr', slug: 'multi_store_manager' },
  { phone: '9800000002', name: 'Store Manager', slug: 'store_manager' },
  { phone: '9800000003', name: 'Shop Sales', slug: 'shop_sales' },
  { phone: '9800000004', name: 'Store Sales', slug: 'store_sales' },
  { phone: '9800000005', name: 'Calling Staff', slug: 'calling_staff' },
  { phone: '9800000006', name: 'Employee', slug: 'employee' },
];

// Expected sidebar items per role based on permissions
const expectedSidebar = {
  'shop_owner':          ['Dashboard','Purchases','Sales / POS','Inventory','Stores','Accessories','Clients','Transfers','Exchange','Online Orders','Buyback Leads','Price Guide','Returns','Coupons','EMI Plans','Refunds','Reports','GST Reports','Notifications','Users & Roles','Brand Heroes','Announcement Bar','WhatsApp','Banner Management','Settings'],
  'multi_store_manager': ['Dashboard','Purchases','Sales / POS','Inventory','Stores','Accessories','Clients','Transfers','Exchange','Online Orders','Buyback Leads','Price Guide','Returns','Coupons','EMI Plans','Refunds','Notifications','Users & Roles','WhatsApp'],
  'store_manager':       ['Dashboard','Purchases','Sales / POS','Inventory','Clients','Transfers','Exchange','Online Orders','Buyback Leads','Price Guide','Returns','Coupons','EMI Plans','Refunds','Notifications','WhatsApp','Banner Management','Settings'],
  'shop_sales':          ['Dashboard','Purchases','Sales / POS','Inventory','Clients','Exchange','Online Orders','Buyback Leads','Price Guide','Returns','Coupons','EMI Plans','Refunds','Notifications','WhatsApp'],
  'store_sales':         ['Dashboard','Purchases','Sales / POS','Inventory','Clients','Exchange','Online Orders','Buyback Leads','Price Guide','Returns','Coupons','EMI Plans','Refunds','Notifications'],
  'calling_staff':       ['Dashboard','Clients','Online Orders','Buyback Leads','Price Guide','Returns','Notifications','WhatsApp'],
  'employee':            ['Dashboard'],
};

// Pages that have PermissionGate (should show Access Denied for unauthorized)
const gatedPages = {
  '/clients':      'clients.view',
  '/inventory':    'inventory.view',
  '/purchases':    'purchases.view',
  '/sales':        'sales.view',
  '/sales/pos':    'sales.create',
  '/transfers':    'transfers.view',
};

// Pages that DON'T have PermissionGate — any logged-in user can see them
const ungatedPages = [
  '/accessories', '/announcement-bar', '/banners', '/branches', '/brands',
  '/buyback', '/coupons', '/emi', '/exchange', '/gst', '/notifications',
  '/orders', '/price-guide', '/refunds', '/reports', '/returns', '/settings',
  '/users', '/whatsapp',
];

let totalTests = 0;
let totalPass = 0;
let totalFail = 0;
const failures = [];

function test(label, passed, detail = '') {
  totalTests++;
  if (passed) {
    totalPass++;
  } else {
    totalFail++;
    failures.push(`${label}: ${detail}`);
  }
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${label}${detail ? ' — ' + detail : ''}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login(page, phone) {
  await page.goto(`${BASE}/admin/login`);
  await sleep(2000);
  await page.fill('input[name="identifier"]', phone);
  await page.fill('input[name="password"]', 'Test@1234');
  await page.click('button[type="submit"]');
  await sleep(3500);
  return page.url().includes('/admin/dashboard');
}

async function getSidebarItems(page) {
  const links = await page.$$eval('aside nav a', els => els.map(e => e.textContent.trim()));
  // Get expandable dropdown buttons too
  const buttons = await page.$$eval('aside nav button', els => els.map(e => e.textContent.trim()));
  return { links: links.filter(Boolean), buttons: buttons.filter(Boolean) };
}

async function visitPage(page, path) {
  await page.goto(`${BASE}/admin${path}`);
  await sleep(2500);
  const url = page.url();
  const body = await page.textContent('body');
  return { url, body };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const role of roles) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ROLE: ${role.name} (${role.slug}) — Phone: ${role.phone}`);
    console.log(`${'='.repeat(60)}`);
    
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    
    // ─── LOGIN ───
    const loggedIn = await login(page, role.phone);
    test('Login', loggedIn, loggedIn ? 'redirected to dashboard' : 'FAILED to login');
    
    if (!loggedIn) {
      await context.close();
      continue;
    }
    
    // ─── SIDEBAR ITEMS ───
    const sidebar = await getSidebarItems(page);
    const allSidebarItems = [...sidebar.links, ...sidebar.buttons];
    const expected = expectedSidebar[role.slug] || [];
    
    for (const item of expected) {
      const found = allSidebarItems.some(s => s.includes(item));
      test(`Sidebar: "${item}"`, found, found ? '' : 'MISSING from sidebar');
    }
    
    // Check for items that shouldn't be there
    const forbiddenItems = {
      'shop_owner': [],
      'multi_store_manager': ['Settings', 'GST Reports', 'Reports', 'Brand Heroes', 'Announcement Bar'],
      'store_manager': ['Users & Roles', 'Brand Heroes', 'Announcement Bar'],
      'shop_sales': ['Stores', 'Users & Roles', 'Reports', 'Settings', 'Brand Heroes', 'Announcement Bar', 'Banner Management'],
      'store_sales': ['Stores', 'Users & Roles', 'Reports', 'Settings', 'Brand Heroes', 'Announcement Bar', 'Banner Management'],
      'calling_staff': ['Purchases', 'Sales / POS', 'Inventory', 'Exchange', 'Online Orders', 'Stores', 'Accessories', 'Transfers', 'Buyback Leads', 'Price Guide', 'Returns', 'Coupons', 'EMI Plans', 'Refunds', 'Reports', 'Settings', 'Users & Roles', 'Brand Heroes', 'Announcement Bar', 'Banner Management'],
      'employee': ['Purchases', 'Sales / POS', 'Inventory', 'Clients', 'Exchange', 'Online Orders', 'Stores', 'Accessories', 'Transfers', 'Buyback Leads', 'Price Guide', 'Returns', 'Coupons', 'EMI Plans', 'Refunds', 'Reports', 'Settings', 'Users & Roles', 'Brand Heroes', 'Announcement Bar', 'Banner Management', 'WhatsApp'],
    };
    
    const forbidden = forbiddenItems[role.slug] || [];
    for (const item of forbidden) {
      const found = allSidebarItems.some(s => s.includes(item));
      test(`Sidebar hidden: "${item}"`, !found, found ? 'SHOULD BE HIDDEN but is visible!' : '');
    }
    
    // ─── DASHBOARD PAGE ───
    const dash = await visitPage(page, '/dashboard');
    test('Dashboard loads', dash.url.includes('/dashboard'));
    
    // Check for Financial KPIs (only owner)
    const hasFinancial = dash.body.includes('Net Income') || dash.body.includes('Revenue');
    if (role.slug === 'shop_owner') {
      test('Financial KPIs visible', hasFinancial);
    } else {
      test('Financial KPIs hidden', !hasFinancial, hasFinancial ? 'SHOULD BE HIDDEN!' : '');
    }
    
    // ─── GATED PAGES ───
    for (const [path, perm] of Object.entries(gatedPages)) {
      const result = await visitPage(page, path);
      const hasAccess = !result.body.includes('Access Denied') && !result.body.includes('Permission Denied');
      
      // Determine if user should have this permission
      let shouldHave = false;
      if (role.slug === 'shop_owner') shouldHave = true;
      else if (role.slug === 'multi_store_manager') shouldHave = ['purchases.view','sales.view','inventory.view','clients.view','transfers.view','sales.create'].includes(perm);
      else if (role.slug === 'store_manager') shouldHave = ['purchases.view','sales.view','inventory.view','clients.view','transfers.view','sales.create'].includes(perm);
      else if (role.slug === 'shop_sales') shouldHave = ['purchases.view','sales.view','inventory.view','clients.view','sales.create'].includes(perm);
      else if (role.slug === 'store_sales') shouldHave = ['purchases.view','sales.view','inventory.view','clients.view','sales.create'].includes(perm);
      else if (role.slug === 'calling_staff') shouldHave = false;
      else if (role.slug === 'employee') shouldHave = false;
      
      test(`Page ${path} (${perm})`, shouldHave ? hasAccess : !hasAccess, 
        shouldHave && !hasAccess ? 'SHOULD HAVE ACCESS but blocked' : 
        !shouldHave && hasAccess ? 'SHOULD BE BLOCKED but has access (no PermissionGate?)' : '');
    }
    
    // ─── UNGATED PAGES — check if they load ───
    for (const path of ungatedPages) {
      const result = await visitPage(page, path);
      const loaded = result.url.includes(path.replace('/admin', ''));
      const hasContent = result.body.length > 500;
      // These pages have no PermissionGate so they'll load for everyone — flag them
      if (!['shop_owner'].includes(role.slug) && loaded && hasContent) {
        test(`Page ${path} (ungated)`, false, `Loads for ${role.name} — needs PermissionGate!`);
      }
    }
    
    // ─── BUTTONS & ACTIONS ───
    // Navigate to sales page and check for "New Sale" button
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const salesPage = await visitPage(page, '/sales');
      const hasNewSaleBtn = salesPage.body.includes('New Sale') || salesPage.body.includes('POS');
      test('Sales page: New Sale button', hasNewSaleBtn);
    }
    
    // Check inventory page for Add Product button
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const invPage = await visitPage(page, '/inventory');
      const hasAddBtn = invPage.body.includes('Add') || invPage.body.includes('New');
      test('Inventory page: Add button', hasAddBtn);
    }
    
    // Check users page
    if (['shop_owner','multi_store_manager'].includes(role.slug)) {
      const usersPage = await visitPage(page, '/users');
      const hasUsers = usersPage.body.includes('Users') || usersPage.body.includes('Add');
      test('Users page loads', hasUsers);
    }
    
    // Check clients page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff'].includes(role.slug)) {
      const clientsPage = await visitPage(page, '/clients');
      const hasClients = clientsPage.body.includes('Client') || clientsPage.body.includes('Add');
      test('Clients page loads', hasClients);
    }
    
    // Check buyback page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff'].includes(role.slug)) {
      const bbPage = await visitPage(page, '/buyback');
      const hasBB = bbPage.body.includes('Buyback') || bbPage.body.includes('Lead');
      test('Buyback page loads', hasBB);
    }
    
    // Check exchange page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const exPage = await visitPage(page, '/exchange');
      const hasEx = exPage.body.includes('Exchange') || exPage.body.includes('Device');
      test('Exchange page loads', hasEx);
    }
    
    // Check reports page  
    if (['shop_owner','multi_store_manager','store_manager'].includes(role.slug)) {
      const rPage = await visitPage(page, '/reports');
      const hasR = rPage.body.includes('Report') || rPage.body.includes('Export');
      test('Reports page loads', hasR);
    }
    
    // Check GST page (owner only for financial)
    if (role.slug === 'shop_owner') {
      const gstPage = await visitPage(page, '/gst');
      const hasGST = gstPage.body.includes('GST') || gstPage.body.includes('GSTR');
      test('GST page loads', hasGST);
    }
    
    // Check coupons page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const cpPage = await visitPage(page, '/coupons');
      const hasCP = cpPage.body.includes('Coupon') || cpPage.body.includes('Add');
      test('Coupons page loads', hasCP);
    }
    
    // Check EMI page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const emiPage = await visitPage(page, '/emi');
      const hasEMI = emiPage.body.includes('EMI') || emiPage.body.includes('Plan');
      test('EMI page loads', hasEMI);
    }
    
    // Check transfers page — should only load for owner, multi, store_manager
    const transPage = await visitPage(page, '/transfers');
    const transHasAccess = !transPage.body.includes('Access Denied');
    const shouldHaveTransfer = ['shop_owner','multi_store_manager','store_manager'].includes(role.slug);
    test('Transfers page', shouldHaveTransfer ? transHasAccess : !transHasAccess,
      shouldHaveTransfer && !transHasAccess ? 'OWNER/MGR blocked!' :
      !shouldHaveTransfer && transHasAccess ? 'Staff can access transfers!' : '');
    
    // Check returns page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff'].includes(role.slug)) {
      const retPage = await visitPage(page, '/returns');
      const hasRet = retPage.body.includes('Return');
      test('Returns page loads', hasRet);
    }
    
    // Check orders page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff'].includes(role.slug)) {
      const ordPage = await visitPage(page, '/orders');
      const hasOrd = ordPage.body.includes('Order');
      test('Orders page loads', hasOrd);
    }
    
    // Check accessories page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const accPage = await visitPage(page, '/accessories');
      const hasAcc = accPage.body.includes('Accessories') || accPage.body.includes('Accessory');
      test('Accessories page loads', hasAcc);
    }
    
    // Check settings page — owner and store_manager only
    if (role.slug === 'shop_owner' || role.slug === 'store_manager') {
      const setPage = await visitPage(page, '/settings');
      const hasSet = setPage.body.includes('Setting') || setPage.body.includes('Branch');
      test('Settings page loads', hasSet);
    }
    
    // Check notifications page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff'].includes(role.slug)) {
      const notifPage = await visitPage(page, '/notifications');
      const hasNotif = notifPage.body.includes('Notification') || notifPage.body.includes('Bell');
      test('Notifications page loads', hasNotif);
    }
    
    // Check whatsapp page  
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','calling_staff'].includes(role.slug)) {
      const waPage = await visitPage(page, '/whatsapp');
      const hasWA = waPage.body.includes('WhatsApp') || waPage.body.includes('Chat');
      test('WhatsApp page loads', hasWA);
    }
    
    // Check brands page
    if (['shop_owner','multi_store_manager','store_manager'].includes(role.slug)) {
      const brPage = await visitPage(page, '/brands');
      const hasBR = brPage.body.includes('Brand');
      test('Brands page loads', hasBR);
    }
    
    // Check announcement bar page
    if (role.slug === 'shop_owner' || role.slug === 'store_manager') {
      const abPage = await visitPage(page, '/announcement-bar');
      const hasAB = abPage.body.includes('Announcement');
      test('Announcement Bar page loads', hasAB);
    }
    
    // Check banners page
    if (['shop_owner','store_manager'].includes(role.slug)) {
      const bnPage = await visitPage(page, '/banners');
      const hasBN = bnPage.body.includes('Banner');
      test('Banners page loads', hasBN);
    }
    
    // Check refunds page
    if (['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales'].includes(role.slug)) {
      const rfPage = await visitPage(page, '/refunds');
      const hasRF = rfPage.body.includes('Refund');
      test('Refunds page loads', hasRF);
    }
    
    await context.close();
  }
  
  await browser.close();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${totalTests} tests | ✅ ${totalPass} passed | ❌ ${totalFail} failed`);
  console.log(`${'='.repeat(60)}`);
  
  if (failures.length > 0) {
    console.log(`\nFAILURES (${failures.length}):`);
    failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
  }
  
  process.exit(totalFail > 0 ? 1 : 0);
})();
