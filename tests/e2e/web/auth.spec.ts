import { test, expect } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3001';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Web - Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${WEB_BASE}/login`);
  });

  test('should display login form with all fields', async ({ page }) => {
    await expect(page.locator('input[placeholder="Enter your email or phone"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'invalid-email');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('.error-message, [role="alert"]')).toContainText(/invalid|email/i);
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'test@example.com');
    await page.fill('input[placeholder="Enter your password"]', '123');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page, context }) => {
    // Use pre-seeded test user (pw_auth1@test.com / Test@12345)
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    // Should redirect away from login page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl.includes('/login')).toBeFalsy();

    // Auth token should be stored in cookies
    const cookies = await context.cookies();
    const hasAuthCookie = cookies.some(c => c.name.toLowerCase().includes('auth') || c.name.toLowerCase().includes('token'));
    expect(hasAuthCookie).toBeTruthy();
  });

  test('should show error for wrong password', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'WrongPassword123');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('.error-message, [role="alert"]')).toContainText(/invalid|incorrect|wrong/i);
  });

  test('should show error for non-existent email', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'nonexistent_' + Date.now() + '@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });

  test.skip('Registration now requires phone OTP verification flow - needs UI test update', async ({ page }) => {
    await page.goto(`${WEB_BASE}/register`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // Login via API using pre-seeded user
    const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'pw_auth2@test.com',
        password: 'Test@12345'
      })
    });
    const loginData = await loginRes.json();

    // Set auth token as cookie and navigate
    if (loginData.data?.accessToken) {
      await context.addCookies([{
        name: 'authToken',
        value: loginData.data.accessToken,
        url: WEB_BASE
      }]);
    }

    await page.goto(`${WEB_BASE}/`);

    // Find and click logout button/link
    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();
    await page.waitForURL(`${WEB_BASE}/login`, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should persist session across page reload', async ({ page }) => {
    // Login via UI
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    expect(page.url().includes('/login')).toBeFalsy();

    // Reload page
    await page.reload();
    await page.waitForTimeout(3000);

    // Should still be logged in (not redirected to login)
    expect(page.url().includes('/login')).toBeFalsy();
  });

  test.skip('Forgot password page does not exist in current UI (returns 404)', async () => {});
});
