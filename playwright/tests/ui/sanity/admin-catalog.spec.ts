import { test, expect } from '@playwright/test';

test('SAN-06 administrator opens catalog administration', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('admin@streamforge.test');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Catalog administration.', level: 1 })).toBeVisible();
  await expect(page.getByText('30 records')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Afterlight', level: 2 })).toBeVisible();
  await expect(page.getByText('NEW TITLE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add to the catalog.', level: 2 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create draft' })).toBeVisible();
});


test('SAN-06-01 administrator opens catalog administration', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('admin@streamforge.test');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Catalog administration.', level: 1 })).toBeVisible();
  await expect(page.getByText('30 records')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Afterlight', level: 2 })).toBeVisible();
  await expect(page.getByText('NEW TITLE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add to the catalog.', level: 2 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create draft' })).toBeVisible();
});


test('SAN-06-02 administrator opens catalog administration', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('admin@streamforge.test');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Catalog administration.', level: 1 })).toBeVisible();
  await expect(page.getByText('30 records')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Afterlight', level: 2 })).toBeVisible();
  await expect(page.getByText('NEW TITLE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add to the catalog.', level: 2 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create draft' })).toBeVisible();
});