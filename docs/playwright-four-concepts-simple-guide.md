# Four Playwright Concepts: Simple Implementation Guide

This guide connects four framework concepts to the working examples in this
repository.

## 1. Reusable authentication state

Files:

- `playwright/tests/storage-state/auth.setup.ts`
- `playwright/playwright.storage.config.ts`
- `playwright/tests/storage-state/authentication.spec.ts`

The setup test logs in once and saves cookies and local storage to
`.auth/user.json`. The Chromium project depends on setup and loads that file
before each test.

```text
setup login -> .auth/user.json -> authenticated Chromium tests
```

The first test opens `/browse` without entering credentials. The fresh-login
test overrides storage state with empty cookies and origins, so it must log in
through the UI.

Run it from `playwright/`:

```bash
npm run test:storage-auth
```

Use saved authentication when login is only a prerequisite. Use a fresh
session when login itself is the behavior under test.

## 2. Clean page object

Files:

- `playwright/pages/sign-in.page.ts`
- `playwright/pages/browse.page.ts`

A page object receives Playwright's `page` and exposes actions in application
language:

```ts
const signInPage = new SignInPage(page);
await signInPage.signInAsSubscriber(credentials);
```

The test says what the user does. The page object contains how the page is
operated. Keep assertions that prove the page loaded inside the page object,
but keep scenario-specific business assertions visible in the test.

Create a page object when selectors or behavior are reused. Do not create one
for a page that appears in only one simple test.

## 3. GitHub Actions workflow

Files:

- `.github/workflows/pr-smoke.yml`
- `.github/workflows/nightly-regression.yml`
- `.github/workflows/release-gate.yml`

The pull-request workflow performs this sequence:

```text
checkout -> start app -> install tests -> wait for readiness
         -> type-check -> run smoke tests -> upload evidence
```

GitHub Actions supplies `CI=true`. URLs can be stored as GitHub Actions
variables, while usernames, passwords and tokens should be stored as GitHub
Actions secrets. The release workflow demonstrates passing both into the test
process through `env`.

## 4. Sharding

File:

- `.github/workflows/nightly-regression.yml`

The matrix creates four independent GitHub jobs:

```yaml
matrix:
  shardIndex: [1, 2, 3, 4]
  shardTotal: [4]
```

Each job runs one portion:

```bash
npx playwright test tests/architecture --shard=1/4
npx playwright test tests/architecture --shard=2/4
npx playwright test tests/architecture --shard=3/4
npx playwright test tests/architecture --shard=4/4
```

All shards run at the same time. Each produces a blob report. The
`merge-reports` job waits for all shards, downloads their reports and creates
one HTML report.

Sharding reduces total regression duration. It does not make one individual
test execute faster.

## Interview summary

> I save authentication state when login is a prerequisite and use an empty
> storage state when testing login itself. Page objects hold reusable page
> interactions, while tests keep the business intent visible. GitHub Actions
> runs smoke tests on pull requests and regression tests on a schedule. For a
> larger regression suite, a matrix starts multiple Playwright shards in
> parallel and a final job merges their reports.
