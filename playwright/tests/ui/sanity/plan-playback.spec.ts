import { test, expect } from '@playwright/test';

test('SAN-05 subscriber changes to Nova and starts playback', async ({ page, request }) => {
  const resetResponse = await request.post('/api/v1/test/reset');
  expect(resetResponse.status()).toBe(204);

  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('river@streamforge.test');
  await page.getByLabel('Password').fill('stream123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/browse$/);

  await page.getByRole('link', { name: 'Plans' }).click();
  await expect(page).toHaveURL(/\/plans$/);

  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Choose Nova' }).click();
  await expect(page.getByRole('status')).toHaveText('Your plan is now Nova.');

  const novaPlan = page.locator('article.plan').filter({
    has: page.getByRole('heading', { name: 'Nova' }),
  });
  await expect(novaPlan.getByText('CURRENT PLAN', { exact: true })).toBeVisible();

  await page.goto('/title/title-02');
  await expect(page.getByRole('heading', { name: 'Signal Bloom', level: 1 })).toBeVisible();
  await expect(page.getByText(/movie · nova plan/i)).toBeVisible();
  await page.getByRole('link', { name: /Play now/i }).click();

  await expect(page).toHaveURL(/\/player\/title-02$/);
  await expect(page.getByLabel('StreamForge simulated player')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Close player' })).toBeVisible();

  const cleanupResponse = await request.post('/api/v1/test/reset');
  expect(cleanupResponse.status()).toBe(204);
});
