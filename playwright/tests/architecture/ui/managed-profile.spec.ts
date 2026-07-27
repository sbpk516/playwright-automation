import { test } from '../../../fixtures/test-fixtures';

test('managed data fixture exposes a profile to the UI', async ({
  authenticatedPage,
  managedProfile,
  profilesPage,
}) => {
  // managedProfile has already been created through the API.
  // It will be deleted automatically after the test body finishes.
  await profilesPage.open();
  await profilesPage.expectProfile(managedProfile.name);

  // Referencing the fixture also makes its dependency chain visible:
  // managedProfile -> profileClient -> subscriberRequest.
  void authenticatedPage;
});
