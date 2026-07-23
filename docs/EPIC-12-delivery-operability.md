# EPIC-12: Delivery and Operability

## Goal

Make the verified StreamForge MVP reproducible from a clean checkout for local development, containers, and CI.

## Scope

- One-command Docker Compose startup for Next.js, FastAPI, persistent SQLite storage, migration, and seed initialization.
- Independent documented web and API development commands.
- GitHub Actions build, API tests, browser smoke/regression, accessibility, K6 smoke, dependency audit, and artifact retention.
- Environment example with no secrets and configurable ports/base URLs.
- README covering purpose, prerequisites, seeded accounts, commands, troubleshooting, and architecture links.
- Exclusion of secrets, database files, reports, traces, video, and build artifacts from version control.
- Production-like verification that test support and fault injection are disabled.

## Requirement Coverage

- Delivery and Operability Requirements
- Configuration and Environment Requirements system-wide
- Observability artifact-retention requirement
- PERF-005 and PERF-006 scheduling/execution behavior
- Definition of Done items 6 through 10

## Acceptance

- A contributor can clone the repository and start the complete seeded application with one documented command.
- Web and API services can be run independently for debugging.
- CI builds from a clean checkout without globally installed project dependencies or personal credentials.
- Failed CI tests retain relevant traces, screenshots, video, logs, and reports.
- Production-like startup disables test-support and controlled-fault routes.
- The README and example configuration reproduce the documented behavior.

## Exclusions

- Multi-region deployment, high availability, disaster recovery, and production analytics infrastructure.

## Dependencies

EPIC-01 through EPIC-11. Container and CI foundations may be added incrementally while those epics are delivered.
