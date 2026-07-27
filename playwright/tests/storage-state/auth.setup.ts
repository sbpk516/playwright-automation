import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';

setup('save subscriber authentication', async ({ page }) => {
  fs.mkdirSync('.auth', { recursive: true });
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(
    process.env.SUBSCRIBER_EMAIL ?? 'river@streamforge.test',
  );
  await page.getByLabel('Password').fill(
    process.env.SUBSCRIBER_PASSWORD ?? 'stream123',
  );
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/browse$/);
  await page.context().storageState({ path: '.auth/user.json' });
});
