# QA Automation and Concourse Interview Guide

## 1. Role-Focused Introduction

### Tell me about yourself

I am a QA Automation Engineer with more than four years of experience building and maintaining browser automation using Selenium, Playwright and Cypress. My focus is creating reliable regression suites that provide fast production-readiness feedback. I have integrated automated tests into CI/CD pipelines, worked with Java and Python services, tested APIs and user interfaces, and used failure evidence such as logs, traces, screenshots and videos to diagnose defects. In one example, CI/CD integration reduced regression execution time by approximately 60 percent.

### How does your experience match this role?

- Playwright experience for end-to-end browser testing.
- Selenium and Cypress experience that provides a broad automation background.
- Regression-suite ownership and production-readiness assessment.
- CI/CD integration and failure investigation.
- Git and GitHub workflow experience.
- API testing and understanding of frontend-to-backend integration.
- Experience distinguishing application defects, automation defects and environment defects.

## 2. StreamForge Project Summary

### Explain the project

StreamForge is a portfolio streaming application built with a Next.js frontend and FastAPI backend. I created a Playwright sanity suite covering six critical journeys:

1. Public landing page.
2. Subscriber sign-in.
3. Catalog discovery and title details.
4. Watchlist addition and removal.
5. Plan upgrade and simulated playback.
6. Administrator catalog access.

The application and tests are integrated with a local Concourse pipeline. Concourse retrieves a versioned Git commit, creates a clean Linux task container from a pinned Playwright image, starts FastAPI and Next.js, waits for readiness and executes the Chromium sanity suite. The task retains Playwright reports, traces, screenshots, videos and application logs.

### Why did you start with sanity tests?

Sanity tests provide a fast answer to whether a deployment is healthy enough for deeper testing. I selected positive, common user journeys that cross the frontend, backend, database and authentication boundaries. Exhaustive negative, accessibility, cross-browser and performance testing belongs in separate suites.

### Why Chromium first?

Chromium provides fast initial feedback and covers the approved portfolio scope. Firefox, WebKit and branded Chrome can be added after the core suite is stable and the business establishes cross-browser requirements.

## 3. Concourse Fundamentals

### What is Concourse?

Concourse is a container-based CI/CD platform. Pipelines are declared in YAML using resources, jobs, plans and tasks. Resources represent versioned external state, while workers execute tasks in clean containers.

### What are the main Concourse components?

- Web node: API, UI, authentication and scheduling.
- Worker: creates containers and executes tasks.
- PostgreSQL: stores pipelines, jobs, builds, resource versions and build events.
- `fly`: command-line client used to configure and operate Concourse.

### What is a pipeline?

A pipeline is a declarative definition of resources and jobs.

```text
Pipeline: streamforge
  Resource: source
  Job: playwright-sanity
```

### What is a resource?

A resource is versioned external state that Concourse can check, retrieve or publish.

Examples:

- Git resource: commit SHA.
- Registry-image resource: image tag and digest.
- Time resource: timestamp.
- S3 resource: object version.

### What is a resource version?

A resource version identifies an exact state of a resource. For Git, the version is a commit SHA. Concourse uses resource versions to make builds traceable and to decide whether new work should be scheduled.

### What is a job?

A job is a reusable CI workflow containing a build plan.

Examples:

- Playwright sanity.
- Playwright regression.
- API tests.
- Performance tests.
- Deployment.

### What is a plan?

A plan is the ordered set of steps in a job.

```yaml
plan:
  - get: source
  - task: run-playwright-sanity
```

### What is a task?

A task is the smallest executable unit in Concourse. It runs commands in a clean container using declared inputs and outputs.

A task configuration normally defines:

- Platform.
- Container image.
- Inputs.
- Outputs.
- Parameters.
- Command.

### What is a build?

A build is one execution of a job. The job is the reusable definition; build `1` is one attempt to execute it.

### What does `get: source` do?

It selects an eligible version of the Git resource and downloads it as an artifact named `source`.

