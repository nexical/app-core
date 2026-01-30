import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const ALL_PROJECTS = [
  /* Test against desktop viewports. */
  {
    name: 'chrome-desktop',
    use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  },
  {
    name: 'firefox-desktop',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'safari-desktop',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'edge-desktop',
    use: { ...devices['Desktop Edge'], channel: 'msedge' },
  },
  /* Test against mobile viewports. */
  {
    name: 'chrome-mobile',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'safari-mobile',
    use: { ...devices['iPhone 12'] },
  },
  {
    name: 'ipad',
    use: { ...devices['iPad Pro 11'] },
  },
];

export default defineConfig({
  testDir: '.',
  testMatch: ['tests/e2e/**/*.spec.ts', 'modules/*/tests/e2e/**/*.spec.ts'],
  globalSetup: './tests/e2e/global-setup.ts',
  timeout: 120000,
  expect: {
    timeout: 45000,
  },
  globalTimeout: 0,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.TEST_WORKERS ? parseInt(process.env.TEST_WORKERS) : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['line'], ['html']],
  outputDir: 'test-results-e2e-new',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: process.env.BASE_URL || 'http://127.0.0.1:4321', // Managed by fixture now

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid',
  },

  /* Run your local dev server before starting the tests */
  /* WEBSERVER REMOVED: Managed by worker-app fixture */
  // webServer: ...

  /* Configure projects for major browsers and mobile devices */
  projects: ALL_PROJECTS.filter((project) => {
    // If TEST_BROWSERS is not defined, default to 'chrome-desktop'
    if (!process.env.TEST_BROWSERS) {
      return project.name === 'chrome-desktop';
    }
    // If TEST_BROWSERS is 'all', include everything
    if (process.env.TEST_BROWSERS === 'all') {
      return true;
    }
    // Otherwise, filter based on the comma-separated list
    const allowedBrowsers = process.env.TEST_BROWSERS.split(',').map((b) => b.trim());
    return allowedBrowsers.includes(project.name);
  }),
});
