# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\auth.spec.ts >> Web - Authentication Flows >> should display login form with all fields
- Location: tests\e2e\web\auth.spec.ts:11:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="email"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[name="email"]')

```

```yaml
- banner:
  - text: 🚀 Free doorstep pickup across India · Instant payment within 24 hours
  - link "Dream Gadgets":
    - /url: /
    - img "Dream Gadgets"
  - navigation:
    - link "Sell Phone":
      - /url: /sell
    - link "Sell Gadgets":
      - /url: /sell?type=gadget
    - link "Buy Phone":
      - /url: /products
    - link "Recycle Device":
      - /url: /sell?type=recycle
    - link "Our Stores":
      - /url: /stores
    - link "My Orders":
      - /url: /orders
    - link "More":
      - /url: /about
  - link:
    - /url: /cart
    - img
  - link "Login":
    - /url: /login
  - link "Sell Now":
    - /url: /sell
- img
- heading "Welcome Back" [level=1]
- paragraph: Sign in to your Dream Gadgets account
- text: Email or Phone Number
- textbox "Enter your email or phone"
- text: Password
- textbox "Enter your password"
- button "Sign In"
- paragraph:
  - text: Don't have an account?
  - link "Create Account":
    - /url: /register
- link "Back to Home":
  - /url: /
- contentinfo:
  - img "Dream Gadgets"
  - paragraph: India's most transparent mobile selling platform. Certified used phones, doorstep pickup, instant payment.
  - paragraph: Mumbai, Maharashtra
  - paragraph:
    - link "support@dreamgadgets.in":
      - /url: mailto:support@dreamgadgets.in
  - heading "Services" [level=4]
  - list:
    - listitem:
      - link "Sell Phone":
        - /url: /sell
    - listitem:
      - link "Sell Tablet":
        - /url: /sell?type=tablet
    - listitem:
      - link "Sell Laptop":
        - /url: /sell?type=laptop
    - listitem:
      - link "Sell Smartwatch":
        - /url: /sell?type=smartwatch
    - listitem:
      - link "Sell Gaming Console":
        - /url: /sell?type=gaming
  - heading "About" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: /about
    - listitem:
      - link "Blogs":
        - /url: /blog
    - listitem:
      - link "Our Stores":
        - /url: /stores
    - listitem:
      - link "Become Partner":
        - /url: /partner
  - heading "Help Center" [level=4]
  - list:
    - listitem:
      - link "FAQ":
        - /url: /faq
    - listitem:
      - link "Contact Us":
        - /url: /contact
    - listitem:
      - link "My Orders":
        - /url: /account
    - listitem:
      - link "Return & Refund":
        - /url: /returns
  - heading "Law and Orders" [level=4]
  - list:
    - listitem:
      - link "Terms of Use":
        - /url: /terms
    - listitem:
      - link "Terms & Conditions":
        - /url: /terms
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Cookies Policy":
        - /url: /cookies
  - paragraph: Quick Links
  - link "Sell Old Apple Mobile":
    - /url: /sell?brand=Apple
  - link "Sell Old Samsung Mobile":
    - /url: /sell?brand=Samsung
  - link "Sell Old OnePlus Mobile":
    - /url: /sell?brand=OnePlus
  - link "Sell Old Oppo Mobile":
    - /url: /sell?brand=Oppo
  - link "Sell Old Vivo Mobile":
    - /url: /sell?brand=Vivo
  - link "Sell Old Xiaomi Mobile":
    - /url: /sell?brand=Xiaomi
  - link "Sell Old Motorola Mobile":
    - /url: /sell?brand=Motorola
  - link "Sell Old Google Mobile":
    - /url: /sell?brand=Google
  - link "Sell Old Nokia Mobile":
    - /url: /sell?brand=Nokia
  - paragraph: © 2026 Dream Gadgets. All Rights Reserved.
  - text: All systems operational Do you have questions?
  - link "Get Answers →":
    - /url: /faq
  - paragraph: All trademarks, logos, and brand names are the property of their respective owners. Brand names used here are for identification purposes only and do not imply ownership or endorsement.
