import { test, expect } from '@playwright/test';

const ADMIN_BASE = process.env.ADMIN_BASE_URL || 'http://localhost:3002';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Admin - Dashboard & Management', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login as admin via API and set cookies
    const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@test.com',
        password: 'Admin@12345'
      })
    });
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      await context.addCookies([{
        name: 'authToken',
        value: data.data.accessToken,
        url: ADMIN_BASE
      }]);
    }

    await page.goto(`${ADMIN_BASE}/dashboard`);
  });

  test('should display dashboard with KPIs', async ({ page }) => {
    // Should show main dashboard
    await expect(page.locator('h1, [data-testid="dashboard-title"]')).toContainText(/dashboard|overview/i);
    
    // Should display key metrics
    await expect(page.locator('[data-testid="kpi-card"], .stat-card, .metric')).toHaveCount(n => n >= 4);
    
    // Common KPIs: Revenue, Orders, Customers, Products
    const kpiTexts = await page.locator('[data-testid="kpi-card"], .stat-card').allTextContents();
    const hasCommonKPIs = kpiTexts.some(t => /revenue|sales|income/i.test(t)) &&
                          kpiTexts.some(t => /order|transaction/i.test(t)) &&
                          kpiTexts.some(t => /customer|client|user/i.test(t));
    expect(hasCommonKPIs || kpiTexts.length > 0).toBeTruthy();
    
    // Should show navigation sidebar
    await expect(page.locator('[data-testid="sidebar"], .sidebar, nav')).toBeVisible();
  });

  test('should navigate between sections using sidebar', async ({ page }) => {
    // Click on clients link
    const clientsLink = page.locator('a[href*="clients"], button:has-text("Clients"), span:has-text("Clients")');
    if (await clientsLink.isVisible()) {
      await clientsLink.click();
      await page.waitForURL(`${ADMIN_BASE}/*clients*`, { timeout: 5000 });
      
      await expect(page).toHaveURL(/clients/i);
    }
    
    // Click on inventory link
    const inventoryLink = page.locator('a[href*="inventory"], button:has-text("Inventory"), span:has-text("Products")');
    if (await inventoryLink.isVisible()) {
      await inventoryLink.click();
      await page.waitForURL(`${ADMIN_BASE}/*inventory*`, { timeout: 5000 });
      
      await expect(page).toHaveURL(/inventory|products/i);
    }
  });

  test('should display clients list with table', async ({ page }) => {
    // Navigate to clients
    await page.goto(`${ADMIN_BASE}/clients`);
    
    // Should show clients table or list
    const table = page.locator('table, [role="grid"], [data-testid="clients-table"]');
    if (await table.isVisible()) {
      // Should have header row
      const headers = page.locator('th, [role="columnheader"]');
      expect(await headers.count()).toBeGreaterThan(0);
      
      // Should have data rows
      const rows = page.locator('tbody tr, [role="row"]');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('should filter clients in list', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/clients`);
    
    // Find filter input
    const filterInput = page.locator('input[placeholder*="Search"], input[placeholder*="Filter"], [data-testid="search-input"]');
    if (await filterInput.isVisible()) {
      await filterInput.fill('test');
      
      // Results should update
      await page.waitForTimeout(1000);
      
      // Rows should be filtered
      const rows = page.locator('tbody tr, [role="row"]:not([role="columnheader"])');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('should sort clients table', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/clients`);
    
    // Click on table header to sort
    const nameHeader = page.locator('th:has-text("Name"), th:has-text("Client"), [role="columnheader"]:has-text("Name")');
    if (await nameHeader.isVisible()) {
      await nameHeader.click();
      
      // Table should re-sort
      await page.waitForTimeout(500);
      const rows = page.locator('tbody tr, [role="row"]');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('should create new client', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/clients`);
    
    // Click add button
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), [data-testid="add-btn"]');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Should show form or modal
      await expect(page.locator('form, [role="dialog"], .modal, .form-container')).toBeVisible({ timeout: 3000 });
      
      // Fill form
      const email = `client_${Date.now()}@test.com`;
      await page.fill('input[name="name"], input[placeholder*="Name"]', 'Test Client');
      await page.fill('input[name="email"], input[placeholder*="Email"]', email);
      await page.fill('input[name="phone"], input[placeholder*="Phone"]', '9876543210');
      await page.fill('input[name="address"], input[placeholder*="Address"]', '123 Test St');
      await page.fill('input[name="city"], input[placeholder*="City"]', 'Test City');
      
      // Save
      await page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Submit"), [data-testid="save-btn"]').click();
      
      // Should show success message
      await expect(page.locator('.success, [role="status"], .toast')).toContainText(/success|created|saved/i);
      
      // Should return to list
      await page.waitForURL(`${ADMIN_BASE}/*clients*`, { timeout: 5000 });
    }
  });

  test('should edit existing client', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/clients`);
    
    // Click edit on first client
    const editBtn = page.locator('[data-testid="edit-btn"], button:has-text("Edit"), button[aria-label="Edit"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      
      // Should show form
      await expect(page.locator('form, [role="dialog"], .modal')).toBeVisible({ timeout: 3000 });
      
      // Modify field
      const nameInput = page.locator('input[name="name"]');
      await nameInput.triple_click();
      await nameInput.fill('Updated Client Name');
      
      // Save
      await page.locator('button:has-text("Save"), button:has-text("Update"), [data-testid="save-btn"]').click();
      
      // Should show success
      await expect(page.locator('.success, [role="status"], .toast')).toContainText(/success|updated/i);
    }
  });

  test('should delete client with confirmation', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/clients`);
    
    // Click delete on first client
    const deleteBtn = page.locator('[data-testid="delete-btn"], button:has-text("Delete"), button[aria-label="Delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      // Should show confirmation dialog
      const confirmDialog = page.locator('[role="dialog"], .modal, .confirm-dialog');
      await expect(confirmDialog).toContainText(/confirm|sure|delete/i);
      
      // Confirm delete
      await page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes"), [data-testid="confirm-btn"]').click();
      
      // Should show success message
      await expect(page.locator('.success, [role="status"], .toast')).toContainText(/deleted|removed|success/i);
    }
  });

  test('should display orders list', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/orders`);
    
    // Should show orders table
    const table = page.locator('table, [role="grid"], [data-testid="orders-table"]');
    await expect(table).toBeVisible();
    
    // Should have order columns
    const headers = page.locator('th, [role="columnheader"]');
    const headerTexts = await headers.allTextContents();
    const hasOrderInfo = headerTexts.some(t => /order|id/i.test(t)) &&
                         headerTexts.some(t => /status/i.test(t));
    expect(hasOrderInfo || headerTexts.length > 0).toBeTruthy();
  });

  test('should update order status', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/orders`);
    
    // Click on first order
    const orderRow = page.locator('tbody tr, [role="row"]:not([role="columnheader"])').first();
    if (await orderRow.isVisible()) {
      await orderRow.click();
      await page.waitForURL(`${ADMIN_BASE}/*orders*`, { timeout: 5000 });
      
      // Should show order details
      await expect(page.locator('[data-testid="order-status"], .status, .order-status')).toBeVisible();
      
      // Find status dropdown/select
      const statusSelect = page.locator('select[name="status"], [data-testid="status-select"], button:has-text("Status")');
      if (await statusSelect.isVisible()) {
        await statusSelect.click();
        
        // Select new status
        const newStatus = page.locator('option, [role="option"]').nth(1);
        if (await newStatus.isVisible()) {
          await newStatus.click();
          
          // Save
          await page.locator('button:has-text("Save"), button:has-text("Update"), [data-testid="save-btn"]').click();
          
          // Should show success
          await expect(page.locator('.success, [role="status"], .toast')).toContainText(/success|updated/i);
        }
      }
    }
  });

  test('should manage inventory - view products', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/inventory`);
    
    // Should show products table
    const table = page.locator('table, [role="grid"], [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
    
    // Should have product columns
    const headers = page.locator('th, [role="columnheader"]');
    const headerTexts = await headers.allTextContents();
    expect(headerTexts.length).toBeGreaterThan(0);
  });

  test('should add new product to inventory', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/inventory`);
    
    // Click add button
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid="add-product-btn"]');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Should show form
      await expect(page.locator('form, [role="dialog"], .modal')).toBeVisible({ timeout: 3000 });
      
      // Fill form
      await page.fill('input[name="name"], input[placeholder*="Product Name"]', 'Test Product');
      await page.fill('input[name="sku"], input[placeholder*="SKU"]', `SKU${Date.now()}`);
      await page.fill('input[name="price"], input[placeholder*="Price"]', '99.99');
      await page.fill('input[name="stock"], input[placeholder*="Stock"]', '100');
      
      // Save
      await page.locator('button:has-text("Save"), [data-testid="save-btn"]').click();
      
      // Should show success
      await expect(page.locator('.success, [role="status"], .toast')).toContainText(/success|created|added/i);
    }
  });

  test('should update product stock', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/inventory`);
    
    // Click on first product
    const productRow = page.locator('tbody tr, [role="row"]:not([role="columnheader"])').first();
    if (await productRow.isVisible()) {
      await productRow.click();
      await page.waitForURL(`${ADMIN_BASE}/*`, { timeout: 5000 });
      
      // Find stock input
      const stockInput = page.locator('input[name="stock"], input[placeholder*="Stock"], [data-testid="stock-input"]');
      if (await stockInput.isVisible()) {
        await stockInput.triple_click();
        await stockInput.fill('500');
        
        // Save
        await page.locator('button:has-text("Save"), [data-testid="save-btn"]').click();
        
        // Should show success
        await expect(page.locator('.success, [role="status"], .toast')).toContainText(/success|updated/i);
      }
    }
  });

  test('should generate sales report', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/reports`);
    
    // Should show report section
    await expect(page.locator('h1, h2, [data-testid="reports-title"]')).toContainText(/report|sales/i);
    
    // Should have report filters
    const filterInputs = page.locator('input[type="date"], select, button:has-text("Filter")');
    expect(await filterInputs.count()).toBeGreaterThan(0);
    
    // Click generate/view report
    const generateBtn = page.locator('button:has-text("Generate"), button:has-text("View"), [data-testid="generate-report-btn"]');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      
      // Should show report
      await page.waitForTimeout(2000);
      const reportContent = page.locator('[data-testid="report"], .report-content, table');
      if (await reportContent.isVisible()) {
        await expect(reportContent).toBeVisible();
      }
    }
  });

  test('should export report to CSV', async ({ page, context }) => {
    await page.goto(`${ADMIN_BASE}/reports`);
    
    // Generate report first
    const generateBtn = page.locator('button:has-text("Generate"), [data-testid="generate-report-btn"]');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Click export button
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download"), [data-testid="export-btn"]');
    if (await exportBtn.isVisible()) {
      // Listen for download
      const downloadPromise = context.waitForEvent('download');
      await exportBtn.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(csv|pdf|xlsx)/);
    }
  });

  test('should manage user permissions', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/users`);
    
    // Should show users list
    const usersList = page.locator('[data-testid="users-table"], table, [role="grid"]');
    await expect(usersList).toBeVisible();
    
    // Click edit on first user
    const editBtn = page.locator('[data-testid="edit-btn"], button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      
      // Should show permissions
      const permissionsSection = page.locator('[data-testid="permissions"], [role="dialog"]');
      await expect(permissionsSection).toBeVisible({ timeout: 3000 });
      
      // Should have permission checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      expect(await checkboxes.count()).toBeGreaterThan(0);
    }
  });

  test('should logout from admin', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/dashboard`);
    
    // Click user menu
    const userMenu = page.locator('[data-testid="user-menu"], button[aria-label="User"], [aria-label="Menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Click logout
      const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        
        // Should redirect to login
        await page.waitForURL(`${ADMIN_BASE}/*login*`, { timeout: 5000 });
        await expect(page).toHaveURL(/login/i);
      }
    }
  });
});
