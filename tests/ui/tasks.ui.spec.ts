import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../fixtures/test.fixture';

test.describe('TaskFlow UI', () => {
  test.beforeEach(async ({ taskPage }) => taskPage.goto());

  test('@smoke adds and removes a task', async ({ taskPage }) => {
    const title = `Portfolio task ${Date.now()}`;
    await taskPage.addTask(title);
    await taskPage.deleteTask(title);
  });

  test('validates an empty task', async ({ taskPage }) => {
    await taskPage.addButton.click();
    await expect(taskPage.alert).toHaveText('Title is required');
  });

  test('has no automatically detectable accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
