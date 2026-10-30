import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

test.describe('Mobile App Role-Based Isolation E2E', () => {
  let client;
  let db;

  test.beforeAll(async () => {
    const mongoUri = fs.existsSync('./.test-env.json')
      ? JSON.parse(fs.readFileSync('./.test-env.json', 'utf8')).MONGODB_URI
      : process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();

    // Add Accountant User
    const hashedPassword = bcrypt.hashSync('Test1234!', 10);
    const society = await db.collection('societies').findOne();
    
    // Add Resident User
    await db.collection('users').updateOne(
      { email: 'resident@mobile.test' },
      { $set: { passwordHash: hashedPassword, role: 'resident', active: true, name: 'Mobile Resident', societyId: society._id } },
      { upsert: true }
    );

    // Add Accountant User
    await db.collection('users').updateOne(
      { email: 'accountant@mobile.test' },
      { $set: { passwordHash: hashedPassword, role: 'accountant', active: true, name: 'Mobile Accountant', societyId: society._id } },
      { upsert: true }
    );
  });

  test.afterAll(async () => {
    await client.close();
  });

  test('Resident Login Flow', async ({ page }) => {
    // Go to Mobile Web URL
    await page.goto('http://localhost:8081', { timeout: 120000 });
    await page.waitForLoadState('networkidle');
    
    // Check if it's the login screen
    await page.waitForSelector('input[placeholder="you@example.com"]', { timeout: 30000 });

    await page.fill('input[placeholder="you@example.com"]', 'resident@mobile.test');
    await page.fill('input[placeholder="Your password"]', 'Test1234!');
    await page.getByText('Sign in', { exact: true }).click();

    // Look for error message if login fails
    try {
      const errorText = await page.getByText('Network error', { exact: false }).first().innerText({ timeout: 2000 });
      console.log('Login Error found:', errorText);
    } catch (e) {
      try {
        const errorText = await page.getByText('Network', { exact: false }).first().innerText({ timeout: 1000 });
        console.log('Login Error found:', errorText);
      } catch (e2) {}
    }

    // Verify Tab navigation or Screen Title
    try {
      await expect(page.getByText('YOUR HOME', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: 'test-results/resident-login-fail.png' });
      throw e;
    }
    
    // Verify Dashboard data
    await expect(page.getByText('Maintenance bill', { exact: false }).first()).toBeVisible();
    
    // Logout
    await page.getByText('Profile', { exact: false }).click();
    // In React Native Web, Alert.alert maps to window.confirm, so we accept the dialog
    page.on('dialog', dialog => dialog.accept());
    await page.getByText('Sign out', { exact: false }).click({ force: true });
    // Wait for login screen to reappear
    await expect(page.getByText('Welcome home', { exact: false })).toBeVisible();
  });

  test('Accountant Login Flow', async ({ page }) => {
    await page.goto('http://localhost:8081', { timeout: 120000 });
    await page.waitForSelector('input[placeholder="you@example.com"]', { timeout: 30000 });
    await page.fill('input[placeholder="you@example.com"]', 'accountant@mobile.test');
    await page.fill('input[placeholder="Your password"]', 'Test1234!');
    
    page.on('dialog', dialog => dialog.accept());
    await page.getByText('Sign in', { exact: true }).click();

    // Wait for the app to load. Accountant doesn't have Home, they only have Bills, Notices, Profile.
    // So TabNavigator might default to Bills if Home is hidden? No, Home is hidden.
    try {
      await expect(page.getByText('My bills', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: 'test-results/accountant-login-fail.png' });
      throw e;
    }
    
    // Profile
    await page.getByText('Profile', { exact: false }).click();
    await expect(page.getByText('Flat details unavailable', { exact: false })).toBeVisible();

    // Logout
    await page.getByText('Sign out', { exact: false }).click({ force: true });
  });
});
