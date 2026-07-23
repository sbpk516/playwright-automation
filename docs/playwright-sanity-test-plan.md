# StreamForge Playwright Sanity Test Plan

**Status:** Draft for review  
**Version:** 0.1  
**Browser:** Playwright bundled Chromium  
**Test type:** Positive UI journey tests  
**Target duration:** Five minutes or less

## 1. Purpose

The sanity suite provides a fast answer to one question:

> Is this StreamForge deployment healthy enough for deeper testing or a product demonstration?

The suite covers a small set of normal user journeys. It is not intended to provide complete regression, negative, security, accessibility, or API coverage.

## 2. Objectives

- Confirm that the public application is reachable.
- Confirm that subscriber authentication works.
- Confirm that the catalog can be searched and opened.
- Confirm that subscriber watchlist state can be changed.
- Confirm that plan entitlement changes affect playback.
- Confirm that administrator authentication and routing work.
- Produce useful failure evidence without making the suite large.

## 3. Scope

### Included

- Playwright UI tests.
- Bundled Chromium with desktop settings.
- Positive, common-sense user journeys.
- Seeded StreamForge accounts and titles.
- Next.js and FastAPI integration through the browser.
- Trace, screenshot, and video retention for failed tests.

### Excluded

- Exhaustive validation and negative scenarios.
- Direct API test coverage.
- Firefox, WebKit, and branded Google Chrome.
- Mobile and tablet projects.
- Visual regression.
- Performance and load testing.
- Concourse configuration and quality gates.
- Full accessibility audits.

## 4. Environment

### Local URLs

| Service | URL |
|---|---|
| StreamForge web application | `http://localhost:3000` |
| FastAPI service | `http://localhost:8000` |
| API readiness | `http://localhost:8000/health/ready` |

The configured `BASE_URL` replaces the local web URL in other environments.

### Required application state

- FastAPI is running and readiness returns `ready`.
- Next.js is running and returns HTTP 200.
- The deterministic seed dataset exists.
- Test-support reset is available in the local test environment.
- No production or personal accounts are used.

## 5. Seeded Test Data

### Subscriber

| Field | Value |
|---|---|
| Email | `river@streamforge.test` |
| Password | `stream123` |
| Baseline plan | Spark |
| Active profile | River |

### Administrator

| Field | Value |
|---|---|
| Email | `admin@streamforge.test` |
| Password | `admin123` |
| Role | Administrator |

### Stable titles

The selected titles must be confirmed against the final seed baseline before implementation. Each test must use a stable title ID rather than relying on its position in the catalog.

| Purpose | Required title state |
|---|---|
| Catalog discovery | Published and searchable by a unique name |
| Watchlist | Published, available, and absent from River's baseline watchlist |
| Playback | Published, available, maturity-allowed, and Nova tier |

## 6. Execution Rules

- Tests may run independently and in any order.
- A test must not depend on state created by another test.
- The seeded baseline is restored before the suite or isolated state is created for each test.
- Tests use semantic roles, labels, and accessible names before `data-testid`.
- Tests do not use fixed sleeps.
- Assertions verify user-visible outcomes rather than internal implementation state.
- Every mutation is reversed or removed through deterministic reset.
- A sanity failure is reported directly; retries are not enabled locally.

## 7. Sanity Test Inventory

| ID | Journey | Primary signal |
|---|---|---|
| SAN-01 | Public landing page loads | Web application availability |
| SAN-02 | Subscriber signs in | Authentication and protected navigation |
| SAN-03 | Subscriber finds and opens a title | Catalog and detail integration |
| SAN-04 | Subscriber adds and removes a watchlist title | Persistent subscriber mutation |
| SAN-05 | Subscriber changes to Nova and starts playback | Plan, entitlement, and player integration |
| SAN-06 | Administrator opens catalog administration | Administrator authentication and routing |

## 8. Detailed Test Cases

### SAN-01: Public landing page loads

**Purpose:** Confirm that StreamForge is reachable and the main public content is rendered.

**Preconditions:**

- Next.js is running.
- No authenticated session is required.

**Steps:**

1. Open `/`.
2. Observe the public landing page.

**Expected results:**

- The page title identifies StreamForge.
- The StreamForge brand is visible.
- The primary heading is visible.
- A Sign in action is visible and enabled.
- Spark, Flare, and Nova plans are visible.
- Pricing is identified as fictional or demonstrative.

**Requirement coverage:** LAND-001, LAND-002, LAND-003

**Cleanup:** None.

**Not verified here:** Plan selection, authentication, responsive breakpoints, and full accessibility compliance.

---

### SAN-02: Subscriber signs in

**Purpose:** Confirm that a seeded subscriber can authenticate and reach the protected catalog.

**Preconditions:**

- The application is ready.
- River's seeded account exists.
- The browser context has no authenticated session.

**Steps:**

1. Open `/sign-in`.
2. Enter River's email.
3. Enter River's password.
4. Select Sign in.

**Expected results:**

- The browser navigates to `/browse`.
- The protected navigation is visible.
- The catalog heading is visible.
- The catalog displays at least one title.
- The Sign out action is visible.

**Requirement coverage:** AUTH-001, AUTH-004, AUTH-007, AC-01

