# Playwright UI/UX Setup on Windows

**Status:** Draft setup guide  
**Scope:** Local Playwright Test setup for StreamForge UI testing in Chromium  
**Not included:** Sanity test implementation, API test design, Concourse, quality gates, Firefox, WebKit, and Google Chrome

## 1. What We Are Setting Up

The initial setup will use:

- Playwright Test with TypeScript.
- Playwright's bundled Chromium browser.
- The existing StreamForge Next.js and FastAPI applications.
- Tests stored under `tests/ui`.
- Configuration stored in `playwright.config.ts` at the repository root.

We will install Playwright manually instead of running the interactive initializer. This keeps the setup small and prevents unwanted example tests, browsers, or CI files from being generated.

## 2. Prerequisites

- Windows 11 or Windows Server 2019 or later.
- Node.js 22, 24, or 26.
- npm.
- The existing StreamForge Python virtual environment.
- StreamForge can already run at `http://localhost:3000`.

Check Node.js and npm:

```powershell
node --version
npm --version
```

This repository currently uses Node.js 24, which is supported by Playwright.

## 3. Open the Project

Open PowerShell in:

```text
C:\Users\sbpk5\Documents\Pill\ai_ground\playwright-quality-architecture
```

Confirm the location:

```powershell
Get-Location
```

## 4. Install Playwright Test

Run once from the repository root:

```powershell
npm install --save-dev @playwright/test@latest
```

Confirm the installation:

```powershell
npx playwright --version
```

Expected result: a Playwright version number is displayed.

## 5. Install Chromium

Install only the browser selected for the initial sanity suite:

```powershell
npx playwright install chromium
```

Playwright stores its managed browsers under:

```text
%USERPROFILE%\AppData\Local\ms-playwright
```

Google Chrome does not need to be installed for this setup.

## 6. Planned Files

Create `playwright.config.ts` at the **repository root**.

Exact absolute path on this machine:

```text
C:\Users\sbpk5\Documents\Pill\ai_ground\playwright-quality-architecture\playwright.config.ts
```

Repository-relative path:

```text
playwright.config.ts
```

It must be at the same level as:

```text
package.json
package-lock.json
docker-compose.yml
apps
docs
```

It must **not** be created inside any of these locations:

```text
apps/web
apps/api
docs
tests
```

The initial repository structure will be:

```text
playwright-quality-architecture/
  playwright.config.ts
  package.json
  package-lock.json
  docker-compose.yml
  apps/
    api/
    web/
  docs/
  tests/
    ui/
      sanity/
```

The framework setup will add only these initial test-related paths:

```text
playwright.config.ts
tests/
  ui/
    sanity/
```

We will not create page objects, fixtures, helpers, environment loaders, or reporters until their responsibilities have been discussed and approved.

### Confirm the current directory before creating the file

Run:

```powershell
Set-Location C:\Users\sbpk5\Documents\Pill\ai_ground\playwright-quality-architecture
Get-Location
```

Expected output path:

```text
C:\Users\sbpk5\Documents\Pill\ai_ground\playwright-quality-architecture
```

Confirm that the root `package.json` is visible:

```powershell
Test-Path .\package.json
```

Expected result:

```text
True
```

### Create the empty configuration file

Only after the proposed configuration is approved, run from the repository root:

```powershell
New-Item -Path .\playwright.config.ts -ItemType File
```

If the file already exists, PowerShell will report that it exists. Do not overwrite it before inspecting its contents.

### Create the initial test directories

Run from the repository root:

```powershell
New-Item -Path .\tests\ui\sanity -ItemType Directory -Force
```

### Verify the exact locations

```powershell
Resolve-Path .\playwright.config.ts
Resolve-Path .\tests\ui\sanity
```

Expected paths:

```text
C:\Users\sbpk5\Documents\Pill\ai_ground\playwright-quality-architecture\playwright.config.ts
C:\Users\sbpk5\Documents\Pill\ai_ground\playwright-quality-architecture\tests\ui\sanity
```

Playwright automatically looks for `playwright.config.ts` in the current working directory. Therefore, all `npx playwright ...` commands in this guide must be run from the repository root unless an explicit `--config` path is supplied.

## 7. Planned Minimal Configuration

The first `playwright.config.ts` will contain only:

- `testDir` pointing to `tests`.
- A configurable application base URL with a local default.
- One Chromium project using a desktop viewport.
- HTML and terminal reporting.
- Trace, screenshot, and video retained only when a test fails.
- No retries locally.
- No automatic application startup initially.

Proposed configuration:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

`Desktop Chrome` supplies desktop viewport and browser-context settings. The browser engine is still Playwright's bundled Chromium because no `channel: 'chrome'` is configured.

## 8. Start StreamForge

The application requires two PowerShell terminals.

### Terminal 1: FastAPI

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --app-dir apps/api --reload
```

Expected URL:

```text
http://localhost:8000
```

### Terminal 2: Next.js

```powershell
npm run dev
```

Expected URL:

```text
http://localhost:3000
```

The Python environment is needed only in Terminal 1.

## 9. Confirm Application Readiness

In a third PowerShell terminal:

```powershell
Invoke-RestMethod http://localhost:8000/health/ready
Invoke-WebRequest http://localhost:3000 -UseBasicParsing | Select-Object StatusCode
```

Expected results:

```text
API status: ready
Web status: 200
```

Do not start Playwright tests until both checks succeed.

## 10. Commands We Will Use

After the first sanity test exists:

```powershell
# Run all Chromium tests headlessly
npx playwright test --project=chromium

# See the browser while running
npx playwright test --project=chromium --headed

# Open Playwright UI Mode
npx playwright test --ui --project=chromium

# Debug one test with Playwright Inspector
npx playwright test tests/ui/sanity/<test-file>.spec.ts --debug

# Open the most recent HTML report
npx playwright show-report
```

## 11. PowerShell Troubleshooting

### Virtual-environment activation is blocked

Apply a process-only policy and activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

This changes policy only for the current PowerShell process.

### `npx playwright` is not recognized

Run from the repository root and reinstall dependencies:

```powershell
npm install
npx playwright --version
```

### Chromium executable is missing

```powershell
npx playwright install chromium
```

### The test cannot reach StreamForge

Check both application terminals and run:

```powershell
Invoke-RestMethod http://localhost:8000/health/ready
Invoke-WebRequest http://localhost:3000 -UseBasicParsing | Select-Object StatusCode
```

### Port 3000 or 8000 is already in use

Find the process:

```powershell
Get-NetTCPConnection -LocalPort 3000,8000 -State Listen |
  Select-Object LocalPort,OwningProcess
```

Stop or reuse the existing StreamForge process. Do not terminate an unknown process without identifying it first.

## 12. Setup Completion Checklist

- [ ] Node.js and npm versions are displayed.
- [ ] `@playwright/test` is installed as a development dependency.
- [ ] `npx playwright --version` succeeds.
- [ ] Bundled Chromium is installed.
- [ ] FastAPI readiness returns `ready`.
- [ ] Next.js returns HTTP 200.
- [ ] The minimal configuration has been reviewed.
- [ ] No sanity tests have been implemented before test-case selection is approved.

## 13. Next Review

Before implementing the setup, review and approve:

1. The proposed minimal configuration.
2. Whether Playwright should start StreamForge automatically or require the two applications to be started separately.
3. The exact positive sanity journeys and their execution order.

After those decisions, setup implementation will be a small, separate task.
