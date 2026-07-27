# Playwright Framework and Fixtures - Learning Guide

This guide uses the working StreamForge framework in `playwright/`. Its goal is
to make the architecture easy to explain and the fixture lifecycle easy to
reason about during a technical interview.

## The two-pass approach

### Pass 1: become operational quickly

Run the application and focused examples:

```bash
docker compose up --build --detach
cd playwright
npm ci
npx playwright install
npm run typecheck
npm run test:smoke
npm run test:api
npm run test:ui
npm run test:integration
```

At the end of this pass, be able to point to one example of each layer:

| Layer | Example |
|---|---|
| Test | `tests/architecture/smoke/authenticated-browse.spec.ts` |
| Page object | `pages/browse.page.ts` |
| Component object | `components/header.component.ts` |
| Fixture | `fixtures/test-fixtures.ts` |
| API client | `api/profile.client.ts` |
| Data builder | `data/builders/profile.builder.ts` |
| Data schema | `data/schemas/api.types.ts` |
| Environment configuration | `config/environment.ts` |
| Runner configuration | `playwright.config.ts` |
| CI workflow | `.github/workflows/pr-smoke.yml` |

### Pass 2: understand and explain the design

Study one dependency chain at a time. Do not attempt to memorize the whole
framework in one sitting.

---

# 1. The fixture mental model

A fixture is a managed dependency for a test.

```text
setup
  |
  v
await use(value)  ---> test receives and uses value
  |
  v
teardown
```

The test does not call the fixture directly. Playwright reads the test
parameters, identifies the requested fixture names, resolves their dependencies,
and executes the necessary setup.

```ts
test('example', async ({ managedProfile, profileClient }) => {
  // Playwright resolves both fixture names before this body starts.
});
```

The fixture name is the dependency-injection key. TypeScript provides the type.

## The most important fixture line

```ts
await use(value);
```

Everything before this line is setup. The test runs while `use` is active.
Everything after this line is teardown.

```ts
managedProfile: async ({ profileClient }, use) => {
  // Setup
  const profile = await profileClient.create(buildProfile());

  // Give the profile to the test and wait for the test to finish
  await use(profile);

  // Teardown
  await profileClient.delete(profile.id);
},
```

Even when an assertion in the test fails, Playwright unwinds the fixture and
runs the teardown.

---

# 2. Three fixture categories in this implementation

## Category A: construction-only fixture

```ts
browsePage: async ({ page }, use) => {
  await use(new BrowsePage(page));
},
```

Purpose:

- Construct a reusable object.
- Inject Playwright's built-in `page`.
- Give the typed object to the test.
- No custom cleanup is necessary.

Dependency chain:

```text
browsePage
  `-- page (built-in fixture)
```

Interview explanation:

> This is a lightweight dependency-injection fixture. It constructs the page
> object with Playwright's isolated page and exposes it to the test. Browser
> cleanup remains Playwright's responsibility.

## Category B: setup fixture

```ts
authenticatedPage: async (
  { page, subscriberCredentials },
  use,
) => {
  const authClient = new AuthClient(page.context().request);
  await authClient.signIn(subscriberCredentials);
  await page.goto('/browse');
  await expect(page).toHaveURL(/\/browse$/);

  await use(page);
},
```

Purpose:

- Authenticate before the test body.
- Use the browser context's `request` object.
- Share the authentication cookie with the browser page.
- Expose a browser that is already ready for an authenticated scenario.

Dependency chain:

```text
authenticatedPage
  |-- page (built-in)
  `-- subscriberCredentials (option fixture)
```

Why `page.context().request` matters:

- It shares cookie storage with that browser context.
- The API sign-in response sets the session cookie.
- When the page opens `/browse`, the web application is already authenticated.
- The test avoids repeating a UI login when login itself is not under test.

Interview explanation:

> I use API authentication for tests whose purpose is not to verify the login
> screen. The request object belongs to the same browser context, so the session
> cookie is immediately available to the page. This makes setup faster while
> preserving browser isolation.

## Category C: managed-data fixture

```ts
managedProfile: async ({ profileClient }, use) => {
  const profile = await profileClient.create(buildProfile());
  await use(profile);
  await profileClient.delete(profile.id);
},
```

Purpose:

- Generate unique data.
- Create it through the API.
- Give the created record to the test.
- Clean it up automatically.

Dependency chain:

```text
managedProfile
  `-- profileClient
      `-- subscriberRequest
          `-- subscriberCredentials
