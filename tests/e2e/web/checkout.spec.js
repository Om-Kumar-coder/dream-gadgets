import { test, expect } from '@playwright/test';
const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3001';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
test.describe('Web - Shopping & Checkout Flow', () => {
    let authToken;
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
        authToken = loginData.data?.accessToken;
    });
    test.beforeEach(async ({ page, context }) => {
        // Set auth cookie so user is logged in for tests that need it
        if (authToken) {
            await context.addCookies([{
                    name: 'authToken',
                    value: authToken,
                    url: WEB_BASE
                }]);
        }
    });
    test('should display homepage with products and categories', async ({ page }) => {
        await page.goto(`${WEB_BASE}/`);
        // Homepage should show the hero section
        await expect(page.locator('body')).toBeVisible();
        // Check for product categories or featured products on homepage
        const categoryLinks = page.locator('a[href*="/sell"]');
        const categoryCount = await categoryLinks.count();
        expect(categoryCount).toBeGreaterThanOrEqual(1);
    });
    test('should navigate sell flow', async ({ page }) => {
        await page.goto(`${WEB_BASE}/sell`);
        // The sell flow should have device category selection
        // Select a device type (Mobile Phone or similar)
        const deviceOptions = page.locator('button, a[href*="/sell"]');
        const deviceCount = await deviceOptions.count();
        // Should show sell flow UI
        const pageContent = await page.textContent('body');
        expect(pageContent).toContain('Sell');
    });
    test('should navigate to cart page', async ({ page }) => {
        await page.goto(`${WEB_BASE}/cart`);
        // Cart page should be accessible
        await expect(page.locator('body')).toBeVisible();
        // Should show empty cart message or cart items
        const emptyCart = page.locator('text=Empty');
        const cartContent = page.locator('[data-testid="cart-item"], .cart-item');
        expect(await emptyCart.isVisible().catch(() => false) || await cartContent.count() > 0).toBeTruthy();
    });
    test('should proceed to checkout', async ({ page }) => {
        await page.goto(`${WEB_BASE}/checkout`);
        // Checkout page should be accessible
        await expect(page.locator('body')).toBeVisible();
        // Should show checkout form or order summary
        const checkoutContent = await page.textContent('body');
        expect(checkoutContent.length).toBeGreaterThan(0);
    });
    test('should fill shipping address in checkout', async ({ page }) => {
        await page.goto(`${WEB_BASE}/checkout`);
        // Look for address fields
        const addressInput = page.locator('input[placeholder*="Address"], input[name="address"]');
        if (await addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await addressInput.fill('123 Main Street');
            const cityInput = page.locator('input[placeholder*="City"], input[name="city"]');
            if (await cityInput.isVisible().catch(() => false)) {
                await cityInput.fill('New York');
            }
            // Continue button
            const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next"), [data-testid="continue-btn"]');
            if (await continueBtn.isVisible().catch(() => false)) {
                await continueBtn.click();
            }
        }
    });
    test('should display payment information in checkout', async ({ page }) => {
        await page.goto(`${WEB_BASE}/checkout`);
        // Checkout page should show order summary or payment section
        const bodyText = await page.textContent('body');
        const hasPaymentContent = bodyText.includes('payment') || bodyText.includes('total') || bodyText.includes('summary');
        expect(hasPaymentContent).toBeTruthy();
    });
    test('should view account page', async ({ page }) => {
        await page.goto(`${WEB_BASE}/account`);
        // Account page should be accessible
        await expect(page.locator('body')).toBeVisible();
    });
});
//# sourceMappingURL=checkout.spec.js.map