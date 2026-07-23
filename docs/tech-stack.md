# StreamForge Technology Stack

**Status:** Accepted for MVP implementation

## Decisions

| Concern | Selection | Justification |
|---|---|---|
| Frontend and test language | TypeScript on Node.js 24 LTS | Native fit for React and Playwright; current LTS runtime |
| Backend language | Python 3.11+ | Requested backend language with a mature standard library and direct FastAPI support |
| JavaScript package management | npm workspaces | Included with Node.js and sufficient for the web application and tests |
| Python package management | `venv` and `pip` with `pyproject.toml` | Standard Python environment isolation and explicit dependencies without another package manager |
| Web application | Next.js with React and TypeScript | Next.js is an explicit portfolio goal and provides production-oriented rendering, routing, and bundling |
| Web routing | Next.js App Router | Built-in layouts, protected route organization, deep links, and URL-restorable catalog state |
| API | FastAPI | Direct route definitions, Pydantic validation, dependency-based authorization, and native OpenAPI |
| API schemas | Pydantic | FastAPI-native request and response validation with generated JSON Schema |
| Database | SQLite | Durable restarts, transactions, constraints, zero external service, cheap worker isolation |
| Database access | Python `sqlite3` with SQL migrations | Standard-library access and fewer layers than an ORM for the compact data model |
| Password hashing | Python `hashlib.scrypt` | Secure password hashing without an additional runtime dependency |
| Sessions | Opaque server-side sessions | Simple revocation and no client-visible authorization claims |
| UI testing | Playwright Test | Required cross-browser UI and API automation, fixtures, tracing, video, screenshots |
| Accessibility | axe-core through `@axe-core/playwright` | Automated WCAG issue detection integrated with browser tests |
| API performance | K6 | Required threshold-driven smoke and nominal API load profiles |
| API documentation | OpenAPI generated from route schemas | Machine-readable contract without maintaining duplicate schemas |
| Containers | Docker and Docker Compose | Required clean, one-command, CI-friendly runtime |
| CI | GitHub Actions | Repository-native build and test orchestration |
| Contract testing | Pact after MVP | Supports the resolved complete consumer and provider verification workflow |

## Dependency Rule

Dependencies are added only when a requirement cannot be met clearly with the selected runtimes or an already selected package. The frontend starts with Next.js, React, and React DOM. The backend starts with FastAPI and Uvicorn; Pydantic and Starlette are required FastAPI dependencies. Vite and React Router are not included. No state library, CSS framework, ORM, form library, extra validation library, date library, or utility library is included by default.

## Supported Runtime Profiles

| Profile | Database | Test support | Fault injection |
|---|---|---|---|
| `local` | persistent local file | enabled | optional |
| `test` | isolated worker files | enabled | enabled |
| `ci` | isolated worker files | enabled | enabled |
| `production-like` | persistent file or mounted volume | disabled | disabled |

## Deferred Choices

- Pact is introduced only with the post-MVP provider-verification work.
- Browser-level performance tooling is excluded; K6 covers APIs only.
- Optimistic concurrency infrastructure is excluded until its extension is implemented.
- A CSS framework and component library are excluded unless implementation demonstrates a concrete accessibility or maintenance need.
