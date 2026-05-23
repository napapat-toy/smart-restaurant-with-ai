import { test, expect } from '@playwright/test';

test.describe('Staff Authentication and Role Isolation', () => {
  test.beforeEach(async ({ request }) => {
    // Seed the database to ensure clean state and correct PINs
    const response = await request.get('/api/seed', {
      headers: {
        'x-seed-key': process.env.SEED_API_KEY || ''
      }
    });
    expect(response.ok()).toBeTruthy();
  });

  test('Cashier and Kitchen should maintain separate sessions concurrently', async ({ browser }) => {
    // 1. Create a clean session context for Cashier
    const cashierContext = await browser.newContext();
    const cashierPage = await cashierContext.newPage();
    
    // Login Cashier
    await cashierPage.goto('/login');
    await cashierPage.fill('input[placeholder="รหัส PIN หรือ Admin Password"]', '1111');
    await cashierPage.click('button[type="submit"]');
    
    // Verify redirected to /cashier
    await expect(cashierPage).toHaveURL(/.*cashier/);
    await expect(cashierPage.locator('.cashier-container')).toBeVisible();

    // 2. Create a clean session context for Kitchen
    const kitchenContext = await browser.newContext();
    const kitchenPage = await kitchenContext.newPage();
    
    // Login Kitchen
    await kitchenPage.goto('/login');
    await kitchenPage.fill('input[placeholder="รหัส PIN หรือ Admin Password"]', '2222');
    await kitchenPage.click('button[type="submit"]');
    
    // Verify redirected to /kitchen
    await expect(kitchenPage).toHaveURL(/.*kitchen/);
    await expect(kitchenPage.locator('.kitchen-container')).toBeVisible();

    // 3. Verify Cashier is STILL logged in after Kitchen logged in
    await cashierPage.reload();
    await expect(cashierPage).toHaveURL(/.*cashier/);
    await expect(cashierPage.locator('.cashier-container')).toBeVisible();

    // 4. Verify Kitchen is STILL logged in after Cashier reloaded
    await kitchenPage.reload();
    await expect(kitchenPage).toHaveURL(/.*kitchen/);
    await expect(kitchenPage.locator('.kitchen-container')).toBeVisible();

    // Cleanup contexts
    await cashierContext.close();
    await kitchenContext.close();
  });

  test('Admin session should not interfere with Cashier or Kitchen sessions', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    // Login Admin
    await adminPage.goto('/login');
    await adminPage.fill('input[placeholder="รหัส PIN หรือ Admin Password"]', 'admin1234');
    await adminPage.click('button[type="submit"]');
    
    // Verify redirected to /admin
    await expect(adminPage).toHaveURL(/.*admin/);
    await expect(adminPage.locator('.admin-container')).toBeVisible();

    // Create Cashier session context
    const cashierContext = await browser.newContext();
    const cashierPage = await cashierContext.newPage();
    await cashierPage.goto('/login');
    await cashierPage.fill('input[placeholder="รหัส PIN หรือ Admin Password"]', '1111');
    await cashierPage.click('button[type="submit"]');
    await expect(cashierPage).toHaveURL(/.*cashier/);

    // Verify Admin is still logged in
    await adminPage.reload();
    await expect(adminPage).toHaveURL(/.*admin/);
    await expect(adminPage.locator('.admin-container')).toBeVisible();

    // Cleanup contexts
    await adminContext.close();
    await cashierContext.close();
  });
});
