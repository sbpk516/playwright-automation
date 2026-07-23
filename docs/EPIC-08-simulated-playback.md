# EPIC-08: Simulated Playback

## Goal

Provide deterministic, accessible playback behavior using a locally generated media asset and server-authorized access.

## Scope

- Playback-authorization API evaluating session, title publication and availability, plan tier, active profile, and maturity limit.
- Repository-owned generated video/animation and caption assets.
- Loading, playing, paused, ended, and error states driven by native media events.
- Play/pause, seek, volume, captions, and close controls.
- Keyboard operation, visible focus, accessible names, values, and states.
- Deterministic playback-error simulation integration.

## Requirement Coverage

- PLAY-001 through PLAY-006
- A11Y-001 through A11Y-003, A11Y-008 through A11Y-010 as applied to playback
- TEST-003 and TEST-007 as applied to media state
- AC-06 and AC-09

## Acceptance

- Eligible subscribers can open and control playback without an external network request.
- Unavailable, unpublished, maturity-restricted, and tier-restricted playback is denied with the correct explicit reason.
- An immediate eligible plan change permits a previously tier-restricted title.
- Every control is operable using only the keyboard and exposes its current state.
- Loading, error, recovery, and ended behavior is deterministic in supported browsers.

## Exclusions

- DRM, adaptive bitrate streaming, transcoding, real copyrighted media, and progress persistence.

## Dependencies

EPIC-04, EPIC-06, and EPIC-07.

