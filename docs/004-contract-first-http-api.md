# ADR 004: Schema-Defined HTTP API

**Status:** Accepted  
**Date:** 2026-07-21

## Context

The API requires consistent validation, documented contracts, stable automation interfaces, and later consumer/provider verification.

## Decision

Expose JSON REST endpoints under `/api/v1` with FastAPI. Define request and response models with Pydantic and let FastAPI generate OpenAPI from them. Use one documented error envelope.

## Consequences

- Runtime validation and API documentation originate from the same Pydantic models.
- OpenAPI is the language-neutral contract for the TypeScript web application and tests.
- UI and API tests can validate stable contracts.
- Adding GraphQL, RPC, or a second validation layer is unnecessary.
- Pact consumer and provider verification can be added after MVP against the same public API boundary.