```

This illustrates transitive dependency injection. The test asks only for
`managedProfile`; Playwright discovers and starts all dependencies underneath
it.

Interview explanation:

> The test does not need to know how authentication, API context creation, or
> cleanup works. It asks for a managed profile. The fixture graph creates an
> authenticated API context, constructs the client, creates unique data, and
> guarantees cleanup after the test.

---

# 3. API-only authentication fixture

```ts
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
```

This fixture does not launch a browser.

Lifecycle:

1. Load the environment.
2. Create an isolated API context with its own cookie jar.
3. Sign in and store the returned cookie in that API context.
4. Give the authenticated context to dependent fixtures/tests.
5. Dispose of the context after the test.

Why it is test-scoped:

- Each test receives isolated cookies.
- Tests cannot accidentally sign one another out.
- The fixture can safely be used in parallel.

When a worker-scoped fixture may be appropriate:

- Starting an expensive read-only service once per worker.
- Allocating an independent account or data namespace per worker.
- Creating something expensive that can safely be shared by tests in that
  worker.

Authentication should not automatically become worker-scoped. Sharing mutable
account state can create coupling.

---

# 4. Option fixtures

```ts
subscriberCredentials: [
  {
    email: process.env.SUBSCRIBER_EMAIL ?? 'river@streamforge.test',
    password: process.env.SUBSCRIBER_PASSWORD ?? 'stream123',
  },
  { option: true },
],
```

An option fixture is configuration that tests or projects can override:

```ts
test.use({
  subscriberCredentials: {
    email: 'sage@streamforge.test',
    password: 'stream123',
  },
});
```

The credentials come from environment variables in CI. The fallback values are
safe only because StreamForge is a local demo application.

---

# 5. Why API clients are separate from fixtures

A fixture manages lifecycle and dependency injection. An API client describes
operations.

```ts
profileClient: async ({ subscriberRequest }, use) => {
  await use(new ProfileClient(subscriberRequest));
},
```

```ts
export class ProfileClient {
  constructor(private readonly request: APIRequestContext) {}

  async create(profile: ProfileInput): Promise<Profile> {
    const response = await this.request.post('/api/v1/profiles', {
      data: profile,
    });

    expect(response.status()).toBe(201);
    return response.json() as Promise<Profile>;
  }
}
```

Benefits:

- Tests read in business language.
- Endpoint details are not duplicated.
- Authentication remains outside the client.
- The client can be reused by API, UI setup, and integration tests.
- Types make request and response contracts visible.

Avoid making one client contain every endpoint in the system. Prefer clients
aligned to resources or bounded capabilities.

---

# 6. Why data builders are separate

```ts
const profile = await profileClient.create(buildProfile());
```

The builder creates valid defaults and lets the caller override only what
matters:

```ts
buildProfile({ maturity_limit: 13 });
```

Benefits:

- Tests show scenario intent rather than irrelevant fields.
- Unique data reduces parallel collisions.
- Schema changes have one primary update location.
- Negative and boundary variants are easy to express.

---

# 7. How one test is assembled

Test:

```ts
test('managed data fixture exposes a profile to the UI', async ({
  authenticatedPage,
  managedProfile,
  profilesPage,
}) => {
  await profilesPage.open();
  await profilesPage.expectProfile(managedProfile.name);
  void authenticatedPage;
});
```

Execution sequence:

```text
1. Playwright sees authenticatedPage, managedProfile, profilesPage.
2. It starts built-in page.
3. authenticatedPage signs the browser context in.
4. managedProfile needs profileClient.
5. profileClient needs subscriberRequest.
6. subscriberRequest creates a separate API context and signs in.
7. managedProfile creates a unique profile.
8. profilesPage is constructed with the built-in page.
9. The test body runs.
10. managedProfile deletes the created profile.
11. subscriberRequest disposes its API context.
12. Playwright closes the browser page/context.
```

This example intentionally shows independent UI and API authentication
contexts. They represent the same seeded user but have separate session cookies.

---

# 8. Project configuration decisions

The framework has one API project and three browser projects:

```text
api       -> API specifications once
chromium  -> browser specifications
firefox   -> browser specifications
webkit    -> browser specifications
```

API tests are ignored by browser projects because repeating the same service
test for every browser wastes pipeline time without adding coverage.

Other important settings:

- `forbidOnly` fails CI when `test.only` is committed.
- CI retries are limited and do not replace flake investigation.
- `fullyParallel` requires isolated data and independent tests.
- Trace is captured on the first retry.
- Screenshot and video are retained only on failure.

---

# 9. Real integration versus controlled dependency

The integration example contains two complementary tests.

## Real API-to-UI agreement

1. Search the real API.
2. Capture the returned title.
3. Open the browser with the same search.
4. Verify that the UI exposes the expected title.

This validates deployed collaboration between the web application and API.

## Controlled dependency failure

```ts
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
```

This safely validates UI error handling. The route belongs only to one page, so
it cannot affect tests executing in parallel.

The first implementation considered the app's global fault-injection endpoint.
That would change shared server state and could interfere with other parallel
tests. A page-scoped route is safer for this scenario.

Interview insight:

> A test utility can still be unsafe if it mutates shared environment state.
> Parallel architecture requires isolation at the server-data and dependency
> levels, not only separate browser pages.

---

# 10. Practice exercises

Complete these in order.

## Exercise 1: construction fixture

Create a `PlansPage`, add a `plansPage` fixture, and write one test that checks
the three seeded plans.

Goal: understand object injection.

## Exercise 2: option fixture

Override `subscriberCredentials` with the Sage account in one test and verify
the session email.

Goal: understand configurable fixtures.

## Exercise 3: managed-data fixture

Create a `managedWatchlistTitle` fixture that:

1. Adds a title through the API.
2. Gives the title ID to the test.
3. Removes it during teardown.

Goal: understand setup, `use`, and cleanup.

## Exercise 4: worker fixture

Create a worker-scoped fixture that exposes a unique namespace:

```ts
workerNamespace: [
  async ({}, use, workerInfo) => {
    await use(`worker-${workerInfo.workerIndex}`);
  },
  { scope: 'worker' },
],
```

Use it in a data builder.

Goal: understand test scope versus worker scope.

## Exercise 5: failure experiment

Add an assertion that intentionally fails inside the managed-profile test.
After execution, call the profiles API and confirm that teardown still deleted
the record. Remove the intentional failure afterward.

Goal: prove teardown behavior rather than merely reading about it.

## Exercise 6: fixture dependency experiment

Temporarily add `console.log` statements before and after each `use()` call.
Run one test with one worker:

```bash
npx playwright test tests/architecture/ui/managed-profile.spec.ts \
  --project=chromium --workers=1
