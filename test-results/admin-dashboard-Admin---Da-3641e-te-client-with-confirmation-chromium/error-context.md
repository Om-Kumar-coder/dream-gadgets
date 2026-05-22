# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\dashboard.spec.ts >> Admin - Dashboard & Management >> should delete client with confirmation
- Location: tests\e2e\admin\dashboard.spec.ts:171:7

# Error details

```
TypeError: fetch failed
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const ADMIN_BASE = process.env.ADMIN_BASE_URL || 'http://localhost:3002';
  4   | const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
  5   | 
  6   | test.describe('Admin - Dashboard & Management', () => {
  7   |   test.beforeEach(async ({ page, context }) => {
  8   |     // Login as admin via API and set cookies
> 9   |     const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
      |                      ^ TypeError: fetch failed
  10  |       method: 'POST',
  11  |       headers: { 'Content-Type': 'application/json' },
  12  |       body: JSON.stringify({
  13  |         identifier: 'admin@test.com',
  14  |         password: 'Admin@12345'
  15  |       })
  16  |     });
  17  |     
  18  |     if (loginRes.ok) {
  19  |       const data = await loginRes.json();
  20  |       await context.addCookies([{
  21  |         name: 'authToken',
  22  |         value: data.data.accessToken,
  23  |         url: ADMIN_BASE
  24  |       }]);
  25  |     }
  26  | 
  27  |     await page.goto(`${ADMIN_BASE}/dashboard`);
  28  |   });
  29  | 
  30  |   test('should display dashboard with KPIs', async ({ page }) => {
  31  |     // Should show main dashboard
  32  |     await expect(page.locator('h1, [data-testid="dashboard-title"]')).toContainText(/dashboard|overview/i);
  33  |     
  34  |     // Should display key metrics
  35  |     await expect(page.locator('[data-testid="kpi-card"], .stat-card, .metric')).toHaveCount(n => n >= 4);
  36  |     
  37  |     // Common KPIs: Revenue, Orders, Customers, Products
  38  |     const kpiTexts = await page.locator('[data-testid="kpi-card"], .stat-card').allTextContents();
  39  |     const hasCommonKPIs = kpiTexts.some(t => /revenue|sales|income/i.test(t)) &&
  40  |                           kpiTexts.some(t => /order|transaction/i.test(t)) &&
  41  |                           kpiTexts.some(t => /customer|client|user/i.test(t));
  42  |     expect(hasCommonKPIs || kpiTexts.length > 0).toBeTruthy();
  43  |     
  44  |     // Should show navigation sidebar
  45  |     await expect(page.locator('[data-testid="sidebar"], .sidebar, nav')).toBeVisible();
  46  |   });
  47  | 
  48  |   test('should navigate between sections using sidebar', async ({ page }) => {
  49  |     // Click on clients link
  50  |     const clientsLink = page.locator('a[href*="clients"], button:has-text("Clients"), span:has-text("Clients")');
  51  |     if (await clientsLink.isVisible()) {
  52  |       await clientsLink.click();
  53  |       await page.waitForURL(`${ADMIN_BASE}/*clients*`, { timeout: 5000 });
  54  |       
  55  |       await expect(page).toHaveURL(/clients/i);
  56  |     }
  57  |     
  58  |     // Click on inventory link
  59  |     const inventoryLink = page.locator('a[href*="inventory"], button:has-text("Inventory"), span:has-text("Products")');
  60  |     if (await inventoryLink.isVisible()) {
  61  |       await inventoryLink.click();
  62  |       await page.waitForURL(`${ADMIN_BASE}/*inventory*`, { timeout: 5000 });
  63  |       
  64  |       await expect(page).toHaveURL(/inventory|products/i);
  65  |     }
  66  |   });
  67  | 
  68  |   test('should display clients list with table', async ({ page }) => {
  69  |     // Navigate to clients
  70  |     await page.goto(`${ADMIN_BASE}/clients`);
  71  |     
  72  |     // Should show clients table or list
  73  |     const table = page.locator('table, [role="grid"], [data-testid="clients-table"]');
  74  |     if (await table.isVisible()) {
  75  |       // Should have header row
  76  |       const headers = page.locator('th, [role="columnheader"]');
  77  |       expect(await headers.count()).toBeGreaterThan(0);
  78  |       
  79  |       // Should have data rows
  80  |       const rows = page.locator('tbody tr, [role="row"]');
  81  |       expect(await rows.count()).toBeGreaterThan(0);
  82  |     }
  83  |   });
  84  | 
  85  |   test('should filter clients in list', async ({ page }) => {
  86  |     await page.goto(`${ADMIN_BASE}/clients`);
  87  |     
  88  |     // Find filter input
  89  |     const filterInput = page.locator('input[placeholder*="Search"], input[placeholder*="Filter"], [data-testid="search-input"]');
  90  |     if (await filterInput.isVisible()) {
  91  |       await filterInput.fill('test');
  92  |       
  93  |       // Results should update
  94  |       await page.waitForTimeout(1000);
  95  |       
  96  |       // Rows should be filtered
  97  |       const rows = page.locator('tbody tr, [role="row"]:not([role="columnheader"])');
  98  |       expect(await rows.count()).toBeGreaterThan(0);
  99  |     }
  100 |   });
  101 | 
  102 |   test('should sort clients table', async ({ page }) => {
  103 |     await page.goto(`${ADMIN_BASE}/clients`);
  104 |     
  105 |     // Click on table header to sort
  106 |     const nameHeader = page.locator('th:has-text("Name"), th:has-text("Client"), [role="columnheader"]:has-text("Name")');
  107 |     if (await nameHeader.isVisible()) {
  108 |       await nameHeader.click();
  109 |       
```