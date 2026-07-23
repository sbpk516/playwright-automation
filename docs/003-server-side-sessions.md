# ADR 003: Server-Side Sessions

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Authentication must persist across navigation, support deterministic API-assisted browser setup, expire cleanly, and allow immediate sign-out revocation.

## Decision

Store opaque sessions in SQLite and send the identifier in an HTTP-only cookie. Hash passwords with Python's `hashlib.scrypt`. Resolve the current user and role on every protected request.

## Consequences

- Sign-out and expiration revoke access immediately.
- Authorization state is not trusted from browser-readable storage.
- Playwright can authenticate through the real sign-in API and reuse cookie storage state.
- Session cleanup is required.
- Cross-site identity providers, JWT refresh flows, MFA, and account recovery remain outside scope.
