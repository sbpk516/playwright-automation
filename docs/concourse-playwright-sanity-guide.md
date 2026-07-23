# Running StreamForge Playwright Sanity Tests in Concourse

**Status:** Draft for review  
**Audience:** Someone new to Concourse and Playwright CI  
**Current scope:** Run the existing Chromium sanity tests  
**Not included yet:** Quality gates, pull-request status, scheduled regression, sharding, Firefox, WebKit, or permanent report storage

## 1. Goal

The first Concourse job should do one thing:

> Start StreamForge in a clean Linux container, run the Playwright Chromium sanity tests, preserve failure evidence, and mark the build successful or failed.

The initial execution flow is:

```text
Git repository
      |
      v
Concourse job
      |
      v
Clean task container
      |
      +-- start FastAPI
      +-- build and start Next.js
      +-- wait for readiness
      +-- run Playwright sanity tests
      +-- collect reports, traces, screenshots, and videos
      |
      v
Pass or fail
```

## 2. Why Concourse Cannot Use the Applications Running on Your Laptop

When tests run locally, Playwright reaches:

```text
http://localhost:3000
```

Inside a Concourse task, `localhost` refers to the task container, not your Windows laptop. The FastAPI and Next.js processes running in your PowerShell terminals are therefore unavailable to the task.

For the first self-contained job, the task container will start all three parts:

1. FastAPI on port 8000.
2. Next.js on port 3000.
3. Playwright against `http://127.0.0.1:3000`.

This creates a reproducible test environment and removes dependency on a developer machine.

## 3. Concourse Terms in Plain English

| Term | Plain-English meaning |
|---|---|
| Concourse server | The web UI and scheduler that manages pipelines |
| Worker | The machine that runs task containers |
| Pipeline | The complete YAML description of CI resources and jobs |
| Resource | A versioned external input, such as a Git commit |
| Job | A named workflow shown in the pipeline UI |
| Build | One execution of a job |
| Task | One command executed inside a clean container |
| Input | A directory Concourse gives to a task, such as checked-out source code |
| Output | A directory a task returns for later steps or artifact handling |
| `fly` | The command-line tool used to communicate with Concourse |
| Target | A short local name for a Concourse server, such as `local` |

## 4. Decisions for the First Job

| Concern | Initial decision | Reason |
|---|---|---|
| Job name | `playwright-sanity` | Clearly describes the job |
| Browser | Bundled Chromium | Matches the approved quality strategy |
| Tests | `playwright/tests/ui/sanity` | Runs only the current sanity scope |
| Application | Started inside the task container | Makes the job self-contained |
| Database | Temporary SQLite file | Gives each build isolated state |
| Trigger | Manual first, Git-triggered later | Easier to troubleshoot while learning |
| Retry | None | Prevents unstable tests from appearing reliable |
| Playwright image | Version pinned to the project version | Browser binary and package versions must match |
| Reports | Concourse output named `artifacts` | Keeps failure evidence available to later steps |

The current project uses `@playwright/test` 1.61.1. The corresponding image should therefore be pinned to:

```text
mcr.microsoft.com/playwright:v1.61.1-noble
```

Do not use `latest`. Playwright warns that mismatched package and container-image versions can prevent the browser executable from being found.

## 5. Prerequisites

### 5.1 A running Concourse installation

You need the URL of a Concourse server. A local learning installation commonly runs at:

```text
http://localhost:8080
```

If using local Concourse through Docker Desktop:

1. Start Docker Desktop.
2. Wait until the Docker engine reports that it is running.
3. Start the Concourse Docker Compose environment.
4. Open `http://localhost:8080`.

The official Concourse Quick Start provides its local Docker Compose file and uses `test` / `test` as learning credentials. Production Concourse installations require a proper PostgreSQL, web-node, worker-node, key, TLS, and authentication design; that is outside this first test job.

### 5.2 The `fly` command-line tool

Download `fly.exe` from the Concourse web UI or:

```text
http://localhost:8080/download-fly
```

Confirm it is available:

```powershell
fly --version
```

### 5.3 A Git-hosted repository for a real pipeline

