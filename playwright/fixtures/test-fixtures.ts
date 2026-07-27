import {
  expect,
  request as playwrightRequest,
  test as base,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { AuthClient } from '../api/auth.client';
import { CatalogClient } from '../api/catalog.client';
import { ProfileClient } from '../api/profile.client';
import { BrowsePage } from '../pages/browse.page';
import { ProfilesPage } from '../pages/profiles.page';
import { SignInPage } from '../pages/sign-in.page';
import { HeaderComponent } from '../components/header.component';
import { buildProfile } from '../data/builders/profile.builder';
import type {
  Credentials,
  Profile,
} from '../data/schemas/api.types';
import { loadEnvironment } from '../config/environment';

type FrameworkFixtures = {
  subscriberCredentials: Credentials;
  signInPage: SignInPage;
  browsePage: BrowsePage;
  profilesPage: ProfilesPage;
  header: HeaderComponent;
  authenticatedPage: Page;
  subscriberRequest: APIRequestContext;
  profileClient: ProfileClient;
  catalogClient: CatalogClient;
  managedProfile: Profile;
};

export const test = base.extend<FrameworkFixtures>({
  // Option fixture: tests or projects can override this value with test.use().
  subscriberCredentials: [
    {
      email: process.env.SUBSCRIBER_EMAIL ?? 'river@streamforge.test',
      password: process.env.SUBSCRIBER_PASSWORD ?? 'stream123',
    },
    { option: true },
  ],

  // Construction-only fixtures: no setup or teardown is required.
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  browsePage: async ({ page }, use) => {
    await use(new BrowsePage(page));
  },

  profilesPage: async ({ page }, use) => {
    await use(new ProfilesPage(page));
  },

  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },

  // Setup fixture: authenticate through the API that shares the browser
  // context's cookie jar, then expose an already-authenticated Page.
  authenticatedPage: async (
    { page, subscriberCredentials },use) => {
    const authClient = new AuthClient(page.context().request);
    await authClient.signIn(subscriberCredentials);
    await page.goto('/browse');
    await expect(page).toHaveURL(/\/browse$/);

    await use(page);

    // No explicit logout is necessary: Playwright disposes the isolated
    // browser context after the test.
  },

  // API-only authenticated context. It has its own cookie jar and does not
  // need to launch a browser page.
  subscriberRequest: async ({ subscriberCredentials }, use) => {
    const environment = loadEnvironment();
    const request = await playwrightRequest.newContext({
      baseURL: environment.webBaseUrl,
      extraHTTPHeaders: {
        'x-test-suite': 'playwright-architecture',
      },
    });

    await new AuthClient(request).signIn(subscriberCredentials);
    await use(request);
    await request.dispose();
  },

  profileClient: async ({ subscriberRequest }, use) => {
    await use(new ProfileClient(subscriberRequest));
  },

  catalogClient: async ({ subscriberRequest }, use) => {
    await use(new CatalogClient(subscriberRequest));
  },

  // Managed-data fixture:
  // 1. create data,
  // 2. give it to the test at await use(profile),
  // 3. always run cleanup after the test body completes.
  managedProfile: async ({ profileClient }, use) => {
    const profile = await profileClient.create(buildProfile());
    await use(profile);
    await profileClient.delete(profile.id);
  },
});

export { expect };