### What does `trigger: false` mean?

New versions of the resource do not automatically schedule the job. The job can still be started manually.

### What does `trigger: true` mean?

When Concourse discovers a new eligible resource version, it may automatically schedule the job.

### What is the difference between the main commands?

```text
set-pipeline
  Creates or updates the pipeline definition.

unpause-pipeline
  Enables the configured pipeline.

trigger-job
  Starts one build of a specific job.

watch
  Streams the output of a build.
```

### Why use a separate task YAML?

- Keeps `pipeline.yml` readable.
- Allows task reuse.
- Separates orchestration from execution.
- Allows independent execution with `fly execute`.

A small task may also be written inline in `pipeline.yml`.

### Why use a shell script?

The task YAML defines where the task runs. The shell script defines what it does.

The StreamForge script:

1. Creates a Python virtual environment.
2. Installs FastAPI and Uvicorn.
3. Installs and builds Next.js.
4. Installs Playwright dependencies.
5. Starts FastAPI and Next.js.
6. Waits for both services.
7. Runs Chromium sanity tests.
8. Copies reports and logs.
9. Returns the Playwright exit code.

## 4. Explain the StreamForge Concourse Design

### Why start StreamForge inside the task?

Inside a Concourse task, `localhost` refers to the task container, not a developer laptop. Starting FastAPI, Next.js and Playwright inside the same task makes the execution isolated and reproducible.

### Why use a custom Playwright image?

The Microsoft Playwright image contains Node.js, Chromium, browser binaries and operating-system dependencies. StreamForge also needs Python for FastAPI, so the derived image adds Python, virtual-environment support and curl.

### Why must Playwright versions match?

The `@playwright/test` package and Playwright Docker image should use the same version. A mismatch can cause Playwright to search for a browser revision that is not installed in the container.

### What does `image_resource` do?

It identifies the container image used as the task's filesystem and runtime environment.

```yaml
image_resource:
  type: registry-image
  source:
    repository: sbpk516/streamforge-playwright
    tag: "1.61.1"
```

### What are task inputs and outputs?

An input is an artifact provided to the task:

```yaml
inputs:
  - name: source
```

An output is a directory that can be passed to later build steps:

```yaml
outputs:
  - name: artifacts
```

Outputs are temporary unless a later `put` step publishes them to durable storage.

### How does the task report success or failure?

The shell script preserves the Playwright exit status:

```bash
set +e
npx playwright test tests/ui/sanity --project=chromium
test_status=$?
set -e

exit "$test_status"
```

Exit code `0` succeeds. A non-zero exit code fails the task and build.

### Why poll readiness instead of using a fixed sleep?

A fixed sleep may be too short on a slow worker and waste time on a fast worker. A bounded readiness loop waits until the applications are actually available and fails after a defined limit.

### Why run the sanity suite with one Playwright worker?

The tests share a resettable SQLite baseline. Serial execution prevents one mutating test from resetting the database while another test is using it. Parallel execution should be introduced only after test data is isolated per worker.

## 5. Critical Scenario: Pipeline Never Finishes and Does Not Fail

### Sample interview question

> A pipeline has started, but it never stops and it does not report a failure. How would you investigate and fix it?

### Short interview answer

I first determine whether the build is pending or genuinely running. If it is pending, I inspect resource versions, worker availability, pause state, `passed` constraints and concurrency limits. If it is running, I identify the active step through the CI UI and logs, then inspect or intercept the task container. Common causes are an unbounded readiness loop, a foreground server process, a command waiting for user input, a network request with no timeout, or a test process whose exit status is swallowed. I abort the stuck build for containment, preserve available evidence, reproduce the issue and add bounded timeouts and correct failure propagation. At the pipeline level I add a task timeout; at the script level I use `set -euo pipefail`, bounded service checks and an explicit final exit code.

### Step 1: Determine the actual state

```powershell
fly --print-table-headers -t local builds
```