- link "Chat on WhatsApp":
  - /url: https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20buying%20a%20phone%20from%20Dream%20Gadgets.
  - img
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3001';
  4   | const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
  5   | 
  6   | test.describe('Web - Authentication Flows', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto(`${WEB_BASE}/login`);
  9   |   });
  10  | 
  11  |   test('should display login form with all fields', async ({ page }) => {
> 12  |     await expect(page.locator('input[name="email"]')).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  13  |     await expect(page.locator('input[name="password"]')).toBeVisible();
  14  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  15  |     await expect(page.locator('a[href="/register"]')).toBeVisible();
  16  |   });
  17  | 
  18  |   test('should show validation error for invalid email', async ({ page }) => {
  19  |     await page.fill('input[name="email"]', 'invalid-email');
  20  |     await page.fill('input[name="password"]', 'Test@12345');
  21  |     await page.click('button[type="submit"]');
  22  |     
  23  |     await expect(page.locator('.error-message, [role="alert"]')).toContainText(/invalid|email/i);
  24  |   });
  25  | 
  26  |   test('should show validation error for short password', async ({ page }) => {
  27  |     await page.fill('input[name="email"]', 'test@example.com');
  28  |     await page.fill('input[name="password"]', '123');
  29  |     await page.click('button[type="submit"]');
  30  |     
  31  |     await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  32  |   });
  33  | 
  34  |   test('should login successfully with valid credentials', async ({ page, context }) => {
  35  |     // Create test user via API
  36  |     const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
  37  |       method: 'POST',
  38  |       headers: { 'Content-Type': 'application/json' },
  39  |       body: JSON.stringify({
  40  |         email: `user_${Date.now()}@test.com`,
  41  |         password: 'Test@12345',
  42  |         phone: '9999999999',
  43  |         firstName: 'Test',
  44  |         lastName: 'User'
  45  |       })
  46  |     });
  47  |     const user = await registerRes.json();
  48  |     
  49  |     // Login via UI
  50  |     await page.fill('input[name="email"]', user.data.email);
  51  |     await page.fill('input[name="password"]', 'Test@12345');
  52  |     await page.click('button[type="submit"]');
  53  |     
  54  |     // Should redirect to dashboard/home
  55  |     await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
  56  |     await expect(page).not.toHaveURL(`${WEB_BASE}/login`);
  57  |     
  58  |     // Auth token should be stored in localStorage/cookies
  59  |     const cookies = await context.cookies();
  60  |     const hasAuthCookie = cookies.some(c => c.name.toLowerCase().includes('auth') || c.name.toLowerCase().includes('token'));
  61  |     expect(hasAuthCookie || localStorage).toBeTruthy();
  62  |   });
  63  | 
  64  |   test('should show error for wrong password', async ({ page }) => {
  65  |     await page.fill('input[name="email"]', 'admin@test.com');
  66  |     await page.fill('input[name="password"]', 'WrongPassword123');
  67  |     await page.click('button[type="submit"]');
  68  |     
  69  |     await expect(page.locator('.error-message, [role="alert"]')).toContainText(/invalid|incorrect|wrong/i);
  70  |   });
  71  | 
  72  |   test('should show error for non-existent email', async ({ page }) => {
  73  |     await page.fill('input[name="email"]', 'nonexistent_' + Date.now() + '@test.com');
  74  |     await page.fill('input[name="password"]', 'Test@12345');
  75  |     await page.click('button[type="submit"]');
  76  |     
  77  |     await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  78  |   });
  79  | 
  80  |   test('should register new user successfully', async ({ page }) => {
  81  |     await page.click('a[href="/register"]');
  82  |     await page.waitForURL(`${WEB_BASE}/register`);
  83  |     
  84  |     const email = `newuser_${Date.now()}@test.com`;
  85  |     await page.fill('input[name="email"]', email);
  86  |     await page.fill('input[name="firstName"]', 'John');
  87  |     await page.fill('input[name="lastName"]', 'Doe');
  88  |     await page.fill('input[name="phone"]', '9999999999');
  89  |     await page.fill('input[name="password"]', 'Test@12345');
  90  |     await page.fill('input[name="confirmPassword"]', 'Test@12345');
  91  |     
  92  |     await page.click('button[type="submit"]');
  93  |     
  94  |     // Should redirect to login or dashboard
  95  |     await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
  96  |     await expect(page).toHaveURL(/\/login|\/dashboard|\/account/i);
  97  |   });
  98  | 
  99  |   test('should logout successfully', async ({ page, context }) => {
  100 |     // Login first
  101 |     const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
  102 |       method: 'POST',
  103 |       headers: { 'Content-Type': 'application/json' },
  104 |       body: JSON.stringify({
  105 |         email: `user_${Date.now()}@test.com`,
  106 |         password: 'Test@12345',
  107 |         phone: '9999999999',
  108 |         firstName: 'Test',
  109 |         lastName: 'User'
  110 |       })
  111 |     });
  112 |     const user = await registerRes.json();
```