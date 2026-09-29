import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

test.describe('Mobile App Role-Based Isolation E2E', () => {
  let client;
  let db;

  test.beforeAll(async () => {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();

    // Add Accountant User
    const hashedPassword = bcrypt.hashSync('Test1234!', 10);
    const society = await db.collection('societies').findOne();
    
    // Add Resident User
    await db.collection('users').updateOne(
      { email: 'resident@mobile.test' },
      { $set: { passwordHash: hashedPassword, role: 'resident', active: true, name: 'Mobile Resident', societyIds: [society._id] } },
      { upsert: true }
    );

    // Add Accountant User
    await db.collection('users').updateOne(
      { email: 'accountant@mobile.test' },
      { $set: { passwordHash: hashedPassword, role: 'accountant', active: true, name: 'Mobile Accountant', societyIds: [society._id] } },
      { upsert: true }
    );
  });

  test.afterAll(async () => {
    await client.close();
  });

  test('Resident Login Flow', async ({ page }) => {
    // Go to Mobile Web URL
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Check if it's the login screen
    await page.waitForSelector('input[placeholder="you@example.com"]', { timeout: 30000 });

    await page.fill('input[placeholder="you@example.com"]', 'resident@mobile.test');
    await page.fill('input[placeholder="Your password"]', 'Test1234!');
    await page.locator('div:has-text("Sign in")').last().click();

    // Verify Tab navigation or Screen Title
    await expect(page.locator('text="YOUR HOME"').first()).toBeVisible({ timeout: 15000 });
    
    // Verify Dashboard data
    await expect(page.locator('text="Maintenance bill"').first()).toBeVisible();
    
    // Logout
    await page.locator('text="Profile"').click();
    // In React Native Web, Alert.alert maps to window.confirm, so we accept the dialog
    page.on('dialog', dialog => dialog.accept());
    await page.locator('text="Sign out"').click({ force: true });
    // Wait for login screen to reappear
    await expect(page.locator('text="Welcome home"')).toBeVisible();
  });

  test('Accountant Login Flow', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('input[placeholder="you@example.com"]', { timeout: 30000 });
    await page.fill('input[placeholder="you@example.com"]', 'accountant@mobile.test');
    await page.fill('input[placeholder="Your password"]', 'Test1234!');
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('div:has-text("Sign in")').last().click();

    // Wait for the app to load. Accountant doesn't have Home, they only have Bills, Notices, Profile.
    // So TabNavigator might default to Bills if Home is hidden? No, Home is hidden.
    await expect(page.locator('text="My bills"').first()).toBeVisible({ timeout: 15000 });
    
    // Profile
    await page.locator('text="Profile"').click();
    await expect(page.locator('text="Flat details unavailable"')).toBeVisible();

    // Logout
    await page.locator('text="Sign out"').click({ force: true });
  });
});