Possible states:

```text
pending
started
succeeded
failed
aborted
errored
```

`pending` means the build plan has not started executing. `started` means at least one step is executing.

### Step 2: If the build is pending

Check:

```powershell
fly -t local pipelines
fly -t local jobs -p streamforge
fly -t local resources -p streamforge
fly -t local resource-versions -r streamforge/source
fly -t local workers
fly -t local containers
```

Common pending causes:

- Pipeline is paused.
- Job is paused.
- No eligible resource version.
- Resource version is disabled.
- Resource check is failing.
- No worker matches the platform or tags.
- `max_in_flight` has been reached.
- A `passed` constraint cannot be satisfied.

### Step 3: If the build is started

Watch the step:

```powershell
fly -t local watch -j streamforge/playwright-sanity -b 1
```

List active containers:

```powershell
fly -t local containers
```

When an interceptable task container exists:

```powershell
fly -t local intercept -j streamforge/playwright-sanity -s run-playwright-sanity
```

Inside the container, inspect:

```text
Running processes
Application logs
Network connectivity
Readiness endpoints
Available disk and memory
Environment variables without exposing secrets
```

### Common reasons a running task hangs

#### Unbounded readiness loop

Bad:

```bash
until curl http://127.0.0.1:8000/health/ready; do
  sleep 1
done
```

This may run forever.

Better:

```bash
for attempt in $(seq 1 60); do
  if curl --fail --silent http://127.0.0.1:8000/health/ready >/dev/null; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    exit 1
  fi

  sleep 1
done
```

#### Server started in the foreground

Bad:

```bash
uvicorn app.main:app
npx playwright test
```

Playwright is never reached because Uvicorn remains in the foreground.

Correct:

```bash
uvicorn app.main:app &
npx playwright test
```

#### Interactive command

A package manager, login command or confirmation prompt may wait forever for user input. CI commands should use non-interactive modes and preconfigured credentials.

#### Network operation without a timeout

Git, npm, pip, curl or application requests may wait on an unavailable external dependency. Add bounded command, step or job timeouts where appropriate.

#### Playwright waiting on an application state

Check:

- Navigation timeout.
- Assertion timeout.
- Test timeout.
- A locator waiting for an element that never appears.
- A dialog that was not accepted.
- A download or popup that was never handled.

### Why a failed test may incorrectly produce a successful pipeline

#### Exit code swallowed

Bad:

```bash
npx playwright test || true
```

`|| true` converts failure into success.

#### Failure captured but never returned

Bad:

```bash
set +e
npx playwright test
test_status=$?
set -e
```

The script can reach the end with a successful later command.

Correct:

```bash
set +e
npx playwright test
test_status=$?
set -e

exit "$test_status"
```

#### Pipeline output hides the real exit code

Potentially incorrect:

```bash
npx playwright test | tee test.log
```

Without `pipefail`, the shell may return `tee`'s success instead of Playwright's failure.

Use:

```bash
set -o pipefail
npx playwright test | tee test.log
```

#### CI configured to ignore failure

Investigate settings such as:

- `try` steps.
- `continue-on-error` in GitHub Actions.
- `|| true`.
- Failure hooks that accidentally replace the original result.
- Retries that hide persistent instability.

### Add a Concourse task timeout

```yaml
- task: run-playwright-sanity
  file: source/ci/tasks/playwright-sanity.yml
  timeout: 15m
```

This prevents the task from running forever. The timeout should be comfortably higher than the normal suite duration.

### Add Playwright timeouts

```typescript
export default defineConfig({
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
});
```

Use realistic limits based on observed application behavior. Timeouts should detect genuine hangs without masking slow-system defects.

### Immediate containment

Abort a stuck build:

```powershell
fly -t local abort-build -j streamforge/playwright-sanity -b 1
```

Then:

