import { test as base, expect } from '@playwright/test';
import { TaskPage } from '../pages/task.page';

type Fixtures = { taskPage: TaskPage };

export const test = base.extend<Fixtures>({
  taskPage: async ({ page }, use) => {
    await use(new TaskPage(page));
  }
});

export { expect };
