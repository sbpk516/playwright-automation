import { expect, type Page } from '@playwright/test';

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  async expectSubscriberNavigation(): Promise<void> {
    const navigation = this.page.getByRole('navigation', { name: 'Primary' });

    await expect(navigation).toBeVisible();
    await expect(
      navigation.getByRole('link', { name: 'Browse' }),
    ).toBeVisible();
    await expect(
      navigation.getByRole('link', { name: 'My list' }),
    ).toBeVisible();
  }

  async openProfiles(): Promise<void> {
    await this.page.getByRole('link', { name: 'Profiles' }).click();
    await expect(this.page).toHaveURL(/\/profiles$/);
  }
}