1. Preserve logs and available failure evidence.
2. Identify the last command that produced output.
3. Reproduce the task independently with `fly execute`.
4. Fix the missing timeout or failure propagation.
5. Run the same failing scenario again.
6. Confirm the pipeline now ends with the correct status.

### STAR-style answer

**Situation:** A regression build stayed in the started state and never reported success or failure.

**Task:** Restore CI feedback and prevent deployments from waiting indefinitely.

**Action:** I identified the active task from the build plan, streamed its logs and inspected the task container. The script had an unlimited service-readiness loop, and a test command's exit status was not returned after artifact collection. I aborted the stuck build, added a bounded readiness loop, introduced a task timeout and preserved the Playwright status through the final script exit.

**Result:** The pipeline then failed clearly when the service was unavailable, passed when healthy and always completed within the agreed execution limit.

## 6. Playwright Interview Questions

### Why Playwright?

- Native support for Chromium, Firefox and WebKit.
- Auto-waiting locators and assertions.
- Browser-context isolation.
- Network and API capabilities.
- Trace viewer, screenshots and videos.
- Parallel execution and sharding.
- Strong TypeScript support.

### What locator strategy do you use?

Preferred order:

1. Accessible roles and names.
2. Labels.
3. Visible text.
4. Stable test IDs when semantic locators are insufficient.
5. CSS selectors only when necessary.

Example:

```typescript
page.getByRole('button', { name: 'Sign in' })
```

### Why avoid fixed waits?

Fixed waits are slow and unreliable. Playwright locators and assertions automatically wait for expected conditions.

Bad:

```typescript
await page.waitForTimeout(3000);
```

Better:

```typescript
await expect(page.getByRole('heading', { name: 'Afterlight' })).toBeVisible();
```

### How do you maintain test isolation?

- Each test creates its own browser context.
- Tests do not depend on execution order.
- Mutable state is reset or uniquely generated.
- Authentication may be created through a dedicated setup when appropriate.
- Parallel workers do not share mutable test data.

### How do you investigate flaky tests?

1. Reproduce with the same browser and environment.
2. Inspect traces, screenshots, videos and application logs.
3. Determine whether the cause is application, automation, environment or test data.
4. Remove fixed timing assumptions.
5. Improve locators and state isolation.
6. Fix the cause instead of hiding it with retries.

### How do you test APIs with Playwright?

Playwright's `APIRequestContext` can:

- Prepare test data.
- Authenticate.
- Call public APIs.
- Verify integration workflows.
- Clean up test data.

Playwright should not replace backend unit tests or API performance tools.

### What should Playwright not test?

- Internal function-level logic better covered by unit tests.
- High-volume load and performance.
- Every API field permutation.
- Backend implementation details invisible to users.
- Exhaustive accessibility compliance without dedicated tooling and review.

### How do you organize sanity and regression tests?

- Sanity: fast critical-path deployment signal.
- Regression: broader feature, negative, role and data coverage.
- Tags or directories identify suites.
- CI jobs run the appropriate suite for pull requests, deployments and schedules.

## 7. API and Microservices Questions

### How does the browser interact with StreamForge?

```text
Chromium
  ↓
Next.js
  ↓
FastAPI
  ↓
SQLite
```

The sanity tests validate the integrated user-visible result across these boundaries.

### How do you determine which service caused a failure?

Correlate:

- Browser trace and network response.
- Frontend server logs.
- Backend logs.
- Request path and status code.
- Test data and database state.
- Service readiness.

Do not automatically classify every UI failure as an automation defect.

### What API status codes would you verify?

- `200`: successful read.
- `201`: successful creation.
- `204`: successful action without response body.
- `400`: invalid request.
- `401`: unauthenticated.
- `403`: authenticated but unauthorized.
- `404`: resource not found.
- `409`: state or concurrency conflict.
- `500`: unexpected server failure.
- `503`: service unavailable.

### How do you test microservices integration?

- Verify service contracts.
- Test critical cross-service workflows.
- Control or seed dependent data.
- Use correlation identifiers and logs.
- Separate contract, integration and end-to-end responsibilities.
- Avoid making every edge case an expensive browser test.

