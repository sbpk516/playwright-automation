# StreamForge Quality Strategy

**Status:** Draft for brainstorming  
**Version:** 0.1  
**Scope:** StreamForge MVP quality objectives and verification boundaries  
**Inputs:** Product requirements, system design, ADRs, and MVP epics

## 1. Purpose

This strategy defines what quality means for StreamForge, which risks deserve the earliest and strongest verification, and how responsibilities should be divided across test levels and tools. It intentionally does not define the Playwright framework structure, fixtures, naming conventions, or Concourse implementation.

## 2. Quality Objectives

1. Protect the subscriber journeys that make the application usable: sign-in, discovery, watchlist, profile selection, plan change, and playback.
2. Prove that authentication, role authorization, ownership, maturity limits, and plan entitlements are enforced by FastAPI rather than only by the UI.
3. Keep test results deterministic across local execution, parallel workers, and CI.
4. Detect failures at the lowest useful test level while retaining browser coverage for real user journeys.
5. Provide failure evidence that makes a failed CI run diagnosable without immediate reruns.
6. Verify WCAG 2.2 AA expectations for critical workflows using automated and documented manual checks.
7. Give fast deployment confidence through a deliberately small sanity suite.
8. Maintain traceability from product risks and requirements to verification evidence.

## 3. Quality Principles

- Test observable behavior and public contracts, not implementation details.
- Use the lowest test level that can reliably expose the target risk.
- Reserve browser tests for behavior that requires a browser or validates a complete user journey.
- Verify authorization, ownership, validation, and state transitions directly at the API boundary.
- Build deterministic state through supported seed and test-support interfaces.
- Never make tests depend on execution order or shared mutable accounts.
- Use semantic roles and accessible names before test-specific selectors.
- Treat retries as diagnostic information, not as a substitute for fixing instability.
- A test failure must explain what behavior failed and preserve relevant evidence.
- Coverage is based on product risk and requirements, not test count.

## 4. Quality Risk Assessment

Scores use a 1-5 scale. Risk exposure is `likelihood × impact`.

| ID | Quality risk | Likelihood | Impact | Exposure | Primary verification |
|---|---|---:|---:|---:|---|
| QR-01 | A subscriber or visitor reaches administrator operations | 3 | 5 | 15 | API authorization plus one UI route check |
| QR-02 | One subscriber reads or changes another subscriber's data | 3 | 5 | 15 | API ownership and isolation tests |
| QR-03 | Plan or maturity rules permit unauthorized playback | 4 | 5 | 20 | API decision matrix plus critical UI journeys |
| QR-04 | Session state is lost, retained after sign-out, or handled incorrectly after expiration | 4 | 4 | 16 | API session tests and browser lifecycle journeys |
| QR-05 | Search, filters, sorting, counts, or URL restoration return incorrect catalog results | 4 | 3 | 12 | API combinations plus focused browser coverage |
| QR-06 | Watchlist changes duplicate, disappear, or leak between accounts | 3 | 4 | 12 | API idempotency, persistence, concurrency, and UI state |
| QR-07 | Parallel tests corrupt shared mutable state | 4 | 4 | 16 | Isolation contract and parallel execution checks |
| QR-08 | Seed reset or readiness behavior makes CI nondeterministic | 4 | 4 | 16 | Test-support API and startup checks |
| QR-09 | Controlled dependency failures leave the UI unusable or unrecoverable | 3 | 4 | 12 | Fault injection and browser retry journey |
| QR-10 | Keyboard or assistive-technology users cannot complete critical workflows | 3 | 5 | 15 | axe, keyboard tests, and manual screen-reader review |
| QR-11 | Browser-specific behavior breaks a critical customer journey | 3 | 4 | 12 | Targeted Chromium, Firefox, and WebKit execution |
| QR-12 | Catalog administration publishes invalid or unintended content state | 3 | 4 | 12 | API validation/state tests and one admin UI journey |
| QR-13 | API contract changes silently break the Next.js client | 3 | 4 | 12 | OpenAPI schema and representative contract checks |
| QR-14 | Failures cannot be diagnosed from CI evidence | 3 | 4 | 12 | Deliberate-failure artifact verification |
| QR-15 | API latency or error rate exceeds the portfolio reference targets | 2 | 3 | 6 | K6, outside Playwright ownership |
| QR-16 | Secrets or session identifiers appear in logs or reports | 2 | 5 | 10 | Security checks and artifact inspection |

### Initial risk priorities

- **Critical (17-25):** QR-03
- **High (15-16):** QR-01, QR-02, QR-04, QR-07, QR-08, QR-10
- **Medium (10-14):** QR-05, QR-06, QR-09, QR-11, QR-12, QR-13, QR-14, QR-16
- **Lower (1-9):** QR-15, while still required by the product performance targets

Priority is derived from exposure rather than assigned independently. Ratings must be reviewed when the application, deployment model, or defect history changes.

## 5. Test Levels

