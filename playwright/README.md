# StreamForge Playwright Architecture Lab

This folder contains the interview architecture implemented as a small,
executable framework.

## Start the application

From the repository root:

```bash
docker compose up --build --detach
```

## Run the framework

From this `playwright` directory:

```bash
npm ci
npx playwright install
npm run typecheck
npm run test:architecture
```

Focused commands:

```bash
npm run test:smoke
npm run test:api
npm run test:integration
npm run test:ui
npm run test:headed
npm run test:debug
npm run report
```

## Learning order

1. `tests/architecture/smoke/authenticated-browse.spec.ts`
2. `fixtures/test-fixtures.ts`
3. `pages/browse.page.ts`
4. `api/auth.client.ts`
5. `tests/architecture/api/profile.api.spec.ts`
6. `tests/architecture/ui/managed-profile.spec.ts`
7. `tests/architecture/integration/catalog-resilience.spec.ts`
8. `playwright.config.ts`
9. `.github/workflows/`

The detailed walkthrough is in
`../docs/playwright-fixtures-architecture-learning-guide.md`.
