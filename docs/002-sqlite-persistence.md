# ADR 002: SQLite Persistence

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Data must survive restarts, reset deterministically, enforce constraints, and remain isolated across parallel test workers without requiring private infrastructure.

## Decision

Use SQLite through Python's standard-library `sqlite3` module. Apply checked-in SQL migrations and deterministic seed statements. Use one persistent file per normal environment and one file per Playwright worker in test and CI.

## Consequences

- Normal restarts retain data without an external database service.
- Transactions and unique constraints cover watchlist idempotency and ownership integrity.
- Worker databases can be created and reset cheaply.
- The design does not claim multi-node database behavior or production-scale concurrency.
- Optimistic concurrency is not implemented in MVP.
