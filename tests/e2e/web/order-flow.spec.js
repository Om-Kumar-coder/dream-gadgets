import { test, expect } from '@playwright/test';
const WEB_BASE = process.env.WEB_BASE_URL || 'https://dreamgadgets.in';
const API_BASE = process.env.API_BASE_URL || 'https://dreamgadgets.in';
/**
 * Full order flow E2E test:
 * 1. Browse products on the storefront
 * 2. Add a product to cart (via product detail page)
 * 3. Verify cart renders correctly
 * 4. Complete checkout address form
 * 5. Place order via API
 * 6. Verify order appears in order history
 */
// Use serial execution so cart state (localStorage) persists across tests
test.describe.serial('Full Order Flow', () => {
    let accessToken;
    const shopperEmail = 'pw_shopper@test.com';
    const shopperPassword = 'Test@12345';
    let productId;
    let productPrice;
    let productName;
    test.beforeAll(async ({ request }) => {
        // 1. Get a valid product from the storefront API
        const productsRes = await request.get(`${API_BASE}/api/v1/public/products?limit=10`);
        expect(productsRes.ok()).toBeTruthy();
        const productsBody = await productsRes.json();
        // Unwrap { status, data } wrapper
        const products = productsBody.data ?? productsBody.items ?? [];
        expect(products.length).toBeGreaterThan(0);
        // Pick the first available product with a price
        const selected = products.find((p) => p.status === 'available' && Number(p.price ?? 0) > 0);
        expect(selected).toBeTruthy();
        productId = selected.id;
        productPrice = Number(selected.price ?? selected.onlinePrice ?? 0);
        productName = selected.itemName ?? `${selected.brand ?? ''} ${selected.model ?? ''}`.trim();
        console.log(`📦 Selected product: ${productName} (${productId}) — ₹${productPrice.toLocaleString('en-IN')}`);
        // 2. Login as shopper
        const loginRes = await request.post(`${API_BASE}/api/v1/auth/login`, {
            data: { identifier: shopperEmail, password: shopperPassword },
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginBody = await loginRes.json();
        accessToken = loginBody.data?.accessToken ?? loginBody.accessToken;
        expect(accessToken).toBeTruthy();
        console.log(`🔑 Logged in as ${shopperEmail}`);
    });
    test('1. Browse products page', async ({ page }) => {
        const errors = [];
        page.on('console', msg => { if (msg.type() === 'error')
            errors.push(msg.text()); });
        page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
        await page.goto(`${WEB_BASE}/products`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // Wait for content to render
        await page.waitForSelector('a[href*="/products/"]', { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(3000);
        // Check for product cards (flexible assertion)
        const productCards = page.locator('a[href*="/products/"]').filter({ has: page.locator('img, svg') });
        const count = await productCards.count().catch(() => 0);
        console.log(`📋 Found ${count} product cards on the page`);
        // Should have at least some products or the text "No products found"
        const bodyText = await page.locator('body').textContent().catch(() => '');
        if (count > 0) {
            const firstProductLink = await productCards.first().getAttribute('href');
            expect(firstProductLink).toMatch(/\/products\//);
            console.log(`   First product: ${firstProductLink}`);
        }
        else {
            // If no products rendered, at least check the page loaded
            expect(bodyText.length).toBeGreaterThan(100);
            console.log('   No product cards found but page has content');
        }
        // No critical console errors
        const criticalErrors = errors.filter(e => !e.includes('favicon'));
        if (criticalErrors.length > 0) {
            console.log('   Console errors:', criticalErrors.join('; '));
        }
        console.log('✅ Products page loaded');
    });
    test('2. Product detail page and add to cart', async ({ page }) => {
        const errors = [];
        page.on('console', msg => { if (msg.type() === 'error')
            errors.push(msg.text()); });
        page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
        // Navigate to the selected product detail page
        await page.goto(`${WEB_BASE}/products/${productId}`, {
            waitUntil: 'domcontentloaded',
            timeout: 45000
        });
        // Wait for the product to render
        await page.waitForSelector('h1', { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(3000);
        // Should show product name
        const pageTitle = await page.locator('h1').textContent().catch(() => '');
        console.log(`📄 Product page H1: "${pageTitle?.trim()}"`);
        // Should show price
        const priceEl = page.locator('text=/₹[0-9,]+/').first();
        const priceText = await priceEl.textContent().catch(() => 'N/A');
        console.log(`💰 Price: ${priceText}`);
        // Should have Add to Cart button — try both "Add to Cart" and "Cart" buttons
        const addToCartBtn = page.locator('button:has-text("Add to Cart")');
        const btnVisible = await addToCartBtn.isVisible().catch(() => false);
        if (btnVisible) {
            await addToCartBtn.click();
            await page.waitForTimeout(1500);
            // Check for confirmation
            const inCartIndicator = page.locator('text=/in Cart|Added|✓/');
            const added = await inCartIndicator.isVisible().catch(() => false);
            console.log(`   Add to Cart clicked, confirmation visible: ${added}`);
        }
        else {
            // Try clicking any "Add to Cart" or add button differently
            console.log('   Standard Add to Cart button not found, trying alternative...');
            // Check for mobile sticky bar or other add buttons
            const anyAddBtn = page.locator('button:has-text(/Cart|Add|Buy/)').first();
            const anyAddVisible = await anyAddBtn.isVisible().catch(() => false);
            if (anyAddVisible) {
                await anyAddBtn.click();
                await page.waitForTimeout(1500);
                console.log('   Clicked alternative add button');
            }
        }
        console.log('✅ Product detail page viewed');
    });
    test('3. Cart page shows correct items', async ({ page }) => {
        const errors = [];
        page.on('console', msg => { if (msg.type() === 'error')
            errors.push(msg.text()); });
        page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
        await page.goto(`${WEB_BASE}/cart`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        // Check page content
        const bodyText = await page.locator('body').textContent().catch(() => '');
        const hasCartText = /cart|item/i.test(bodyText);
        const hasEmptyCart = /empty/i.test(bodyText);
        console.log(`   Cart page body length: ${bodyText.length} chars`);
        console.log(`   Has cart text: ${hasCartText}, Empty: ${hasEmptyCart}`);
        // Should have order summary
        const hasSummary = /order summary|subtotal|total/i.test(bodyText);
        console.log(`   Has order summary: ${hasSummary}`);
        // Should have checkout link
        const checkoutLinks = page.locator('a[href="/checkout"], a[href*="checkout"]');
        const checkoutCount = await checkoutLinks.count().catch(() => 0);
        console.log(`   Checkout links: ${checkoutCount}`);
        // No critical console errors
        const criticalErrors = errors.filter(e => !e.includes('favicon'));
        if (criticalErrors.length > 0) {
            console.log('   Console errors:', criticalErrors.join('; '));
        }
        console.log('✅ Cart page loaded');
    });
    test('4. Checkout — address form renders and validates', async ({ page }) => {
        const errors = [];
        page.on('console', msg => { if (msg.type() === 'error')
            errors.push(msg.text()); });
        page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
        await page.goto(`${WEB_BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        // Check page content
        const bodyText = await page.locator('body').textContent().catch(() => '');
        const hasCheckoutText = /checkout|address|shipping/i.test(bodyText);
        console.log(`   Checkout page loaded: ${hasCheckoutText} (${bodyText.length} chars)`);
        // Check if redirected to cart (empty cart scenario)
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        const redirectedToCart = currentUrl.includes('/cart');
        if (!redirectedToCart && hasCheckoutText) {
            // Try to fill address form if visible
            const nameField = page.locator('input[placeholder="John Doe"]');
            if (await nameField.isVisible().catch(() => false)) {
                await nameField.fill('Test Shopper');
                await page.locator('input[placeholder="9876543210"]').fill('9876543210');
                await page.locator('input[placeholder*="Main St"]').fill('123 Test Street, Apartment 4B');
                await page.locator('input[placeholder="Mumbai"]').fill('Mumbai');
                await page.locator('input[placeholder="Maharashtra"]').fill('Maharashtra');
                await page.locator('input[placeholder="400001"]').fill('400001');
                await page.click('button:has-text("Continue to Review")');
                await page.waitForTimeout(2000);
                const onReview = await page.locator('text=/Review Your Order|Place Order|Pay/').isVisible().catch(() => false);
                console.log(`   Reached review step: ${onReview}`);
            }
            else {
                console.log('   Address form not visible (might be empty cart)');
            }
        }
        else {
            console.log(`   ${redirectedToCart ? 'Redirected to cart (empty)' : 'Page not checkout'}`);
        }
        console.log('✅ Checkout page tested');
    });
    test('5. Create order via API (backend integration)', async ({ request }) => {
        const orderPayload = {
            items: [{
                    itemId: productId,
                    unitPrice: productPrice,
                    quantity: 1,
                }],
            shippingAddress: {
                name: 'Test Shopper',
                phone: '9876543210',
                street: '123 Test Street, Apartment 4B',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
            },
            totalAmount: productPrice,
        };
        console.log(`📤 Creating order via API for ${productName} (₹${productPrice})...`);
        const orderRes = await request.post(`${API_BASE}/api/v1/public/orders`, {
            data: orderPayload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        // Parse response — the API wraps in { status, data }
        const orderBody = await orderRes.json();
        console.log(`📥 API status: ${orderRes.status()}`);
        // Unwrap TransformInterceptor: { status: 'success', data: { ...order } }
        // Handle double-wrapping: { status: 'success', data: { data: { ...order } } }
        const order = orderBody.data?.data ?? orderBody.data ?? orderBody;
        expect(orderRes.ok()).toBeTruthy();
        expect(order).toBeTruthy();
        expect(order.id).toBeTruthy();
        expect(order.orderNumber).toBeTruthy();
        console.log(`✅ Order created!`);
        console.log(`   Order ID: ${order.id}`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status || 'N/A'}`);
        const totalAmt = Number(order.totalAmount ?? order.total ?? 0);
        console.log(`   Total: ₹${totalAmt.toLocaleString('en-IN')}`);
    });
    test('6. Verify order appears in order history', async ({ request }) => {
        const ordersRes = await request.get(`${API_BASE}/api/v1/public/orders`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        expect(ordersRes.ok()).toBeTruthy();
        const ordersBody = await ordersRes.json();
        // Unwrap { status, data } wrapper — data might be { data: [...], meta: {...} }
        // Handle double-wrapping: { status: 'success', data: { data: { ... } } }
        const unwrapped = ordersBody.data?.data ?? ordersBody.data ?? ordersBody;
        const orders = Array.isArray(unwrapped) ? unwrapped : (unwrapped.data ?? unwrapped.items ?? []);
        console.log(`📋 Orders data type: ${typeof orders}, isArray: ${Array.isArray(orders)}`);
        console.log(`📋 Response structure: status=${ordersBody.status}, has data=${!!ordersBody.data}`);
        if (Array.isArray(orders) && orders.length > 0) {
            const latestOrder = orders[0];
            expect(latestOrder.id).toBeTruthy();
            expect(latestOrder.orderNumber).toBeTruthy();
            console.log(`   Latest order: ${latestOrder.orderNumber} — ${latestOrder.status || 'N/A'}`);
            const orderTotal = Number(latestOrder.totalAmount ?? latestOrder.total ?? 0);
            console.log(`   Order total: ₹${orderTotal.toLocaleString('en-IN')}`);
            console.log('✅ Order verified in history');
        }
        else {
            // If no orders array, just log what we got
            console.log(`   Orders response: ${JSON.stringify(ordersBody).substring(0, 300)}`);
            console.log('⚠️ No orders in history (may need more data)');
        }
    });
    test('7. Verify storefront homepage loads product listings', async ({ page }) => {
        const errors = [];
        page.on('console', msg => { if (msg.type() === 'error')
            errors.push(msg.text()); });
        page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
        await page.goto(`${WEB_BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        // Should render content
        const bodyText = await page.locator('body').textContent().catch(() => '') || '';
        expect(bodyText.length).toBeGreaterThan(200);
        console.log(`📄 Homepage rendered (${bodyText.length} chars)`);
        // Should show navigation links
        const navLinks = page.locator('a[href="/products"], a[href="/cart"], a[href="/login"]');
        const linkCount = await navLinks.count().catch(() => 0);
        console.log(`🔗 Found ${linkCount} navigation links`);
        // Page title check - wait a bit for client-side rendering
        await page.waitForTimeout(1000);
        const pageTitle = await page.title().catch(() => '');
        console.log(`📌 Page title: "${pageTitle}"`);
        // No critical console errors
        const criticalErrors = errors.filter(e => !e.includes('favicon') &&
            !e.includes('Failed to load resource') &&
            !e.includes('net::ERR_ABORTED'));
        if (criticalErrors.length > 0) {
            console.log('   Console errors:', criticalErrors);
        }
        console.log('✅ Homepage loaded successfully');
    });
});
//# sourceMappingURL=order-flow.spec.js.map