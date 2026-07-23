# StreamForge MVP Epics

StreamForge requires **12 epics**. They are ordered by implementation dependency, but quality work is completed inside each feature epic rather than postponed until the end.

| Epic | Outcome | Depends on |
|---|---|---|
| [EPIC-01](EPIC-01-platform-foundation.md) | Runnable Next.js, FastAPI, SQLite foundation | None |
| [EPIC-02](EPIC-02-authentication-authorization.md) | Secure sessions and role enforcement | EPIC-01 |
| [EPIC-03](EPIC-03-public-experience.md) | Public landing page and plan comparison | EPIC-01 |
| [EPIC-04](EPIC-04-catalog-discovery.md) | Catalog browse, search, filter, sort, and details | EPIC-01, EPIC-02 |
| [EPIC-05](EPIC-05-watchlist.md) | Persistent isolated subscriber watchlists | EPIC-02, EPIC-04 |
| [EPIC-06](EPIC-06-profile-management.md) | Profile CRUD, selection, and maturity limits | EPIC-02 |
| [EPIC-07](EPIC-07-subscription-entitlements.md) | Immediate simulated plan changes and entitlements | EPIC-02, EPIC-03 |
| [EPIC-08](EPIC-08-simulated-playback.md) | Authorized, accessible local playback | EPIC-04, EPIC-06, EPIC-07 |
| [EPIC-09](EPIC-09-catalog-administration.md) | Administrator catalog management | EPIC-02, EPIC-04 |
| [EPIC-10](EPIC-10-test-support-resilience.md) | Deterministic data isolation and controlled faults | EPIC-01, EPIC-02 |
| [EPIC-11](EPIC-11-quality-verification.md) | Cross-browser, API, accessibility, security, and performance verification | EPIC-02 through EPIC-10 |
| [EPIC-12](EPIC-12-delivery-operability.md) | Reproducible local, container, and CI operation | EPIC-01 through EPIC-11 |

## Delivery Rule

An epic is complete only when its UI and API behavior, negative paths, accessibility, automated tests, requirement traceability, and relevant diagnostics are complete. EPIC-11 supplies shared verification infrastructure and system-wide checks; it does not absorb feature-level testing omitted from earlier epics.

## MVP Sequence

1. Establish the walking skeleton with EPIC-01.
2. Implement EPIC-02 and EPIC-03.
3. Deliver the customer experience through EPIC-04 to EPIC-08.
4. Deliver administration and deterministic failure control through EPIC-09 and EPIC-10.
5. Complete system-wide verification and reproducible delivery through EPIC-11 and EPIC-12.