### 5.1 Backend unit tests

**Purpose:** Verify isolated entitlement, maturity, normalization, and decision logic quickly.

**Best candidates:**

- Playback authorization decision rules.
- Catalog query normalization and deterministic ordering.
- Profile-name normalization.
- Session expiration calculations.

**Tool owner:** Python test tooling, not Playwright.

### 5.2 Frontend component tests

**Purpose:** Verify complex isolated UI behavior only when browser journeys would be slower or less precise.

**Best candidates:**

- Player control state if it becomes sufficiently complex.
- Catalog-filter state serialization.

**Tool owner:** A component-test tool only if a demonstrated need appears. It is not an automatic MVP dependency.

### 5.3 API integration tests

**Purpose:** Verify FastAPI routes, SQLite persistence, schemas, authorization, ownership, and state transitions through the public HTTP boundary.

**Best candidates:**

- Authentication and session semantics.
- Role and ownership enforcement.
- Search, filter, sort, and result-count combinations.
- Watchlist idempotency and isolation.
- Profile constraints.
- Immediate plan changes and playback authorization.
- Administrator validation and publication behavior.
- Reset, readiness, and fault-control contracts.

**Tool owner:** Playwright API testing is a candidate because it can share configuration, authentication setup, reporting, and CI artifacts with browser tests. This choice remains subject to an ADR.

### 5.4 Browser journey tests

**Purpose:** Verify that a real user can complete critical workflows through Next.js and FastAPI together.

**Best candidates:**

- Sign-in, refresh persistence, and sign-out.
- Catalog discovery with URL restoration.
- Watchlist state visible across customer surfaces.
- Profile selection and maturity-denied playback.
- Plan upgrade followed by successful playback.
- Administrator publication reflected in the subscriber catalog.
- Accessible recovery from a simulated catalog failure.
- Keyboard operation of player controls.

**Tool owner:** Playwright.

### 5.5 Automated accessibility checks

**Purpose:** Detect machine-identifiable accessibility violations and verify important keyboard behavior.

**Coverage:**

- Automated axe scans of critical pages and states.
- Keyboard navigation, focus visibility, dialog focus management, and player control state.
- Accessible names and live status/error feedback.

**Tool owner:** Playwright with axe for automation; humans for screen-reader and usability judgment.

### 5.6 Contract tests

**Purpose:** Detect incompatible changes between the Next.js consumer and FastAPI provider.

**MVP:** OpenAPI schema validation and representative response-contract checks.

**Post-MVP:** Complete Pact consumer and provider verification workflow.

### 5.7 Performance tests

**Purpose:** Verify API latency, throughput, error rate, and defined thresholds.

**Tool owner:** K6. Playwright may measure whether the primary page becomes usable within the documented limit, but it does not own load generation.

### 5.8 Manual exploratory and accessibility testing

**Purpose:** Examine behavior that depends on human judgment, assistive technology, visual clarity, or unexpected interaction sequences.

**Best candidates:**

- Screen-reader workflows.
- Visual hierarchy, responsive usability, and message clarity.
- Exploratory session around entitlements and failure recovery.
- Browser and operating-system media behavior.

## 6. Playwright Scope

### Playwright should test

- Critical user journeys across the Next.js and FastAPI boundary.
- Public HTTP API behavior where end-to-end persistence and authorization matter.
- Cookie/session behavior in a real browser.
- Supported Chromium, Firefox, and WebKit workflows.
- Mobile, tablet, and desktop responsive behavior for critical paths.
- Browser-visible loading, success, empty, error, and recovery states.
- Keyboard navigation, focus behavior, semantic locators, and automated axe checks.
- Deep links and URL-restorable catalog state.
- Test-support behavior needed for deterministic setup and fault injection.
- Failure artifact production: traces, screenshots, video, network details, and correlation IDs.

### Playwright should not test

- Private Python functions or isolated business-rule branches that unit tests can cover directly.
- Framework internals belonging to Next.js, FastAPI, SQLite, or browsers.
- Every data combination through the browser when API tests cover the same rule more precisely.
- CSS implementation details, exact DOM nesting, or internal React state.
- Pixel-perfect appearance unless a separately approved visual-regression strategy is introduced.
- API load, stress, soak, or capacity behavior; K6 owns these concerns.
- Dependency vulnerabilities; dependency-scanning tools own them.
- Full penetration testing or static code analysis.
- Screen-reader usability judgment that requires a human reviewer.
- Real payment, DRM, adaptive streaming, email, external identity, or other product non-goals.

## 7. Initial Automation Scope

### MVP in scope

- Positive sanity journeys as the first automation milestone.
- Critical positive and negative API coverage.
- Positive, normal-user browser journeys in Playwright's bundled Chromium.
- Automated accessibility checks on critical pages.
- Deterministic test data and authentication setup.
- Failure diagnostics and requirement traceability.

### Deferred until justified

