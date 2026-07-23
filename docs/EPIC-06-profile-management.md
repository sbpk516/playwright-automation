# EPIC-06: Profile Management

## Goal

Allow subscribers to manage household profiles and establish the maturity limit used for playback decisions.

## Scope

- Read account and list profiles.
- Create, rename, select, and delete profiles.
- Name trimming, length rules, uniqueness, configured profile limit, avatar selection, and maturity limit.
- Prevention of final-profile deletion.
- Session persistence of the active profile.
- Accessible profile forms, errors, selection state, and confirmations.

## Requirement Coverage

- PROF-001 through PROF-006
- User Experience form and feedback requirements
- A11Y-001 through A11Y-004 and A11Y-008 as applied to profiles

## Acceptance

- A subscriber can create, rename, select, and delete profiles within documented limits.
- Invalid, duplicate, and whitespace-only names produce field-level errors while safe input remains.
- The final profile cannot be deleted.
- The selected profile persists for the session and exposes its maturity limit to playback authorization.
- No profile operation can access another subscriber's records.

## Exclusions

- PINs, parental-control administration, and profile-specific recommendations.

## Dependencies

EPIC-02.

