# EPIC-02: Authentication and Authorization

## Goal

Allow seeded users to establish, retain, expire, and revoke sessions while enforcing subscriber, administrator, and test-support boundaries in FastAPI.

## Scope

- Sign-in, sign-out, and current-session API operations.
- Password hashing with `hashlib.scrypt` and opaque server-side sessions.
- HTTP-only session cookies with environment-appropriate settings.
- Next.js sign-in flow, protected navigation, safe return paths, and sign-out.
- Server-side authentication, role authorization, ownership foundations, and generic failures.
- Authentication rate limiting in production-like mode.
- API-assisted Playwright authentication through the real sign-in path.

## Requirement Coverage

- AUTH-001 through AUTH-011
- Security Requirements for passwords, sessions, least privilege, rate limiting, secret handling, and server-side enforcement
- TEST-005
- AC-01, AC-02, AC-05, AC-12

## Acceptance

- Seeded subscribers and administrators can sign in and refresh without losing the session.
- Invalid credentials produce the same accessible error regardless of which credential is wrong.
- Sign-out and expiration invalidate protected API access.
- A subscriber receives `403` from administrator operations and cannot reach the admin UI.
- Playwright creates reusable browser storage state through the actual authentication API.
- Passwords, cookies, and authorization values do not appear in responses, logs, or reports.

## Exclusions

- Social identity, MFA, password recovery, email, and production identity providers.

## Dependencies

EPIC-01.

