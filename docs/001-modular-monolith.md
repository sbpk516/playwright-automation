# ADR 001: Modular Monolith

**Status:** Accepted  
**Date:** 2026-07-21

## Context

StreamForge needs independently testable browser and API boundaries but does not require distributed scaling. Operational complexity must not overshadow the quality architecture.

## Decision

Build one repository with a React and TypeScript web process and a Python FastAPI process. Organize API code by product area while deploying it as one service. Use OpenAPI as the language-neutral contract and share only deterministic test data where it is genuinely reused.

## Consequences

- Browser and API contracts remain realistic and independently testable.
- Local startup and container orchestration stay small.
- Frontend and backend use separate dependency toolchains.
- There are no message brokers, service discovery, distributed transactions, or internal service clients.
- Product areas may be separated into services later only after a demonstrated need.