A Concourse Git resource cannot retrieve an uncommitted folder that exists only on your laptop. Before configuring the real pipeline, the application, tests, and CI files must be committed and pushed to a Git repository accessible from the Concourse worker.

For early learning, `fly execute` can upload the current local directory directly. This is useful before configuring the Git resource.

### 5.4 Passing tests locally

From the dedicated Playwright folder:

```powershell
Set-Location .\playwright
npx playwright test .\tests\ui\sanity --project=chromium
```

Do not move a failing local suite into Concourse and expect CI to fix it.

## 6. Proposed Repository Structure

The implementation phase will add:

```text
playwright-quality-architecture/
  ci/
    images/
      streamforge-playwright/
        Dockerfile
    scripts/
      run-playwright-sanity.sh
    tasks/
      playwright-sanity.yml
    pipeline.yml
  apps/
    api/
    web/
  playwright/
    playwright.config.ts
    package.json
    package-lock.json
    tests/
      ui/
        sanity/
  docs/
```

Each file has one responsibility:

| File | Responsibility |
|---|---|
| `Dockerfile` | Defines Node, Python, Playwright, and browser dependencies |
| `run-playwright-sanity.sh` | Starts the app, waits for readiness, runs tests, and copies artifacts |
| `playwright-sanity.yml` | Defines the Concourse task container, input, output, parameters, and command |
| `pipeline.yml` | Connects the Git resource to the sanity task |

No files should be created until this design is reviewed.

## 7. CI Container Image

### Why a project-specific image is needed

The official Playwright image contains Node.js, browser binaries, and browser operating-system dependencies. StreamForge also requires Python for FastAPI.

The proposed image starts with the official Playwright image and adds only Python and virtual-environment support.

Proposed `ci/images/streamforge-playwright/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.61.1-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*
```

### Image lifecycle

For the first experiment, Concourse could build this image. For a stable pipeline, build it once, scan it, push it to an approved registry, and pin the task to a versioned image tag or digest.

Installing Python through `apt-get` during every test build is slower and depends on external package repositories. A prebuilt image is therefore the desired end state.

## 8. Task Execution Script

Proposed `ci/scripts/run-playwright-sanity.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

cd source

python3 -m venv .ci-venv
source .ci-venv/bin/activate
pip install ./apps/api

npm ci
npm run build

cd playwright
npm ci
cd ..

export STREAMFORGE_ENV=test
export STREAMFORGE_DB="$PWD/data/concourse.db"
export WEB_ORIGIN=http://127.0.0.1:3000
export API_URL=http://127.0.0.1:8000

mkdir -p data

uvicorn app.main:app \
  --app-dir apps/api \
  --host 127.0.0.1 \
  --port 8000 \
  > ../artifacts/api.log 2>&1 &

npm --workspace apps/web run start -- \
  --hostname 127.0.0.1 \
  > ../artifacts/web.log 2>&1 &

for attempt in $(seq 1 60); do
  if curl --fail --silent http://127.0.0.1:8000/health/ready > /dev/null \
    && curl --fail --silent http://127.0.0.1:3000 > /dev/null; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    echo "StreamForge did not become ready within 60 seconds."
    exit 1
  fi

  sleep 1
done

set +e
cd playwright
BASE_URL=http://127.0.0.1:3000 \
CI=true \
npx playwright test tests/ui/sanity --project=chromium
test_status=$?
cd ..
set -e

cp -R playwright/playwright-report ../artifacts/ 2>/dev/null || true
cp -R playwright/test-results ../artifacts/ 2>/dev/null || true

exit "$test_status"
```

### What each section does

1. `set -euo pipefail` makes unexpected shell failures stop the task.
2. `cd source` enters the Concourse Git input.
3. The Python virtual environment isolates FastAPI dependencies.
4. `npm ci` installs exact versions from lockfiles.
5. `npm run build` produces the Next.js production build.
6. FastAPI and Next.js start as background processes inside the task.
7. The loop waits for both services instead of using an arbitrary fixed delay.
8. Playwright runs only the sanity directory and Chromium project.
9. Reports and application logs are copied to the task output.
10. The script exits with the Playwright status so failed tests fail the Concourse build.