**Cleanup:** Sign out or close the isolated browser context.

**Not verified here:** Invalid credentials, session expiration, rate limiting, or administrator authorization.

---

### SAN-03: Subscriber finds and opens a title

**Purpose:** Confirm that catalog search and title-detail navigation work through the browser.

**Preconditions:**

- River is authenticated.
- The selected discovery title is published and has a unique searchable name.

**Steps:**

1. Open `/browse`.
2. Enter the stable title name in Search.
3. Observe the result count and matching result.
4. Open the matching title.

**Expected results:**

- The catalog shows the active search value.
- The result count is one or another documented deterministic value.
- The expected title is visible.
- The title-detail URL contains its stable ID.
- The detail page shows its name, metadata, synopsis, and available actions.

**Requirement coverage:** CAT-003, CAT-007, CAT-009, DETAIL-001, DETAIL-002, DETAIL-005, AC-03

**Cleanup:** None.

**Not verified here:** Every search combination, filters, sorts, empty results, and invalid title IDs.

---

### SAN-04: Subscriber adds and removes a watchlist title

**Purpose:** Confirm that subscriber-owned watchlist state can be changed and observed across pages.

**Preconditions:**

- River is authenticated.
- The selected watchlist title is published and available.
- The title is absent from River's baseline watchlist.

**Steps:**

1. Open the selected title's detail page.
2. Select Add to my list.
3. Open My list.
4. Confirm that the title is present.
5. Remove the title.

**Expected results:**

- The detail action changes to In my list after addition.
- The title appears on the watchlist page.
- The removal action succeeds.
- The title no longer appears on the watchlist page.
- The suite leaves the watchlist in its baseline state.

**Requirement coverage:** WATCH-001, WATCH-003, WATCH-005

**Cleanup:** The test removes the item it added. Deterministic reset remains the fallback cleanup.

**Not verified here:** Duplicate additions, concurrency, cross-account isolation, and later-session persistence.

---

### SAN-05: Subscriber changes to Nova and starts playback

**Purpose:** Confirm that an immediate plan change updates entitlement and allows simulated playback.

**Preconditions:**

- River is authenticated.
- River is restored to the Spark baseline plan.
- The selected playback title is published, available, Nova-tier, and allowed by River's maturity limit.

**Steps:**

1. Open `/plans`.
2. Choose Nova.
3. Confirm the simulated immediate plan change.
4. Confirm that Nova is displayed as the current plan.
5. Open the selected Nova title.
6. Select Play now.
7. Start playback if it is not already playing.

**Expected results:**

- A success message confirms the Nova plan.
- Nova is shown as the current plan.
- The selected title shows that Nova is required.
- Playback authorization succeeds.
- The player is visible.
- The Play/Pause and Close controls are available.

**Requirement coverage:** PLAN-002, PLAN-003, PLAN-004, PLAY-002, PLAY-003, AC-06

**Cleanup:** Restore River to the Spark plan through deterministic reset.

**Not verified here:** Upgrade denial, unavailable titles, maturity denial, captions behavior, seeking, or playback fault injection.

---

### SAN-06: Administrator opens catalog administration

**Purpose:** Confirm that a seeded administrator can authenticate and reach catalog administration.

**Preconditions:**

- The application is ready.
- The administrator account exists.
- The browser context has no authenticated session.

**Steps:**

1. Open `/sign-in`.
2. enter the administrator email and password.
3. Select Sign in.
4. Observe the administration page.

**Expected results:**

- The browser navigates to `/admin`.
- The Catalog administration heading is visible.
- The seeded catalog record count is visible.
- At least one title record is visible.
- The new-title form is visible.

**Requirement coverage:** AUTH-002, AUTH-004, ADMIN-001, ADMIN-002

**Cleanup:** Sign out or close the isolated browser context.

**Not verified here:** Subscriber denial, title creation, editing, publication changes, or field validation.

## 9. Recommended Implementation Order

1. SAN-01 establishes the smallest working test.
2. SAN-02 establishes form interaction and authenticated navigation.
3. SAN-03 establishes catalog locators and dynamic routes.
4. SAN-04 establishes controlled mutation and cleanup.
5. SAN-05 establishes confirmation handling, entitlement state, and media UI.
6. SAN-06 establishes role-specific authentication and navigation.

Each test should pass reliably before the next test is added.

## 10. Completion Criteria

The first sanity suite is complete when:

- All six cases are implemented and independently executable.
- All six pass in bundled Chromium from a known baseline.
- The complete suite finishes within five minutes locally.
- No test uses fixed waits.
- No test depends on another test's session or data.
- Failed tests retain configured trace, screenshot, and video evidence.
- Test names include their sanity IDs.
- The suite leaves the seeded baseline unchanged.

## 11. Decisions Required Before Implementation

1. Confirm the exact stable title for SAN-03.
2. Confirm the exact stable watchlist title for SAN-04.
3. Confirm the exact stable Nova title for SAN-05.
4. Decide whether reset runs once before the suite or separately before each mutating test.
5. Decide whether authentication is performed through the UI in every sanity case or reused after SAN-02 through a dedicated setup mechanism.

No test code should be written until these five decisions are recorded.
