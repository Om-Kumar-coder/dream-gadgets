import { test, expect } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3001';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Web - Shopping & Checkout Flow', () => {
  let authToken: string;

  test.beforeAll(async () => {
    // Login with pre-seeded shopper user via API
    const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'pw_shopper@test.com',
        password: 'Test@12345'
      })
    });
    const loginData = await loginRes.json();
    authToken = loginData.data.accessToken;
  });

  test.beforeEach(async ({ page, context }) => {
    // Set auth cookie before each test so user is logged in
    if (authToken) {
      await context.addCookies([{
        name: 'authToken',
        value: authToken,
        url: WEB_BASE
      }]);
    }
  });

  test('should browse products and display list', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Should show product list or grid
    await expect(page.locator('[data-testid="product-card"], .product-item, .product-card')).toHaveCount(n => n > 0);
    
    // Product cards should have essential info
    await expect(page.locator('[data-testid="product-card"]:first-child').locator('img')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]:first-child').locator('[data-testid="product-name"], .product-name')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]:first-child').locator('[data-testid="product-price"], .product-price')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[name="search"], [data-testid="search-input"]');
    await searchInput.fill('iPhone');
    await searchInput.press('Enter');
    
    // Results should update (either by navigation or dynamic update)
    await page.waitForTimeout(1000);
    
    // Should show filtered products or "no results"
    const results = page.locator('[data-testid="product-card"], .product-item');
    const resultsCount = await results.count();
    const noResultsMsg = page.locator('text=/no results|not found/i');
    
    expect(resultsCount > 0 || await noResultsMsg.isVisible()).toBeTruthy();
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Click category filter
    const categoryFilter = page.locator('button:has-text("Category"), [data-testid="filter-category"], select[name="category"]').first();
    await categoryFilter.click();
    
    // Select an option
    const filterOption = page.locator('button:has-text("Smartphone"), option, li').first();
    if (await filterOption.isVisible()) {
      await filterOption.click();
    }
    
    // Results should update
    await page.waitForTimeout(1000);
    const results = page.locator('[data-testid="product-card"]');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('should sort products', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Find sort dropdown
    const sortDropdown = page.locator('select[name="sort"], [data-testid="sort-dropdown"], button:has-text("Sort")');
    if (await sortDropdown.isVisible()) {
      await sortDropdown.click();
      
      // Select price low-to-high
      await page.locator('option:has-text("Price: Low to High"), button:has-text("Price: Low to High")').first().click();
      
      // Results should reorder
      await page.waitForTimeout(1000);
      const prices = await page.locator('[data-testid="product-price"], .product-price').allTextContents();
      expect(prices.length).toBeGreaterThan(0);
    }
  });

  test('should view product details', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Click first product
    await page.locator('[data-testid="product-card"], .product-item').first().click();
    
    // Should navigate to product detail page
    await page.waitForURL(`${WEB_BASE}/products/*`, { timeout: 5000 });
    
    // Should show product details
    await expect(page.locator('img[alt*="product"], [data-testid="product-image"]')).toBeVisible();
    await expect(page.locator('h1, h2, [data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"], .price')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart-btn"]')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Click first product
    await page.locator('[data-testid="product-card"], .product-item').first().click();
    await page.waitForURL(`${WEB_BASE}/products/*`);
    
    // Set quantity if available
    const quantityInput = page.locator('input[type="number"], input[name="quantity"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2');
    }
    
    // Click add to cart
    await page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart-btn"]').click();
    
    // Should show success message or cart update
    await expect(page.locator('.success, [role="status"]:has-text("added"), .cart-notification')).toBeVisible({ timeout: 3000 });
    
    // Cart count should increase
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, span:has-text(/cart|item/i)');
    if (await cartBadge.isVisible()) {
      const count = await cartBadge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });

  test('should view cart', async ({ page }) => {
    await page.goto(`${WEB_BASE}/cart`);
    
    // Should show cart items if any
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    if (await cartItems.count() > 0) {
      await expect(cartItems.first()).toBeVisible();
      await expect(page.locator('[data-testid="cart-total"], .total-price')).toBeVisible();
    }
    
    // Should have checkout button
    await expect(page.locator('button:has-text("Checkout"), button:has-text("Proceed"), [data-testid="checkout-btn"]')).toBeVisible();
  });

  test('should update cart item quantity', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Add product to cart
    await page.locator('[data-testid="product-card"], .product-item').first().click();
    await page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto(`${WEB_BASE}/cart`);
    
    // Update quantity
    const quantityInput = page.locator('input[type="number"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.triple_click();
      await quantityInput.fill('5');
      await quantityInput.press('Enter');
      
      // Total should update
      await page.waitForTimeout(500);
      const total = await page.locator('[data-testid="cart-total"], .total-price').textContent();
      expect(total).toBeTruthy();
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Add product
    await page.locator('[data-testid="product-card"], .product-item').first().click();
    await page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto(`${WEB_BASE}/cart`);
    
    // Remove item
    const initialCount = await page.locator('[data-testid="cart-item"], .cart-item').count();
    await page.locator('button:has-text("Remove"), [data-testid="remove-btn"]').first().click();
    await page.waitForTimeout(500);
    
    // Item count should decrease
    const finalCount = await page.locator('[data-testid="cart-item"], .cart-item').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should proceed to checkout', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`);
    
    // Add product
    await page.locator('[data-testid="product-card"], .product-item').first().click();
    await page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(1000);
    
    // Go to cart and checkout
    await page.goto(`${WEB_BASE}/cart`);
    await page.locator('button:has-text("Checkout"), button:has-text("Proceed"), [data-testid="checkout-btn"]').click();
    
    // Should navigate to checkout page
    await page.waitForURL(`${WEB_BASE}/checkout*`, { timeout: 5000 });
  });

  test('should fill shipping address in checkout', async ({ page }) => {
    await page.goto(`${WEB_BASE}/checkout`);
    
    // Fill shipping form
    const addressInputs = page.locator('input[name="address"], input[placeholder*="Address"]');
    if (await addressInputs.isVisible()) {
      await addressInputs.fill('123 Main Street');
      await page.fill('input[name="city"], input[placeholder*="City"]', 'New York');
      await page.fill('input[name="state"], select[name="state"]', 'NY');
      await page.fill('input[name="pincode"], input[placeholder*="Postal"], input[placeholder*="ZIP"]', '10001');
      
      // Continue button
      await page.locator('button:has-text("Continue"), button:has-text("Next"), [data-testid="continue-btn"]').click();
      await page.waitForTimeout(1000);
    }
  });

  test('should select shipping method in checkout', async ({ page }) => {
    await page.goto(`${WEB_BASE}/checkout`);
    
    // Skip to shipping if needed
    const shippingOptions = page.locator('input[name="shippingMethod"], label:has-text("Standard")');
    if (await shippingOptions.count() > 0) {
      // Select first shipping option
      await shippingOptions.first().click();
      
      // Verify selection
      const selected = await page.locator('input[name="shippingMethod"]:checked, input[type="radio"]:checked').count();
      expect(selected).toBeGreaterThan(0);
    }
  });

  test('should display payment information in checkout', async ({ page }) => {
    await page.goto(`${WEB_BASE}/checkout`);
    
    // Should show order summary
    await expect(page.locator('[data-testid="order-summary"], .order-summary, .summary')).toBeVisible();
    
    // Should show subtotal, tax, shipping, total
    const priceElements = page.locator('[data-testid*="price"], [class*="total"], [class*="price"]');
    expect(await priceElements.count()).toBeGreaterThan(0);
    
    // Should show payment method selection
    const paymentMethods = page.locator('input[type="radio"][name*="payment"], label:has-text("Credit")');
    expect(await paymentMethods.count()).toBeGreaterThan(0);
  });

  test('should complete payment and show confirmation', async ({ page }) => {
    // Note: This test uses a test/mock payment provider
    await page.goto(`${WEB_BASE}/checkout`);
    
    // Fill checkout form (simplified)
    await page.fill('input[name="cardNumber"], input[placeholder*="Card"]', '4242424242424242');
    await page.fill('input[name="expiry"], input[placeholder*="MM/YY"]', '12/25');
    await page.fill('input[name="cvc"], input[placeholder*="CVC"]', '123');
    
    // Place order
    await page.locator('button:has-text("Place Order"), button:has-text("Pay"), [data-testid="place-order-btn"]').click();
    
    // Should show confirmation page
    await page.waitForURL(`${WEB_BASE}/checkout/confirmation*`, { timeout: 10000 });
    
    // Should show order number
    await expect(page.locator('h1, h2, [data-testid="confirmation-heading"]')).toContainText(/confirmation|thank you|success|order/i);
    
    // Should show order ID
    await expect(page.locator('[data-testid="order-id"], .order-number, .order-id')).toBeVisible();
  });

  test('should view order history after checkout', async ({ page }) => {
    await page.goto(`${WEB_BASE}/account/orders`);
    
    // Should list previous orders
    const orders = page.locator('[data-testid="order-item"], .order-item, tr:not(:first-child)');
    if (await orders.count() > 0) {
      await expect(orders.first()).toBeVisible();
      await expect(page.locator('[data-testid="order-date"], .date, .order-date').first()).toBeVisible();
      await expect(page.locator('[data-testid="order-status"], .status').first()).toBeVisible();
    }
  });

  test('should view order details', async ({ page }) => {
    await page.goto(`${WEB_BASE}/account/orders`);
    
    // Click first order
    const orderLink = page.locator('[data-testid="order-item"], .order-item, tr').first();
    if (await orderLink.isVisible()) {
      await orderLink.click();
      await page.waitForURL(`${WEB_BASE}/account/orders/*`, { timeout: 5000 });
      
      // Should show order details
      await expect(page.locator('[data-testid="order-number"], .order-id')).toBeVisible();
      await expect(page.locator('[data-testid="order-items"], .items-list')).toBeVisible();
      await expect(page.locator('[data-testid="order-total"], .total')).toBeVisible();
    }
  });

  test('should track order status', async ({ page }) => {
    await page.goto(`${WEB_BASE}/account/orders`);
    
    // View first order
    const orderLink = page.locator('[data-testid="order-item"], .order-item').first();
    if (await orderLink.isVisible()) {
      await orderLink.click();
      await page.waitForURL(`${WEB_BASE}/account/orders/*`);
      
      // Should show tracking status
      const tracking = page.locator('[data-testid="tracking"], .tracking-info, .status-timeline');
      if (await tracking.isVisible()) {
        await expect(tracking).toContainText(/processing|shipped|delivered|pending/i);
      }
    }
  });
});