```

Observe setup order and reverse teardown order. Remove the logs afterward.

---

# 11. Common fixture mistakes

## Mistake: one giant fixture

Avoid a fixture that logs in, resets the database, creates every page object,
creates multiple records, and performs global cleanup for every test.

Result:

- Hidden work
- Slow tests
- Tight coupling
- Difficult parallel execution
- Failures before the test begins

Use small fixtures with explicit dependencies.

## Mistake: resetting global data before every test

A global reset can delete records used by another parallel test. Prefer unique
data and targeted cleanup.

## Mistake: using UI login in every test

UI login is appropriate when testing authentication. Other scenarios can use
API authentication to improve speed and reduce duplication.

## Mistake: storing mutable state in page objects

Page objects should represent behavior and locators. Test state belongs in the
test or managed fixtures.

## Mistake: hiding all assertions in API clients

Clients can validate transport prerequisites, but business-specific assertions
should remain visible in the test.

## Mistake: worker-scoping mutable data without a namespace

Sharing accounts or records across tests can cause nondeterministic failures.
Use separate worker data pools or keep the fixture test-scoped.

---

# 12. Interview-ready framework answer

> I organize the framework by responsibility. Tests describe business intent.
> Page and component objects encapsulate reusable browser behavior. API clients
> isolate service operations and typed payloads. Data builders produce unique,
> scenario-focused data. Fixtures connect those layers and manage lifecycle.
>
> For example, my authenticated-page fixture signs in through the browser
> context's API request object, so the page receives the same session cookie
> without repeating UI login. My managed-profile fixture depends on an
> authenticated API client, creates unique data before `await use`, gives the
> record to the test, and deletes it after the test even if an assertion fails.
>
> The configuration separates API tests from Chromium, Firefox, and WebKit
> projects so service tests are not repeated unnecessarily. GitHub Actions runs
> fast Chromium smoke tests on pull requests, sharded regression on a schedule,
> and a protected release gate with retained reports and traces. I avoid a giant
> base class because small composable objects and explicit fixture dependencies
> are easier to test, parallelize, and maintain.

# 13. Whiteboard sequence

When asked to draw the architecture, draw in this order:

```text
GitHub Actions
      |
playwright.config.ts
      |
tests
  |--------|-----------|
pages   fixtures    API clients
           |
      data builders
           |
   environment config
```

Then explain one dependency chain:

```text
test
  `-- managedProfile
      `-- profileClient
          `-- subscriberRequest
              `-- subscriberCredentials
```

Finish with lifecycle and outcomes:

```text
setup -> use -> teardown
isolation -> parallelism -> reliable CI gate
```
