import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('catalog service integration', () => {
  test('API result is discoverable through the browser', async ({
    authenticatedPage,
    browsePage,
    catalogClient,
  }) => {
    const catalog = await catalogClient.search('Afterlight');
    expect(catalog.count).toBe(1);
    const expectedTitle = catalog.items[0].name;

    await browsePage.searchFor(expectedTitle);
    await browsePage.expectTitle(expectedTitle);
    await expect(authenticatedPage).toHaveURL(/search=Afterlight/);
  });

  test('UI handles a controlled catalog dependency failure', async ({
    authenticatedPage,
    browsePage,
  }) => {
    // This route is scoped to one browser page, so it cannot change global
    // server state or interfere with tests executing in parallel.
    await authenticatedPage.route('**/api/v1/titles*', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'catalog_unavailable',
          message: 'The catalog service is temporarily unavailable.',
          correlationId: 'test-correlation-id',
        }),
      });
    });

    await authenticatedPage.reload();
    await browsePage.expectServiceError();
  });
});
