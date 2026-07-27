import { test, expect } from '../../../fixtures/test-fixtures';

test('profile client creates and lists a unique profile', async ({
  managedProfile,
  profileClient,
}) => {
  const profiles = await profileClient.list();
  const createdProfile = profiles.find(
    profile => profile.id === managedProfile.id,
  );

  expect(createdProfile).toMatchObject({
    name: managedProfile.name,
    avatar: managedProfile.avatar,
    maturity_limit: managedProfile.maturity_limit,
  });
});

test('API authentication fixture exposes the subscriber session', async ({
  subscriberRequest,
}) => {
  const response = await subscriberRequest.get('/api/v1/auth/session');

  expect(response.status()).toBe(200);
  await expect(response).toBeOK();
  expect(await response.json()).toMatchObject({
    email: 'river@streamforge.test',
    role: 'subscriber',
  });
});
