import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    testIdAttribute: 'data-testid'
  },
  projects: [
    { name: 'api', testMatch: /.*api.*\.spec\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testMatch: /.*ui.*\.spec\.ts/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /.*ui.*\.spec\.ts/ },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testMatch: /.*ui.*\.spec\.ts/ }
  ],
  webServer: {
    command: 'node demo/server.js',
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
});