- Firefox, WebKit, and branded Google Chrome projects.
- Full browser coverage of every API validation rule.
- Broad visual-regression baselines.
- Component testing infrastructure.
- Pact consumer/provider verification.
- Large device and browser-version matrices.
- Production monitoring and synthetic tests.
- Automated manual screen-reader replacement.

## 8. Sanity Suite Boundary

The sanity suite is the first implementation priority. It should follow positive, common-sense user behavior and answer one question: **Is this deployment healthy enough for deeper testing or demonstration?**

Candidate coverage:

1. Readiness succeeds.
2. A seeded subscriber signs in.
3. The catalog loads and a known title opens.
4. An entitled title reaches the player.
5. A watchlist item can be added and removed.
6. An administrator can authenticate and reach catalog administration.

The final suite should target approximately five minutes or less, avoid exhaustive combinations, run initially in Chromium, and leave the seeded baseline unchanged. Exact tests will be selected in the later sanity-suite design document.

## 9. Environment Boundaries

| Environment | Intended quality use |
|---|---|
| Local | Development, focused debugging, headed execution, and exploratory testing |
| Test | Deterministic functional execution with isolated mutable data and fault controls |
| CI | Headless reproducible suites, retained failure evidence, and parallel workers |
| Production-like | Security/configuration verification with test-support capabilities disabled |

Automation must use configured base URLs and must not assume local ports. Personal credentials and external services are prohibited.

## 10. Entry and Exit Expectations

### Entry expectations

- Target environment readiness is true.
- Required migrations and seed data are present.
- The selected test-support capability is enabled only where appropriate.
- Test accounts or isolated worker state are available.
- The deployed application version is identifiable.

### MVP quality exit expectations

- All agreed sanity checks pass without retries hiding failures.
- All twelve product acceptance scenarios have required evidence.
- Critical workflows pass in supported browsers according to the approved execution matrix.
- No serious or critical automated accessibility violations remain on critical pages.
- No unresolved critical or high product risks lack an accepted treatment.
- Performance, security, and dependency gates meet their separately owned thresholds.
- Requirement-to-test/manual-check traceability is current.

## 11. Measures That Matter

- Sanity pass rate and duration.
- First-attempt pass rate, reported separately from retry-assisted results.
- Defects found by risk and escaped defects by affected workflow.
- Failure causes classified as product, test, environment, or infrastructure.
- Time required to diagnose a failed CI run from retained evidence.
- Critical-requirement and quality-risk coverage.
- Accessibility violations by impact and recurrence.
- Quarantined tests, age of quarantine, and owner.

Raw test count and code coverage alone are not quality-success measures.

## 12. Decisions from Brainstorming Session 1

**Date:** 2026-07-21

1. Risk priority is derived from likelihood multiplied by impact using the documented exposure bands.
2. Initial browser automation will model positive, common-sense, normal-user journeys.
3. The sanity suite is the first implementation priority.
4. Initial browser execution will use Playwright's bundled Chromium only.
5. Firefox, WebKit, and branded Google Chrome coverage are deferred until the Chromium sanity foundation is stable.
6. Quality gates and Concourse blocking behavior will be decided later.

Positive journeys are the starting scope, not the final quality ceiling. Negative authorization, ownership, validation, and entitlement risks remain required later and should usually be verified through the API rather than duplicated through every browser journey.

### Chromium and Google Chrome

Chromium and Google Chrome share the Chromium browser engine but are not identical products. Playwright installs and manages an open-source Chromium build by default. Google Chrome is a separately installed branded browser and is selected with the `chrome` channel. Bundled Chromium is the initial choice because it is reproducible locally and in CI and is the default recommended by Playwright for most testing. Branded Chrome can be added later if stable-channel behavior or licensed media-codec coverage becomes a requirement.

## 13. Remaining Brainstorming Questions

1. Should Playwright own all API integration tests, or should Python API tests cover most routes while Playwright owns only cross-layer API setup and verification?
2. Which exact five or six positive journeys provide the strongest sanity signal without overlapping later regression coverage?
3. At what maturity point should Firefox, WebKit, or branded Chrome be reconsidered?
4. Should visual regression be excluded entirely from MVP or introduced for one stable public page?
5. What is the acceptable sanity execution time before Concourse design begins?
6. What retry policy demonstrates reliability without concealing flaky tests?
7. Which manual accessibility checks should be required before declaring the portfolio MVP complete?
8. Which accessibility findings should eventually block CI when quality gates are designed?
9. Which evidence and metrics will be most valuable to explain in an interview?

## 14. Approval Criteria

This strategy is ready for approval when:

- Quality objectives reflect the intended portfolio story.
- Risk ratings and owners are agreed.
- Test-level boundaries have no important gaps or unnecessary duplication.
- Playwright responsibilities and exclusions are explicit.
- Initial and deferred automation scope is accepted.
- The sanity-suite purpose and time budget are agreed.
- Open questions that materially change architecture have recorded answers.

After approval, the next document will define the Playwright automation architecture and its ADR candidates.
