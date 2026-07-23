# EPIC-09: Catalog Administration

## Goal

Allow administrators, and only administrators, to create, inspect, edit, publish, and unpublish catalog titles.

## Scope

- Administrator catalog list, detail, create, update, publish, and unpublish APIs and pages.
- Required-field, format, range, enum, uniqueness, and immutable-ID validation.
- Immediate propagation of publication changes to subscriber catalog and detail APIs.
- Accessible forms, field errors, confirmations, and status feedback.
- Subscriber and unauthenticated denial at both UI and API boundaries.

## Requirement Coverage

- ADMIN-001 through ADMIN-005 and ADMIN-007
- AUTH-008
- CAT-010
- AC-05 and AC-07

## Acceptance

- An administrator can create and update a valid title and publish or unpublish it.
- Invalid fields return the documented field-level errors without exposing internals.
- A title ID cannot change after creation.
- Subscribers see publication changes without reseeding.
- Visitors and subscribers cannot invoke or navigate to administration capabilities.

## Exclusions

- Hard deletion and optimistic concurrency described by deferred ADMIN-006.

## Dependencies

EPIC-02 and EPIC-04.

