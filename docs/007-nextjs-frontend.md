# ADR 007: Next.js Frontend

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Next.js experience is an explicit portfolio goal. The application needs routing, layouts, deep links, responsive pages, and clear client/server rendering boundaries. FastAPI remains the backend system of record.

## Decision

Use Next.js with TypeScript and the App Router for the web application. Use its built-in development and production build pipeline. Do not add Vite or React Router. Keep business APIs, authorization, persistence, and OpenAPI ownership in FastAPI rather than duplicating them in Next.js route handlers.

## Consequences

- The project demonstrates Next.js routing, layouts, server and client component boundaries, and production builds.
- Next.js and FastAPI run as separate processes and containers.
- The frontend consumes FastAPI through its documented OpenAPI/JSON boundary.
- Authentication behavior must be tested across the frontend-to-API boundary.
- Vite-specific configuration, plugins, and build commands are excluded.
