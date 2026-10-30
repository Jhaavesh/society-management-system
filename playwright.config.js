// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  timeout: 120000,
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Always use a visible browser unless CI
    headless: true,
    viewport: { width: 1280, height: 800 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local dev servers before starting the tests */
  webServer: [
    {
      command: 'node tests/setup/test-server.mjs',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
    {
      command: 'npm --workspace frontend/web-admin run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
    {
      command: 'cd frontend/mobile-app && npx expo start --web',
      url: 'http://localhost:8081',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        EXPO_PUBLIC_API_URL: 'http://localhost:5000'
      }
    }
  ],
});
