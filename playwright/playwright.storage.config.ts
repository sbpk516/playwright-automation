import { defineConfig, devices } from '@playwright/test';
import { loadEnvironment } from './config/environment';

const environment = loadEnvironment();

export default defineConfig({
  testDir: './tests/storage-state',
  use: {
    baseURL: environment.webBaseUrl,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
    },
  ],
});
