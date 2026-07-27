import { test, expect } from '@playwright/test';
import { BrowsePage } from '../../pages/browse.page';
import { SignInPage } from '../../pages/sign-in.page';

test('reuses the saved authenticated session', async ({ page }) => {
  const browsePage = new BrowsePage(page);
  await browsePage.open();
  await browsePage.expectTitle('Afterlight');
});

test.describe('fresh session', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logs in through the user interface', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.signInAsSubscriber({
      email: process.env.SUBSCRIBER_EMAIL ?? 'river@streamforge.test',
      password: process.env.SUBSCRIBER_PASSWORD ?? 'stream123',
    });
    await expect(page).toHaveURL(/\/browse$/);
  });
});
