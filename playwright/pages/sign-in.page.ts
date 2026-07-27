import { expect, type Page } from '@playwright/test';
import type { Credentials } from '../data/schemas/api.types';

export class SignInPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/sign-in');
    await expect(
      this.page.getByRole('heading', { name: 'Sign in to your stories.' }),
    ).toBeVisible();
  }

  async signIn(credentials: Credentials): Promise<void> {
    await this.page.getByLabel('Email').fill(credentials.email);
    await this.page.getByLabel('Password').fill(credentials.password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async signInAsSubscriber(credentials: Credentials): Promise<void> {
    await this.open();
    await this.signIn(credentials);
    await expect(this.page).toHaveURL(/\/browse$/);
  }
}