## 8. GitHub and CI/CD Questions

### How would you integrate Playwright with GitHub?

Create a GitHub Actions workflow that:

1. Checks out the repository.
2. Sets up the runtime.
3. Installs exact dependencies.
4. Installs or uses pinned Playwright browsers.
5. Starts the application or targets a test environment.
6. Waits for readiness.
7. Runs Playwright.
8. Uploads reports and traces.
9. Returns the test exit code.

### How do you prevent failing code from reaching production?

- Required pull-request checks.
- Protected branches.
- Fast sanity checks on pull requests.
- Regression checks before deployment.
- Quality gates tied to the same commit.
- No deployment step when required checks fail.
- Clear ownership and triage of failures.

### How do you manage tests natively in GitHub?

- Test code and plans are version controlled.
- Pull requests show automation changes with application changes.
- Issues can track missing coverage and defects.
- Actions checks report pass or failure on commits.
- Reports and traces are uploaded as workflow artifacts.
- Branch protection requires agreed checks before merge.

### What is the GitHub Actions equivalent of a task timeout?

```yaml
jobs:
  playwright:
    timeout-minutes: 20
```

Avoid `continue-on-error: true` for required production-readiness tests.

### How do you handle secrets in GitHub?

Use:

- GitHub Actions secrets.
- Environment secrets.
- OpenID Connect for cloud access where possible.

Do not place credentials directly in workflow YAML or source control.

## 9. Regression and Production-Readiness Questions

### How do you choose regression coverage?

Prioritize:

- High-business-impact journeys.
- Frequently used functionality.
- Historically defect-prone areas.
- Complex integrations.
- Authorization and data boundaries.
- Features affected by the current change.

### How do you decide whether a build is production ready?

Consider:

- Required automated suites passed.
- No unresolved critical defects.
- Environment was representative and healthy.
- Test data was deterministic.
- Failure evidence was reviewed.
- Performance, security and accessibility requirements were satisfied by their respective checks.

### How would you reduce regression time?

- Separate sanity from full regression.
- Run independent suites in parallel.
- Use API setup instead of slow UI setup where appropriate.
- Remove redundant tests.
- Reuse authenticated state carefully.
- Shard large Playwright suites.
- Run change-focused tests earlier while retaining scheduled full regression.

Parallel execution must not introduce shared-state conflicts.

## 10. Useful Concourse Commands

```powershell
fly -t local status
fly -t local workers
fly -t local pipelines
fly -t local jobs -p streamforge
fly -t local resources -p streamforge
fly -t local resource-versions -r streamforge/source
fly -t local builds
fly -t local containers
fly -t local trigger-job -j streamforge/playwright-sanity --watch
fly -t local watch -j streamforge/playwright-sanity -b 1
fly -t local abort-build -j streamforge/playwright-sanity -b 1
```

## 11. Final Answers to Memorize

### Concourse in one sentence

Concourse is a resource-driven CI/CD platform where versioned inputs flow through jobs and each task runs in an isolated container.

### Playwright in one sentence

Playwright is an end-to-end automation framework with reliable auto-waiting, browser-context isolation, cross-browser support and strong debugging evidence.

### Quality strategy in one sentence

I use a small sanity suite for fast deployment confidence, a broader regression suite for release confidence and lower-level API and unit tests for detailed logic coverage.

### Pipeline troubleshooting in one sentence

I first identify whether the build is pending or running, locate the blocked step, inspect resource and worker state or task logs, preserve evidence, apply bounded timeouts and ensure the real command exit code reaches the CI system.

## 12. References

- [Concourse documentation](https://concourse-ci.org/docs/)
- [Concourse tasks](https://concourse-ci.org/docs/tasks/)
- [Concourse resources](https://concourse-ci.org/docs/resources/)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [GitHub Actions documentation](https://docs.github.com/actions)
