import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('dialog', async dialog => {
    console.error(`ALERT POPUP ENCOUNTERED: ${dialog.message()}`);
    await dialog.accept();
    // We don't want to exit immediately because some alerts might be expected, but for our form submission test, alerts mean failure.
  });

  console.log("Navigating to login...");
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  console.log("Logging in...");
  await page.type('input[type="email"]', 'admin@example.com');
  await page.type('input[type="password"]', 'change-this-password');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log("Logged in. Current URL:", page.url());

  const modules = [
    'societies', 'buildings', 'flats', 'residents',
    'billing', 'complaints', 'visitors', 'notices', 'reports'
  ];

  for (const mod of modules) {
    console.log(`Navigating to ${mod}...`);
    await page.goto(`http://localhost:5173/${mod}`, { waitUntil: 'networkidle0' });
    
    // Check for errors in the DOM or empty states
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('TypeError') || bodyText.includes('Cannot read properties of undefined') || bodyText.includes('Module not found')) {
      console.error(`ERROR found on ${mod} page load:`, bodyText.substring(0, 200));
      process.exit(1);
    }

    if (mod !== 'societies') {
      console.log(`  Selecting society for ${mod}...`);
      await page.waitForSelector('.workspace-label select');
      await page.select('.workspace-label select', '60b8d295f1d2c72b1c345678');
      await new Promise(r => setTimeout(r, 1000));
    }

    // Click "Add" or "Create" button
    console.log(`  Clicking Add/Create on ${mod}...`);
    const actionButtons = await page.$$('.module-heading button');
    if (actionButtons.length > 0) {
      await actionButtons[0].click();
      
      // Wait for modal
      await page.waitForSelector('.modal', { visible: true });

      // The form should be pre-filled with default values. Click "Save"
      console.log(`  Submitting form for ${mod}...`);
      await page.click('.form-actions button[type="submit"]');

      // Wait a moment for network response
      await new Promise(r => setTimeout(r, 1000));

      // Check if modal closed or if there is an error in DOM
      const isModalOpen = await page.evaluate(() => document.querySelector('.modal') !== null);
      if (isModalOpen) {
        const errorText = await page.evaluate(() => document.body.innerText);
        console.error(`ERROR: Form submission failed on ${mod}. Modal is still open. Text:`, errorText.substring(0, 500));
        
        // Take screenshot
        await page.screenshot({ path: `error-${mod}.png` });
        process.exit(1);
      } else {
        console.log(`  Success! Form submitted for ${mod}`);
      }
    } else {
      console.log(`  No action button found for ${mod}`);
    }
  }

  console.log("All modules loaded successfully without React crashes.");
  await browser.close();
})();
