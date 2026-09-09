#!/usr/bin/env node
const { chromium } = require('playwright');

const BASE = 'https://dreamgadgets.in';

// CORRECTED based on actual JWT decode
const roles = [
  { name: 'Owner',            phone: '9800000001', count: 167, perms: ['dashboard.view','inventory.view','sales.view','purchases.view','branches.view','clients.view','transfers.view','exchange.view','orders.view','buyback.view','returns.view','coupons.view','emi.view','reports.view','financial.view','users.view','settings.view','notifications.view','whatsapp.view','content.view','products.publish','roles.view'] },
  { name: 'Multi-Store Mgr',  phone: '9800000007', count: 52,  perms: ['dashboard.view','inventory.view','sales.view','purchases.view','branches.view','clients.view','transfers.view','exchange.view','orders.view','buyback.view','returns.view','coupons.view','emi.view','reports.view','users.view','notifications.view','whatsapp.view','products.publish'] },
  { name: 'Store Manager',    phone: '9800000002', count: 50,  perms: ['dashboard.view','inventory.view','sales.view','purchases.view','branches.view','clients.view','transfers.view','exchange.view','orders.view','buyback.view','returns.view','coupons.view','emi.view','reports.view','notifications.view','whatsapp.view','products.publish'] },
  { name: 'Shop Sales',       phone: '9800000003', count: 22,  perms: ['dashboard.view','inventory.view','sales.view','purchases.view','clients.view','exchange.view','orders.view','buyback.view','returns.view','coupons.view','emi.view','whatsapp.view'] },
  { name: 'Store Sales',      phone: '9800000004', count: 21,  perms: ['dashboard.view','inventory.view','sales.view','purchases.view','clients.view','exchange.view','orders.view','buyback.view','returns.view','coupons.view','emi.view'] },
  { name: 'Calling Staff',    phone: '9800000005', count: 16,  perms: ['dashboard.view','clients.view','orders.view','buyback.view','returns.view','coupons.view','emi.view','purchases.view','whatsapp.view'] },
  { name: 'Employee',         phone: '9800000006', count: 1,   perms: ['dashboard.view'] },
];

// Page → permission required (matching sidebar navPermissionMap)
const pagePerms = {
  '/dashboard': 'dashboard.view',
  '/purchases': 'purchases.view',
  '/sales': 'sales.view',
  '/inventory': 'inventory.view',
  '/branches': 'branches.view',
  '/accessories': 'inventory.view',
  '/clients': 'clients.view',
  '/transfers': 'transfers.view',
  '/exchange': 'exchange.view',
  '/orders': 'orders.view',
  '/buyback': 'buyback.view',
  '/price-guide': 'inventory.view',
  '/returns': 'returns.view',
  '/coupons': 'coupons.view',
  '/emi': 'emi.view',
  '/refunds': 'returns.view',
  '/reports': 'reports.view',
  '/gst': 'financial.view',
  '/notifications': 'notifications.view',
  '/users': 'users.view',
  '/brands': 'content.view',
  '/announcement-bar': 'content.view',
  '/settings': 'settings.view',
  '/whatsapp': 'whatsapp.view',
  '/banners': 'content.view',
};

let total = 0;
let passed = 0;
let failed = 0;
const failures = [];

function test(role, desc, ok, detail = '') {
  total++;
  if (ok) {
    passed++;
    console.log(`  ✅ ${desc}`);
  } else {
    failed++;
    const msg = `  ❌ ${desc} ${detail ? '— ' + detail : ''}`;
    console.log(msg);
    failures.push(`[${role}] ${desc} ${detail ? '— ' + detail : ''}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const role of roles) {
    console.log(`\n${'='.repeat(50)}\n${role.name} (${role.phone}) — ${role.count} perms\n${'='.repeat(50)}`);

    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('console', () => {});

    // Login
    try {
      await page.goto(`${BASE}/admin/login`);
      await page.waitForTimeout(2000);
      await page.fill('input[name="identifier"]', role.phone);
      await page.fill('input[name="password"]', 'Test@1234');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
      const url = page.url();
      test(role.name, 'Login', url.includes('/admin/dashboard'));
    } catch (e) {
      test(role.name, 'Login', false, e.message.substring(0, 80));
      await context.close();
      continue;
    }

    // Wait extra for store to hydrate
    await page.waitForTimeout(1000);

    // Check sidebar: get all sidebar links and their hrefs
    let sidebarLinks = [];
    try {
      sidebarLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('aside a[href]');
        return Array.from(links).map(a => a.getAttribute('href'));
      });
    } catch {}

    // Also get dropdown buttons (Settings, WhatsApp, Banners)
    let sidebarButtons = [];
    try {
      sidebarButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('aside button');
        return Array.from(buttons).map(b => b.textContent.trim().toLowerCase());
      });
    } catch {}

    // console.log(`  [debug] sidebarLinks: ${sidebarLinks.length}, buttons: ${sidebarButtons.join(', ')}`);

    for (const [path, perm] of Object.entries(pagePerms)) {
      const shouldShow = role.perms.includes(perm);
      const adminPath = `/admin${path}`;

      // For dropdown items (settings, whatsapp, banners), check button visibility
      const isDropdown = path === '/settings' || path === '/whatsapp' || path === '/banners';

      if (isDropdown) {
        const buttonName = path === '/settings' ? 'settings' : path === '/whatsapp' ? 'whatsapp' : 'banner';
        const hasButton = sidebarButtons.some(b => b.includes(buttonName));
        test(role.name, `Sidebar: ${path} ${shouldShow ? 'shown' : 'hidden'}`, hasButton === shouldShow,
          hasButton && !shouldShow ? 'button visible but should be hidden' : !hasButton && shouldShow ? 'button hidden but should be shown' : '');
      } else {
        const inSidebar = sidebarLinks.some(href => href === adminPath || href === path);
        test(role.name, `Sidebar: ${path} ${shouldShow ? 'shown' : 'hidden'}`, inSidebar === shouldShow,
          inSidebar && !shouldShow ? 'link visible but should be hidden' : !inSidebar && shouldShow ? 'link hidden but should be shown' : '');
      }

      // Navigate to page and check access
      try {
        await page.goto(`${BASE}${adminPath}`);
        await page.waitForTimeout(2500);
        const currentUrl = page.url();
        const hasAccessDenied = await page.locator('h2:has-text("Access Denied")').first().isVisible().catch(() => false);
        const isOnDashboard = currentUrl.includes('/admin/dashboard');

        if (shouldShow) {
          const accessible = !hasAccessDenied && !isOnDashboard;
          test(role.name, `Access: ${path}`, accessible, accessible ? '' : hasAccessDenied ? 'Access Denied shown' : `redirected to dashboard`);
        } else {
          const blocked = hasAccessDenied || isOnDashboard;
          test(role.name, `Blocked: ${path}`, blocked, blocked ? '' : `loaded at ${currentUrl.replace(BASE, '')}`);
        }
      } catch (e) {
        test(role.name, `Page: ${path}`, !shouldShow, e.message.substring(0, 60));
      }
    }

    await context.close();
  }

  await browser.close();
  console.log(`\n${'='.repeat(50)}\nTOTAL: ${passed}/${total} passed (${failed} failed)\n${'='.repeat(50)}`);
  if (failures.length > 0) {
    console.log('\n=== FAILURES ===');
    failures.forEach(f => console.log(f));
  }
  process.exit(failed > 0 ? 1 : 0);
})();
