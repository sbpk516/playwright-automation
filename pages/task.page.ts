import { expect, type Locator, type Page } from '@playwright/test';

export class TaskPage {
  readonly input: Locator;
  readonly addButton: Locator;
  readonly tasks: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.input = page.getByTestId('task-input');
    this.addButton = page.getByRole('button', { name: 'Add task' });
    this.tasks = page.getByTestId('task-item');
    this.alert = page.getByRole('alert');
  }

  async goto() { await this.page.goto('/'); }

  async addTask(title: string) {
    await this.input.fill(title);
    await this.addButton.click();
    await expect(this.tasks.filter({ hasText: title })).toBeVisible();
  }

  async deleteTask(title: string) {
    const row = this.tasks.filter({ hasText: title });
    await row.getByRole('button', { name: `Delete ${title}` }).click();
    await expect(row).toHaveCount(0);
  }
}
