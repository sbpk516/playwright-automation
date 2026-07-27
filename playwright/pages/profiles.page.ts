import { expect, type Page } from '@playwright/test';

export class ProfilesPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/profiles');
    await expect(
      this.page.getByRole('heading', { name: 'Profiles.' }),
    ).toBeVisible();
  }

  async expectProfile(name: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name, level: 2 }),
    ).toBeVisible();
  }
}
