import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

(async () => {
  // Connect to DB to get the user and society ID
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const user = await client.db().collection('users').findOne({ email: 'jhaavesh@gmail.com' });
  const society = await client.db().collection('societies').findOne();
  const payload = {
    sub: user._id.toString(),
    name: user.name,
    role: user.role,
    flatId: user.flatId?.toString() || null,
    societyIds: [society._id.toString()]
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('dialog', async dialog => {
    console.error(`ALERT POPUP ENCOUNTERED: ${dialog.message()}`);
    await dialog.accept();
  });

  console.log("Injecting JWT and navigating...");
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  await page.evaluate((token, user, society) => {
    localStorage.setItem('societyOS.token', token);
    localStorage.setItem('societyOS.session', JSON.stringify({
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        societyIds: [society._id]
      }
    }));
  }, token, user, society);

  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  console.log("Logged in via JWT. Current URL:", page.url());

  const modules = ['reports'];

  for (const mod of modules) {
    console.log(`Navigating to ${mod}...`);
    await page.goto(`http://localhost:5173/${mod}`, { waitUntil: 'networkidle0' });
    
    // Check for errors in the DOM or empty states
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('TypeError') || bodyText.includes('Cannot read properties of undefined') || bodyText.includes('Module not found')) {
      console.error(`ERROR found on ${mod} page load:`, bodyText.substring(0, 200));
      process.exit(1);
    }

    console.log(`  Selecting society for ${mod}...`);
    await page.waitForSelector('.workspace-label select');
    await page.select('.workspace-label select', society._id.toString());
    await new Promise(r => setTimeout(r, 1000));

    console.log(`  Clicking Add/Create on ${mod}...`);
    await page.waitForSelector('.module-heading button', { timeout: 10000 }).catch(() => {});
    const actionButtons = await page.$$('.module-heading button');
    if (actionButtons.length > 0) {
      await actionButtons[0].click();
      
      // Wait for modal
      await page.waitForSelector('.modal', { visible: true });

      const realFlat = await client.db().collection('flats').findOne({ societyId: society._id });
      const realBill = await client.db().collection('bills').findOne({ flatId: realFlat?._id });

      if (realFlat && realBill) {
        await page.click('input[name="flatId"]', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type('input[name="flatId"]', realFlat._id.toString());

        await page.click('input[name="billId"]', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type('input[name="billId"]', realBill._id.toString());
      } else {
        console.log("  No flat or bill found in DB to test payments.");
      }

      await page.click('input[name="amountPaid"]', { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.type('input[name="amountPaid"]', '2000');
      
      console.log(`  Submitting form for ${mod}...`);
      await page.click('.form-actions button[type="submit"]');

      // Wait a moment for network response
      await new Promise(r => setTimeout(r, 2000));

      const isModalOpen = await page.evaluate(() => document.querySelector('.modal') !== null);
      if (isModalOpen) {
        const errorText = await page.evaluate(() => document.body.innerText);
        console.error(`ERROR: Form submission failed on ${mod}. Modal is still open. Text:`, errorText.substring(0, 500));
        await page.screenshot({ path: `error-${mod}.png` });
        process.exit(1);
      } else {
        console.log(`  Success! Form submitted for ${mod}`);
      }
    } else {
      console.log(`  No action button found for ${mod}`);
      await page.screenshot({ path: `error-${mod}-nobtn.png` });
    }
  }

  console.log("All modules loaded and submitted successfully without errors.");
  await browser.close();
  await client.close();
  process.exit(0);
})();