### Windows line-ending warning

Concourse will run this script in Linux. Save it with LF line endings, not Windows CRLF. In VS Code, use the line-ending selector in the status bar and choose `LF`.

## 9. Concourse Task Definition

Proposed `ci/tasks/playwright-sanity.yml`:

```yaml
platform: linux

image_resource:
  type: registry-image
  source:
    repository: your-registry/streamforge-playwright
    tag: "1.61.1"

inputs:
  - name: source

outputs:
  - name: artifacts

params:
  BASE_URL: http://127.0.0.1:3000

run:
  path: source/ci/scripts/run-playwright-sanity.sh
```

### Why `source` is an input

The pipeline retrieves the Git repository and gives it to the task as a directory named `source`. The task can read only declared inputs.

### Why `artifacts` is an output

The task copies reports and logs into this directory so Concourse can pass them to later steps. Files left elsewhere in the temporary task container disappear after the build.

### Why the image is pinned

The Playwright package and browser image must match. Pinning also prevents an image update from silently changing the test environment.

## 10. Concourse Pipeline

Proposed `ci/pipeline.yml`:

```yaml
resources:
  - name: source
    type: git
    source:
      uri: ((repository-uri))
      branch: ((repository-branch))
      private_key: ((repository-private-key))

jobs:
  - name: playwright-sanity
    plan:
      - get: source
        trigger: false

      - task: run-playwright-sanity
        file: source/ci/tasks/playwright-sanity.yml
```

### Why `trigger` is initially false

The job will not start automatically for every commit while the pipeline is being learned and debugged. You will trigger builds manually from the Concourse UI or `fly`.

After the job is stable, change it to:

```yaml
trigger: true
```

### Public repository

For a public repository, remove:

```yaml
private_key: ((repository-private-key))
```

### Private repository

Use a read-only deploy key or approved credential manager. Never commit a private key directly into `pipeline.yml`.

## 11. Pipeline Variables

For an initial local learning setup, create an uncommitted file outside source control, for example `ci/vars.local.yml`:

```yaml
repository-uri: git@github.com:YOUR_ACCOUNT/playwright-quality-architecture.git
repository-branch: main
repository-private-key: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  replace-this-with-a-read-only-deploy-key
  -----END OPENSSH PRIVATE KEY-----
```

Add the local variable file to `.gitignore` before creating it.

For a public repository:

```yaml
repository-uri: https://github.com/YOUR_ACCOUNT/playwright-quality-architecture.git
repository-branch: main
```

For a real team environment, use the Concourse-supported credential manager instead of a local variable file.

## 12. Learning Path: Run the Task Before the Pipeline

The safest learning sequence is to validate the task directly with `fly execute` before adding Git-resource and pipeline behavior.

### Step 1: Log in

For local Concourse:

```powershell
fly -t local login `
  -c http://localhost:8080 `
  -u test `
  -p test
```

Verify:

```powershell
fly -t local status
fly -t local workers
```

At least one worker must be listed.

### Step 2: Execute the task using the local repository

From the repository root:

```powershell
fly -t local execute `
  -c .\ci\tasks\playwright-sanity.yml `
  -i source=.
```

This uploads the current directory as the `source` input. It does not require a Git resource.

Use this stage to resolve container, dependency, startup, path, and test issues.

### Step 3: Inspect the result

The command should end with:

```text
succeeded
```

If a test fails, the task should end as failed and still copy available reports and logs into the `artifacts` output.

## 13. Set the Pipeline

After `fly execute` succeeds and the repository is pushed to Git:

```powershell
fly -t local set-pipeline `
  -p streamforge `
  -c .\ci\pipeline.yml `
  -l .\ci\vars.local.yml
```

Concourse displays the proposed changes and asks for confirmation.

Unpause the pipeline:

```powershell
fly -t local unpause-pipeline -p streamforge
```

View the pipeline:

```text
http://localhost:8080/teams/main/pipelines/streamforge
```

## 14. Run the Job

Trigger the job manually:

```powershell
fly -t local trigger-job `
  -j streamforge/playwright-sanity `
  -w
