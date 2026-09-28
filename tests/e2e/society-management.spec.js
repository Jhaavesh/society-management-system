import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

test.describe('Society Management E2E', () => {
  test('Complete Flow: Login to Logout across all modules', async ({ page }) => {
    test.setTimeout(120000);
    // 1. Prepare database
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    const hashedPassword = bcrypt.hashSync('Test1234!', 10);
    await db.collection('users').updateOne(
      { email: 'jhaavesh@gmail.com' },
      { $set: { passwordHash: hashedPassword, role: 'platform_admin', active: true, name: 'Platform Admin' } },
      { upsert: true }
    );

    const society = await db.collection('societies').findOne();

    // 2. Authentication Test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jhaavesh@gmail.com');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // 3. Module Tests
    const modules = ['societies', 'buildings', 'flats', 'residents', 'billing', 'complaints', 'visitors', 'notices', 'reports'];
    
    for (const mod of modules) {
      await test.step(`Verify module: ${mod}`, async () => {
        await page.goto(`/${mod}`);
        await page.waitForLoadState('domcontentloaded');

        // Select society if not the societies page itself
        if (mod !== 'societies') {
          await page.waitForSelector('.workspace-label select', { state: 'visible' });
          await page.selectOption('.workspace-label select', society._id.toString());
          // Wait briefly for data to refresh based on society selection
          await page.waitForTimeout(1000);
        }

        // Verify no UI runtime crashes
        const bodyText = await page.evaluate(() => document.body.innerText);
        expect(bodyText).not.toContain('TypeError');
        expect(bodyText).not.toContain('Cannot read properties of undefined');

        // Verify "Add/Create" button is visible and working
        const createBtn = page.locator('.module-heading button');
        const count = await createBtn.count();
        if (count > 0) {
          await createBtn.click();
          // Ensure modal opens
          const modal = page.locator('.modal');
          await expect(modal).toBeVisible();
          // Close modal
          await page.locator('.modal-close').click();
          await expect(modal).toBeHidden();
        }
      });
    }

    // 4. Logout Test
    await test.step('Logout', async () => {
      await page.click('.logout-button');
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');
    });

    await client.close();
  });

  test('Authentication Restrictions', async ({ page }) => {
    // Attempting to view dashboard without login should redirect
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');

    // Invalid credentials should show error
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jhaavesh@gmail.com');
    await page.fill('input[type="password"]', 'WrongPass!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.login-error')).toBeVisible();
    await expect(page.locator('.login-error')).toContainText('incorrect');
  });
});
