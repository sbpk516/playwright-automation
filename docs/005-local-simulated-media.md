# ADR 005: Local Simulated Media

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Playback must exercise realistic controls and state transitions without copyrighted content, network dependencies, or a streaming platform.

## Decision

Generate and commit a short repository-owned video asset and caption file. Use the browser's native media element and events. Keep entitlement and failure decisions in the API while keeping playback itself local.

## Consequences

- Playback behavior is deterministic and works offline.
- Play, pause, seek, volume, captions, ended, and error states use real browser media behavior.
- Adaptive streaming, DRM, transcoding, and analytics infrastructure remain outside scope.
- The asset must be small and verified in Chromium, Firefox, and WebKit.

