# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\checkout.spec.ts >> Web - Shopping & Checkout Flow >> should proceed to checkout
- Location: tests\e2e\web\checkout.spec.ts:209:7

# Error details

```
TypeError: fetch failed
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3001';
  4   | const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
  5   | 
  6   | test.describe('Web - Shopping & Checkout Flow', () => {
  7   |   let authToken: string;
  8   |   let userId: string;
  9   | 
  10  |   test.beforeAll(async () => {
  11  |     // Create and login test user via API
> 12  |     const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      |                         ^ TypeError: fetch failed
  13  |       method: 'POST',
  14  |       headers: { 'Content-Type': 'application/json' },
  15  |       body: JSON.stringify({
  16  |         email: `shopper_${Date.now()}@test.com`,
  17  |         password: 'Test@12345',
  18  |         phone: '9999999999',
  19  |         firstName: 'Shopper',
  20  |         lastName: 'Test'
  21  |       })
  22  |     });
  23  |     const registerData = await registerRes.json();
  24  |     userId = registerData.data.id;
  25  | 
  26  |     const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
  27  |       method: 'POST',
  28  |       headers: { 'Content-Type': 'application/json' },
  29  |       body: JSON.stringify({
  30  |         identifier: registerData.data.email,
  31  |         password: 'Test@12345'
  32  |       })
  33  |     });
  34  |     const loginData = await loginRes.json();
  35  |     authToken = loginData.data.accessToken;
  36  |   });
  37  | 
  38  |   test('should browse products and display list', async ({ page }) => {
  39  |     await page.goto(`${WEB_BASE}/products`);
  40  |     
  41  |     // Should show product list or grid
  42  |     await expect(page.locator('[data-testid="product-card"], .product-item, .product-card')).toHaveCount(n => n > 0);
  43  |     
  44  |     // Product cards should have essential info
  45  |     await expect(page.locator('[data-testid="product-card"]:first-child').locator('img')).toBeVisible();
  46  |     await expect(page.locator('[data-testid="product-card"]:first-child').locator('[data-testid="product-name"], .product-name')).toBeVisible();
  47  |     await expect(page.locator('[data-testid="product-card"]:first-child').locator('[data-testid="product-price"], .product-price')).toBeVisible();
  48  |   });
  49  | 
  50  |   test('should search products', async ({ page }) => {
  51  |     await page.goto(`${WEB_BASE}/products`);
  52  |     
  53  |     // Find search input
  54  |     const searchInput = page.locator('input[placeholder*="Search"], input[name="search"], [data-testid="search-input"]');
  55  |     await searchInput.fill('iPhone');
  56  |     await searchInput.press('Enter');
  57  |     
  58  |     // Results should update (either by navigation or dynamic update)
  59  |     await page.waitForTimeout(1000);
  60  |     
  61  |     // Should show filtered products or "no results"
  62  |     const results = page.locator('[data-testid="product-card"], .product-item');
  63  |     const resultsCount = await results.count();
  64  |     const noResultsMsg = page.locator('text=/no results|not found/i');
  65  |     
  66  |     expect(resultsCount > 0 || await noResultsMsg.isVisible()).toBeTruthy();
  67  |   });
  68  | 
  69  |   test('should filter products by category', async ({ page }) => {
  70  |     await page.goto(`${WEB_BASE}/products`);
  71  |     
  72  |     // Click category filter
  73  |     const categoryFilter = page.locator('button:has-text("Category"), [data-testid="filter-category"], select[name="category"]').first();
  74  |     await categoryFilter.click();
  75  |     
  76  |     // Select an option
  77  |     const filterOption = page.locator('button:has-text("Smartphone"), option, li').first();
  78  |     if (await filterOption.isVisible()) {
  79  |       await filterOption.click();
  80  |     }
  81  |     
  82  |     // Results should update
  83  |     await page.waitForTimeout(1000);
  84  |     const results = page.locator('[data-testid="product-card"]');
  85  |     expect(await results.count()).toBeGreaterThan(0);
  86  |   });
  87  | 
  88  |   test('should sort products', async ({ page }) => {
  89  |     await page.goto(`${WEB_BASE}/products`);
  90  |     
  91  |     // Find sort dropdown
  92  |     const sortDropdown = page.locator('select[name="sort"], [data-testid="sort-dropdown"], button:has-text("Sort")');
  93  |     if (await sortDropdown.isVisible()) {
  94  |       await sortDropdown.click();
  95  |       
  96  |       // Select price low-to-high
  97  |       await page.locator('option:has-text("Price: Low to High"), button:has-text("Price: Low to High")').first().click();
  98  |       
  99  |       // Results should reorder
  100 |       await page.waitForTimeout(1000);
  101 |       const prices = await page.locator('[data-testid="product-price"], .product-price').allTextContents();
  102 |       expect(prices.length).toBeGreaterThan(0);
  103 |     }
  104 |   });
  105 | 
  106 |   test('should view product details', async ({ page }) => {
  107 |     await page.goto(`${WEB_BASE}/products`);
  108 |     
  109 |     // Click first product
  110 |     await page.locator('[data-testid="product-card"], .product-item').first().click();
  111 |     
  112 |     // Should navigate to product detail page
```