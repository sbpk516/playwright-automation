import { test, expect } from '../../../fixtures/test-fixtures';

test('@smoke authenticated subscriber can browse the catalog', async ({
  authenticatedPage,
  browsePage,
  header,
}) => {
  // Requesting authenticatedPage in the fixture list triggers API sign-in
  // before this test body starts. browsePage and header use the same page.
  await browsePage.expectLoaded();
  await header.expectSubscriberNavigation();

  await browsePage.searchFor('Afterlight');
  await browsePage.expectTitle('Afterlight');
  await expect(authenticatedPage).toHaveURL(/search=Afterlight/);
});
