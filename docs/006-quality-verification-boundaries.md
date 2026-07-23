# ADR 006: Quality Verification Boundaries

**Status:** Accepted  
**Date:** 2026-07-21

## Context

The project must verify UI, API, accessibility, resilience, security boundaries, and performance without duplicating checks across tools.

## Decision

Use Playwright Test for browser journeys, direct API checks, cross-browser execution, responsive behavior, fault recovery, and artifacts. Integrate axe-core for automated accessibility checks. Use K6 only for API performance smoke and nominal load profiles. Add full Pact consumer and provider verification after MVP.

## Consequences

- Each tool has a narrow responsibility.
- Browser performance testing is excluded.
- Critical business rules receive API coverage; only user-observable journeys receive browser coverage.
- Requirement IDs map to tests and documented manual checks rather than forcing every requirement into every layer.

