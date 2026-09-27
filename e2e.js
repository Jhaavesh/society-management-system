import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

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
    // Click the module in the sidebar
    // We can just navigate to the URL directly for a quick smoke test
    await page.goto(`http://localhost:5173/${mod}`, { waitUntil: 'networkidle0' });
    
    // Check for errors in the DOM or empty states
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('TypeError') || bodyText.includes('Cannot read properties of undefined')) {
      console.error(`ERROR found on ${mod}:`, bodyText.substring(0, 200));
      process.exit(1);
    }
  }

  console.log("All modules loaded successfully without React crashes.");
  await browser.close();
})();
