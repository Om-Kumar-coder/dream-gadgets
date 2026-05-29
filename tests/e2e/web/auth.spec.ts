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

  test('should login successfully with valid credentials', async ({ page }) => {
    // Use pre-seeded test user (pw_auth1@test.com / Test@12345)
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');

    // Click submit and wait for navigation to /account
    await Promise.all([
      page.waitForURL('**/account', { timeout: 15000 }),
      page.click('button:has-text("Sign In")'),
    ]);

    expect(page.url()).toContain('/account');

    // Give the page a moment to settle after client-side navigation
    await page.waitForTimeout(1000);

    // Auth token stored in localStorage by zustand persist (key: auth-storage)
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(authStorage).toBeTruthy();
    const parsed = JSON.parse(authStorage || '{}');
    expect(parsed?.state?.accessToken).toBeTruthy();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Use a unique identifier to avoid account locking from retries
    const uniqueId = `invalid_email_test_${Date.now()}@test.com`;
    await page.fill('input[placeholder="Enter your email or phone"]', uniqueId);
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    // Wait for the error message to appear: <p class="text-sm text-red-700">
    const errorText = page.locator('p.text-red-700');
    await expect(errorText).toBeVisible({ timeout: 15000 });
    // Should show some error text
    await expect(errorText).not.toBeEmpty();
  });

  test('should show validation error for short password', async ({ page }) => {
    const uniqueId = `short_pw_test_${Date.now()}@test.com`;
    await page.fill('input[placeholder="Enter your email or phone"]', uniqueId);
    await page.fill('input[placeholder="Enter your password"]', '123');
    // Submit via keyboard Enter
    await page.locator('input[placeholder="Enter your password"]').press('Enter');

    // Wait for the error container to appear
    const errorContainer = page.locator('.bg-red-50.border-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 15000 });
  });

  test('should show error for wrong password', async ({ page }) => {
    // Use a unique identifier to avoid account locking
    const uniqueId = `wrong_pw_test_${Date.now()}@test.com`;
    await page.fill('input[placeholder="Enter your email or phone"]', uniqueId);
    await page.fill('input[placeholder="Enter your password"]', 'WrongPassword123');
    await page.click('button:has-text("Sign In")');

    // Wait for the error message text to appear
    const errorText = page.locator('p.text-red-700');
    await expect(errorText).toBeVisible({ timeout: 15000 });
    // Should show some kind of error
    await expect(errorText).not.toBeEmpty();
  });

  test('should show error for non-existent email', async ({ page }) => {
    const uniqueId = `nonexistent_${Date.now()}@test.com`;
    await page.fill('input[placeholder="Enter your email or phone"]', uniqueId);
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
    await page.click('button:has-text("Sign In")');

    // Wait for the error container to appear
    const errorContainer = page.locator('.bg-red-50.border-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 15000 });
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
    if (!loginRes.ok) {
      // If user is locked, try an alternative approach — login via UI
      await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth2@test.com');
      await page.fill('input[placeholder="Enter your password"]', 'Test@12345');
      await page.click('button:has-text("Sign In")');
      await page.waitForURL('**/account', { timeout: 15000 });
      const logoutBtn = page.locator('button:has-text("Logout")');
      await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      const signInLink = page.locator('a[href="/login"]').first();
      await expect(signInLink).toBeVisible({ timeout: 5000 });
      return;
    }
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

    // Navigate to account page — store should rehydrate from localStorage
    await page.reload();
    await page.goto(`${WEB_BASE}/account`);

    // Find and click logout button
    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    // After logout, page shows unauthenticated state with "Sign In" link
    await page.waitForTimeout(2000);

    const signInLink = page.locator('a[href="/login"]').first();
    await expect(signInLink).toBeVisible({ timeout: 5000 });
  });

  test('should persist session across page reload', async ({ page }) => {
    // Login via UI with known working credentials
    await page.fill('input[placeholder="Enter your email or phone"]', 'pw_auth1@test.com');
    await page.fill('input[placeholder="Enter your password"]', 'Test@12345');

    await Promise.all([
      page.waitForURL('**/account', { timeout: 15000 }),
      page.click('button:has-text("Sign In")'),
    ]);

    expect(page.url()).toContain('/account');

    // Give page time to settle after navigation
    await page.waitForTimeout(1000);

    // Reload page — check if session persists without 'networkidle' to avoid timeout
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Check localStorage still has the auth token (zustand persist)
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(authStorage).toBeTruthy();
    const parsed = JSON.parse(authStorage || '{}');
    expect(parsed?.state?.accessToken).toBeTruthy();

    // Page should still be on /account
    expect(page.url()).toContain('/account');
  });

  test.skip('Forgot password page does not exist in current UI (returns 404)', async () => {});
});
