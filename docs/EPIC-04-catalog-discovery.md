# EPIC-04: Catalog Discovery and Title Details

## Goal

Allow subscribers to discover published fictional content through deterministic catalog and detail experiences.

## Scope

- Catalog list API with case-insensitive search, combined filters, deterministic sorting, and result counts.
- Filters for genre, content type, availability, and entitlement tier.
- Sort by title, release year, and recently added.
- URL-restorable catalog state, active-filter display, clear-filter action, and accessible empty state.
- Responsive catalog cards and deep-linked title details.
- Controlled not-found handling and unpublished-title exclusion.

## Requirement Coverage

- CAT-001 through CAT-010
- DETAIL-001 through DETAIL-005
- ERR-007
- TEST-001, TEST-002, TEST-009, TEST-011 as applied to catalog workflows
- AC-03

## Acceptance

- Every combined-filter result satisfies every active criterion and the count is accurate.
- Refreshing or directly opening a catalog URL restores its state.
- Published valid titles have stable details deep links.
- Invalid, missing, and unpublished title IDs return controlled, non-leaking not-found experiences.
- Critical discovery behavior passes in Chromium, Firefox, and WebKit without arbitrary waits.

## Exclusions

- Recommendations, pagination, infinite scrolling, and continue-watching progress.

## Dependencies

EPIC-01 and EPIC-02.

