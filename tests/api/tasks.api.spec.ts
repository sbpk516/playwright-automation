import { test, expect } from '@playwright/test';

test.describe('Tasks API', () => {
  const api = '/api/tasks';

  test('@smoke creates and retrieves a task', async ({ request }) => {
    const title = `API task ${Date.now()}`;
    const created = await request.post(api, { data: { title } });
    expect(created.status()).toBe(201);
    expect(await created.json()).toMatchObject({ title, completed: false });

    const response = await request.get(api);
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual(expect.arrayContaining([expect.objectContaining({ title })]));
  });

  test('rejects invalid input', async ({ request }) => {
    const response = await request.post(api, { data: { title: '  ' } });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Title is required' });
  });

  test('returns 404 for an unknown task', async ({ request }) => {
    const response = await request.delete(`${api}/99999999`);
    expect(response.status()).toBe(404);
  });
});
