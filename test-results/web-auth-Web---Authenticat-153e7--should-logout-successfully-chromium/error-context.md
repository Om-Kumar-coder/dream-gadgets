# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\auth.spec.ts >> Web - Authentication Flows >> should logout successfully
- Location: tests\e2e\web\auth.spec.ts:99:7

# Error details

```
TypeError: fetch failed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]: 🚀 Free doorstep pickup across India · Instant payment within 24 hours
    - generic [ref=e4]:
      - link "Dream Gadgets" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Dream Gadgets" [ref=e6]
      - navigation [ref=e7]:
        - link "Sell Phone" [ref=e8] [cursor=pointer]:
          - /url: /sell
        - link "Sell Gadgets" [ref=e9] [cursor=pointer]:
          - /url: /sell?type=gadget
        - link "Buy Phone" [ref=e10] [cursor=pointer]:
          - /url: /products
        - link "Recycle Device" [ref=e11] [cursor=pointer]:
          - /url: /sell?type=recycle
        - link "Our Stores" [ref=e12] [cursor=pointer]:
          - /url: /stores
        - link "My Orders" [ref=e13] [cursor=pointer]:
          - /url: /orders
        - link "More" [ref=e14] [cursor=pointer]:
          - /url: /about
      - generic [ref=e15]:
        - link [ref=e16] [cursor=pointer]:
          - /url: /cart
          - img [ref=e17]
        - link "Login" [ref=e19] [cursor=pointer]:
          - /url: /login
        - link "Sell Now" [ref=e20] [cursor=pointer]:
          - /url: /sell
  - generic [ref=e22]:
    - generic [ref=e23]:
      - img [ref=e25]
      - heading "Welcome Back" [level=1] [ref=e27]
      - paragraph [ref=e28]: Sign in to your Dream Gadgets account
    - generic [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]: Email or Phone Number
        - textbox "Enter your email or phone" [ref=e33]
      - generic [ref=e34]:
        - generic [ref=e35]: Password
        - textbox "Enter your password" [ref=e36]
      - button "Sign In" [ref=e37] [cursor=pointer]
    - generic [ref=e38]:
      - paragraph [ref=e39]:
        - text: Don't have an account?
        - link "Create Account" [ref=e40] [cursor=pointer]:
          - /url: /register
      - link "Back to Home" [ref=e41] [cursor=pointer]:
        - /url: /
  - contentinfo [ref=e42]:
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - img "Dream Gadgets" [ref=e47]
          - paragraph [ref=e48]: India's most transparent mobile selling platform. Certified used phones, doorstep pickup, instant payment.
          - paragraph [ref=e49]: Mumbai, Maharashtra
          - paragraph [ref=e50]:
            - link "support@dreamgadgets.in" [ref=e51] [cursor=pointer]:
              - /url: mailto:support@dreamgadgets.in
        - generic [ref=e52]:
          - heading "Services" [level=4] [ref=e53]
          - list [ref=e54]:
            - listitem [ref=e55]:
              - link "Sell Phone" [ref=e56] [cursor=pointer]:
                - /url: /sell
            - listitem [ref=e57]:
              - link "Sell Tablet" [ref=e58] [cursor=pointer]:
                - /url: /sell?type=tablet
            - listitem [ref=e59]:
              - link "Sell Laptop" [ref=e60] [cursor=pointer]:
                - /url: /sell?type=laptop
            - listitem [ref=e61]:
              - link "Sell Smartwatch" [ref=e62] [cursor=pointer]:
                - /url: /sell?type=smartwatch
            - listitem [ref=e63]:
              - link "Sell Gaming Console" [ref=e64] [cursor=pointer]:
                - /url: /sell?type=gaming
        - generic [ref=e65]:
          - heading "About" [level=4] [ref=e66]
          - list [ref=e67]:
            - listitem [ref=e68]:
              - link "About Us" [ref=e69] [cursor=pointer]:
                - /url: /about
            - listitem [ref=e70]:
              - link "Blogs" [ref=e71] [cursor=pointer]:
                - /url: /blog
            - listitem [ref=e72]:
              - link "Our Stores" [ref=e73] [cursor=pointer]:
                - /url: /stores
            - listitem [ref=e74]:
              - link "Become Partner" [ref=e75] [cursor=pointer]:
                - /url: /partner
        - generic [ref=e76]:
          - heading "Help Center" [level=4] [ref=e77]
          - list [ref=e78]:
            - listitem [ref=e79]:
              - link "FAQ" [ref=e80] [cursor=pointer]:
                - /url: /faq
            - listitem [ref=e81]:
              - link "Contact Us" [ref=e82] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e83]:
              - link "My Orders" [ref=e84] [cursor=pointer]:
                - /url: /account
            - listitem [ref=e85]:
              - link "Return & Refund" [ref=e86] [cursor=pointer]:
                - /url: /returns
        - generic [ref=e87]:
          - heading "Law and Orders" [level=4] [ref=e88]
          - list [ref=e89]:
            - listitem [ref=e90]:
              - link "Terms of Use" [ref=e91] [cursor=pointer]:
                - /url: /terms
            - listitem [ref=e92]:
              - link "Terms & Conditions" [ref=e93] [cursor=pointer]:
                - /url: /terms
            - listitem [ref=e94]:
              - link "Privacy Policy" [ref=e95] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e96]:
              - link "Cookies Policy" [ref=e97] [cursor=pointer]:
                - /url: /cookies
      - generic [ref=e98]:
        - paragraph [ref=e99]: Quick Links
        - generic [ref=e100]:
          - link "Sell Old Apple Mobile" [ref=e101] [cursor=pointer]:
            - /url: /sell?brand=Apple
          - link "Sell Old Samsung Mobile" [ref=e102] [cursor=pointer]:
            - /url: /sell?brand=Samsung
          - link "Sell Old OnePlus Mobile" [ref=e103] [cursor=pointer]:
            - /url: /sell?brand=OnePlus
          - link "Sell Old Oppo Mobile" [ref=e104] [cursor=pointer]:
            - /url: /sell?brand=Oppo
          - link "Sell Old Vivo Mobile" [ref=e105] [cursor=pointer]:
            - /url: /sell?brand=Vivo
          - link "Sell Old Xiaomi Mobile" [ref=e106] [cursor=pointer]:
            - /url: /sell?brand=Xiaomi
          - link "Sell Old Motorola Mobile" [ref=e107] [cursor=pointer]:
            - /url: /sell?brand=Motorola
          - link "Sell Old Google Mobile" [ref=e108] [cursor=pointer]:
            - /url: /sell?brand=Google
          - link "Sell Old Nokia Mobile" [ref=e109] [cursor=pointer]:
            - /url: /sell?brand=Nokia
      - generic [ref=e110]:
        - paragraph [ref=e111]: © 2026 Dream Gadgets. All Rights Reserved.
        - generic [ref=e112]:
          - generic [ref=e113]: All systems operational
          - generic [ref=e115]: Do you have questions?
          - link "Get Answers →" [ref=e116] [cursor=pointer]:
            - /url: /faq
      - paragraph [ref=e117]: All trademarks, logos, and brand names are the property of their respective owners. Brand names used here are for identification purposes only and do not imply ownership or endorsement.
  - link "Chat on WhatsApp" [ref=e118] [cursor=pointer]:
    - /url: https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20buying%20a%20phone%20from%20Dream%20Gadgets.
    - img [ref=e119]
  - alert [ref=e121]
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
  12  |     await expect(page.locator('input[name="email"]')).toBeVisible();
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
> 101 |     const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      |                         ^ TypeError: fetch failed
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
  113 |     
  114 |     await page.fill('input[name="email"]', user.data.email);
  115 |     await page.fill('input[name="password"]', 'Test@12345');
  116 |     await page.click('button[type="submit"]');
  117 |     await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
  118 |     
  119 |     // Logout
  120 |     await page.click('button[aria-label="User menu"], a[href="/account"], [data-testid="user-menu"]');
  121 |     await page.click('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
  122 |     
  123 |     // Should redirect to login
  124 |     await page.waitForURL(`${WEB_BASE}/login`);
  125 |     await expect(page).toHaveURL(`${WEB_BASE}/login`);
  126 |   });
  127 | 
  128 |   test('should persist session across page reload', async ({ page, context }) => {
  129 |     // Login
  130 |     const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
  131 |       method: 'POST',
  132 |       headers: { 'Content-Type': 'application/json' },
  133 |       body: JSON.stringify({
  134 |         email: `user_${Date.now()}@test.com`,
  135 |         password: 'Test@12345',
  136 |         phone: '9999999999',
  137 |         firstName: 'Test',
  138 |         lastName: 'User'
  139 |       })
  140 |     });
  141 |     const user = await registerRes.json();
  142 |     
  143 |     await page.fill('input[name="email"]', user.data.email);
  144 |     await page.fill('input[name="password"]', 'Test@12345');
  145 |     await page.click('button[type="submit"]');
  146 |     await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
  147 |     
  148 |     // Reload page
  149 |     await page.reload();
  150 |     
  151 |     // Should still be logged in (not redirected to login)
  152 |     await expect(page).not.toHaveURL(`${WEB_BASE}/login`);
  153 |   });
  154 | 
  155 |   test('should handle password reset flow', async ({ page }) => {
  156 |     await page.click('a:has-text("Forgot Password"), button:has-text("Forgot Password")');
  157 |     await page.waitForURL(`${WEB_BASE}/forgot-password`, { timeout: 5000 });
  158 |     
  159 |     await page.fill('input[name="email"]', 'test@example.com');
  160 |     await page.click('button[type="submit"]');
  161 |     
  162 |     // Should show success message
  163 |     await expect(page.locator('.success-message, [role="status"]')).toContainText(/reset|sent|email/i);
  164 |   });
  165 | });
  166 | 
```