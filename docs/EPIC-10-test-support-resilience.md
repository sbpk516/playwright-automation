# EPIC-10: Test Support and Resilience

## Goal

Make failures, recovery, data reset, and parallel execution deterministic without exposing test capabilities in production-like mode.

## Scope

- Environment-restricted test reset and isolated-data operations.
- Database-per-worker selection using controlled worker identifiers.
- Controlled latency, HTTP error, empty response, malformed response, and playback-error states.
- Accessible UI loading, empty, error, retry, and recovered states.
- Consistent API error envelope with code, message, correlation ID, and optional fields.
- Audit records for test-support operations.
- Recovery after transient database/service restart.

## Requirement Coverage

- ERR-001 through ERR-006
- API test-support endpoint inventory
- Data Requirements 9.2
- Reliability and Concurrency Requirements not owned by feature epics
- TEST-006, TEST-007, TEST-010, TEST-012
- AC-08 and AC-10

## Acceptance

- Reset restores the documented baseline within 10 seconds.
- Parallel workers modify independent state and cannot choose arbitrary database files.
- Each supported fault can be activated and removed deterministically for a selected endpoint.
- A catalog failure presents an accessible retry action and succeeds after fault removal.
- Test-support routes are absent in production-like mode and unavailable to normal users.
- Expected errors contain no stack traces or sensitive internals.

## Exclusions

- General chaos engineering and production fault injection.

## Dependencies

EPIC-01 and EPIC-02; feature-specific recovery tests also depend on their owning epics.

