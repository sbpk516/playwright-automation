# EPIC-01: Platform Foundation

## Goal

Provide the smallest runnable StreamForge system with Next.js, FastAPI, SQLite, stable configuration, migrations, seed data, and health signals.

## Scope

- Create the Next.js App Router web application and FastAPI service.
- Establish versioned `/api/v1` routing and OpenAPI output.
- Create SQLite migrations for the MVP entities and deterministic seed execution.
- Seed at least two subscribers, one administrator, three plans, and 30 fictional titles with stable IDs.
- Add liveness, readiness, startup validation, correlation IDs, structured redacted logs, and graceful shutdown.
- Provide configuration for `local`, `test`, `ci`, and `production-like` profiles.
- Establish the initial Playwright configuration and one web-to-API smoke test.

## Requirement Coverage

- API general behavior and minimum health endpoint inventory
- Data Requirements 9.1-9.3
- Observability and Diagnostics Requirements
- Configuration and Environment Requirements
- TEST-003, TEST-004, TEST-008, TEST-010, TEST-012
- Delivery and Operability Requirements applicable to the walking skeleton

## Acceptance

- A clean database is migrated and seeded automatically.
- Seed identifiers and values are identical after repeated initialization.
- Data survives an ordinary API restart.
- Liveness reports the process state; readiness stays false until database and seed readiness are confirmed.
- Every API response carries a correlation identifier and secrets are absent from logs.
- The initial Playwright smoke test waits on readiness and passes without a fixed delay.

## Exclusions

- Feature APIs and pages beyond a minimal shell.
- Authentication behavior, test reset, and fault injection.

## Dependencies

None.

