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

    // Error is shown as a red-bg alert div with text in p.text-red-700
    await expect(page.locator('.text-red-700')).toContainText(/invalid|email/i);
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'test@example.com');
    await page.fill('input[placeholder="Enter your password"]', '123');
    await page.click('button:has-text("Sign In")');

    // Error container has bg-red-50 class
    await expect(page.locator('[class*="bg-red-50"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page, context }) => {
    // Use pre-seeded test user (pw_auth1@test.com / Test@12345)
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    // Should redirect to /account (not stay on /login)
    await page.waitForURL(`${WEB_BASE}/account`, { timeout: 10000 }).catch(() => {});
    const currentUrl = page.url();
    expect(currentUrl.includes('/login')).toBeFalsy();

    // Auth token stored in localStorage by zustand persist (key: auth-storage)
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(authStorage).toBeTruthy();
    const parsed = JSON.parse(authStorage || '{}');
    expect(parsed?.state?.accessToken).toBeTruthy();
  });

  test('should show error for wrong password', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'WrongPassword123');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('.text-red-700')).toContainText(/invalid|incorrect|wrong/i);
  });

  test('should show error for non-existent email', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email or phone"]', 'nonexistent_' + Date.now() + '@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('[class*="bg-red-50"]')).toBeVisible();
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
    const accessToken = loginData.data?.accessToken;

    // Set auth in localStorage (same format as zustand persist writes)
    await page.goto(`${WEB_BASE}/login`);
    await page.evaluate((token) => {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          accessToken: token,
          refreshToken: token,
          user: payload
        }
      }));
    }, accessToken);

    // Navigate to account page — store should rehydrate from localStorage on reload
    await page.reload();
    await page.goto(`${WEB_BASE}/account`);

    // Find and click logout button (located on /account page)
    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    // After logout should redirect to login or show unauthenticated state
    await page.waitForTimeout(2000);
    const afterLogout = page.url();
    expect(afterLogout.includes('/login')).toBeTruthy();
  });

  test('should persist session across page reload', async ({ page }) => {
    // Login via UI
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to /account
    await page.waitForURL(`${WEB_BASE}/account`, { timeout: 10000 }).catch(() => {});
    expect(page.url().includes('/login')).toBeFalsy();

    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be logged in (not redirected to login)
    expect(page.url().includes('/login')).toBeFalsy();
  });

  test.skip('Forgot password page does not exist in current UI (returns 404)', async () => {});
});
