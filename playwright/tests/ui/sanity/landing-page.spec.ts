import {test, expect} from '@playwright/test';

test('SAN-01 public landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/StreamForge/);
    await expect(page.getByRole('heading', { name: /Stories that stay in motion/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Spark' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Flare' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nova' })).toBeVisible();
    await expect(page.getByText('fictional plans and prices')).toBeVisible();

});



test('SAN-01-01 public landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/StreamForge/);
    await expect(page.getByRole('heading', { name: /Stories that stay in motion/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Spark' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Flare' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nova' })).toBeVisible();
    await expect(page.getByText('fictional plans and prices')).toBeVisible();

});


test('SAN-01-02 public landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/StreamForge/);
    await expect(page.getByRole('heading', { name: /Stories that stay in motion/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Spark' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Flare' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nova' })).toBeVisible();
    await expect(page.getByText('fictional plans and prices')).toBeVisible();

});