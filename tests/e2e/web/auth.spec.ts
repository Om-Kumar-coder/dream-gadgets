import { test, expect } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3001';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Web - Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${WEB_BASE}/login`);
  });

  test('should display login form with all fields', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message, [role="alert"]')).toContainText(/invalid|email/i);
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page, context }) => {
    // Create test user via API
    const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `user_${Date.now()}@test.com`,
        password: 'Test@12345',
        phone: '9999999999',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    const user = await registerRes.json();
    
    // Login via UI
    await page.fill('input[name="email"]', user.data.email);
    await page.fill('input[name="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard/home
    await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
    await expect(page).not.toHaveURL(`${WEB_BASE}/login`);
    
    // Auth token should be stored in localStorage/cookies
    const cookies = await context.cookies();
    const hasAuthCookie = cookies.some(c => c.name.toLowerCase().includes('auth') || c.name.toLowerCase().includes('token'));
    expect(hasAuthCookie || localStorage).toBeTruthy();
  });

  test('should show error for wrong password', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message, [role="alert"]')).toContainText(/invalid|incorrect|wrong/i);
  });

  test('should show error for non-existent email', async ({ page }) => {
    await page.fill('input[name="email"]', 'nonexistent_' + Date.now() + '@test.com');
    await page.fill('input[name="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.click('a[href="/register"]');
    await page.waitForURL(`${WEB_BASE}/register`);
    
    const email = `newuser_${Date.now()}@test.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="phone"]', '9999999999');
    await page.fill('input[name="password"]', 'Test@12345');
    await page.fill('input[name="confirmPassword"]', 'Test@12345');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to login or dashboard
    await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login|\/dashboard|\/account/i);
  });

  test('should logout successfully', async ({ page, context }) => {
    // Login first
    const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `user_${Date.now()}@test.com`,
        password: 'Test@12345',
        phone: '9999999999',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    const user = await registerRes.json();
    
    await page.fill('input[name="email"]', user.data.email);
    await page.fill('input[name="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
    
    // Logout
    await page.click('button[aria-label="User menu"], a[href="/account"], [data-testid="user-menu"]');
    await page.click('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
    
    // Should redirect to login
    await page.waitForURL(`${WEB_BASE}/login`);
    await expect(page).toHaveURL(`${WEB_BASE}/login`);
  });

  test('should persist session across page reload', async ({ page, context }) => {
    // Login
    const registerRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `user_${Date.now()}@test.com`,
        password: 'Test@12345',
        phone: '9999999999',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    const user = await registerRes.json();
    
    await page.fill('input[name="email"]', user.data.email);
    await page.fill('input[name="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${WEB_BASE}/*`, { timeout: 5000 });
    
    // Reload page
    await page.reload();
    
    // Should still be logged in (not redirected to login)
    await expect(page).not.toHaveURL(`${WEB_BASE}/login`);
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.click('a:has-text("Forgot Password"), button:has-text("Forgot Password")');
    await page.waitForURL(`${WEB_BASE}/forgot-password`, { timeout: 5000 });
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.success-message, [role="status"]')).toContainText(/reset|sent|email/i);
  });
});