```

Options used:

- `-j` identifies `pipeline/job`.
- `-w` waits and streams the build output.

List recent builds:

```powershell
fly -t local builds
```

Watch a specific build:

```powershell
fly -t local watch `
  -j streamforge/playwright-sanity `
  -b 1
```

## 15. Expected Build Stages

The Concourse UI should show:

```text
source -> run-playwright-sanity
```

The task log should show:

1. Python dependency installation.
2. Next.js dependency installation and build.
3. Playwright dependency installation.
4. FastAPI readiness.
5. Next.js readiness.
6. Four sanity tests running in Chromium.
7. Final pass or failure summary.

## 16. Artifact Strategy

The first task produces:

```text
artifacts/
  api.log
  web.log
  playwright-report/
  test-results/
```

These provide:

- FastAPI startup and request diagnostics.
- Next.js startup and server diagnostics.
- Playwright HTML results.
- Failure traces, screenshots, and videos based on the Playwright configuration.

A Concourse output is available only within the build plan unless a later step uploads it to durable storage. Permanent storage could later use S3, an artifact repository, or another approved resource. That decision belongs to the quality-gate and retention design phase.

## 17. Common Failures

### Docker Desktop is not running

Symptom:

```text
failed to connect to the docker API
```

Action: Start Docker Desktop and wait for the Linux engine before starting local Concourse.

### No Concourse workers are available

Check:

```powershell
fly -t local workers
```

The pipeline cannot run tasks without a worker.

### Git resource cannot clone the repository

Check:

- Repository URI.
- Branch name.
- Deploy-key permissions.
- Worker network access.
- Whether the host key and private key are configured correctly.

### Playwright browser executable is missing

Check that these versions match exactly:

```text
@playwright/test version
Playwright Docker image version
```

For the current setup, both should be 1.61.1.

### FastAPI or Next.js never becomes ready

Inspect:

```text
artifacts/api.log
artifacts/web.log
```

Confirm ports, environment variables, database directory permissions, and build success.

### Tests pass locally but fail in Concourse

Check for:

- Hard-coded Windows paths.
- CRLF shell-script line endings.
- Dependence on a locally running app.
- Missing committed files.
- Case-sensitive Linux file paths.
- Browser/package version mismatch.
- Tests depending on mutable local database state.

### The pipeline reports no tests

Confirm:

```text
playwright/tests/ui/sanity/*.spec.ts
```

Then inspect the task command and Playwright `testDir`.

## 18. Security and Reliability Rules

- Never commit Git private keys, passwords, tokens, or Concourse credentials.
- Use a read-only Git deploy key.
- Pin container and dependency versions.
- Use `npm ci`, not `npm install`, in CI.
- Give every build its own SQLite file.
- Do not connect tests to a developer's local database.
- Do not enable retries for the initial sanity job.
- Do not ignore the Playwright exit code.
- Do not use fixed startup sleeps; poll readiness endpoints.
- Preserve application logs and Playwright evidence for failures.

## 19. Implementation Phases

### Phase 1: Documentation approval

- Review container strategy.
- Review proposed files.
- Confirm Git-hosting and Concourse details.
- Confirm report-retention expectations.

### Phase 2: Task prototype

- Add the Dockerfile, task script, and task YAML.
- Build and publish the CI image.
- Run with `fly execute`.
- Fix task-level issues only.

### Phase 3: Manual pipeline

- Add Git resource and one manually triggered job.
- Run the four sanity tests.
- Confirm failure behavior and artifacts.

### Phase 4: Automation

- Enable Git triggering.
- Define quality gates.
- Define durable report retention.
- Add notifications only after ownership is agreed.

## 20. Decisions Needed Before Implementation

1. Where will the repository be hosted, and is it public or private?
2. Is Concourse already available, or will a local learning installation be used?
3. Which container registry will hold the StreamForge Playwright image?
4. Should the first task use a prebuilt image or temporarily install Python at runtime?
5. How long should reports be retained after a build?
6. Should the four current files all count as sanity tests, or are any duplicates or temporary experiments?
7. Should the job reset the SQLite baseline once before the suite or before each mutating test?

Implementation should begin only after questions 1 through 4 are answered.
