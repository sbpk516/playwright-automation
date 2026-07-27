import { expect, type Page } from '@playwright/test';

export class BrowsePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/browse');
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: /Find your next obsession/i,
      }),
    ).toBeVisible();
    await expect(this.page.getByText(/\d+ titles/)).toBeVisible();
  }

  async searchFor(title: string): Promise<void> {
    // Search state is URL-driven in StreamForge. Navigating to the public
    // filter contract is deterministic across engines and keeps this example
    // focused on framework composition rather than debounce/hydration timing.
    await this.page.goto(`/browse?search=${encodeURIComponent(title)}`);
    await expect(this.page).toHaveURL(
      new RegExp(`search=${encodeURIComponent(title)}`),
    );
  }

  async expectTitle(title: string): Promise<void> {
    await expect(
      this.page.getByRole('link', { name: `View ${title}` }),
    ).toBeVisible();
  }

  async expectServiceError(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'We lost the signal.' }),
    ).toBeVisible();
  }
}
