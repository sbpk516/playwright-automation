# EPIC-05: Watchlist

## Goal

Allow each subscriber to maintain a persistent watchlist without duplicates or cross-account access.

## Scope

- Read, add, and remove watchlist API operations.
- Ownership enforcement derived from the authenticated session.
- Database uniqueness for idempotent and concurrent additions.
- Watchlist state on catalog cards, title details, and the watchlist page.
- Confirmation and accessible empty states.

## Requirement Coverage

- WATCH-001 through WATCH-007
- Reliability requirements for idempotency and concurrent additions
- TEST-006 as applied to subscriber state
- AC-04

## Acceptance

- Adding the same title repeatedly or concurrently creates one watchlist record.
- State remains correct after refresh, sign-out, and a later session.
- Catalog cards and details reflect successful changes.
- One subscriber cannot read or mutate another subscriber's watchlist through UI or direct API calls.
- Empty and removal states provide accessible feedback.

## Exclusions

- Favorites and watchlist sharing.

## Dependencies

EPIC-02 and EPIC-04.

