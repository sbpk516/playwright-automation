# EPIC-07: Subscription Plans and Entitlements

## Goal

Allow subscribers to compare and immediately apply simulated plan changes that drive playback entitlement.

## Scope

- List plans and current-plan API operations.
- Confirmation flow for immediate simulated plan changes.
- Idempotent unchanged-plan behavior.
- Persistent account entitlement updates.
- Clear fictional price and payment-free messaging.
- Entitlement-tier rules reusable by playback authorization.

## Requirement Coverage

- PLAN-001 through PLAN-006
- DETAIL-003 where action state depends on entitlement
- Reliability requirement for idempotent operations
- AC-06 plan-change portion

## Acceptance

- The subscriber can distinguish the current plan and compare every alternative.
- A confirmed change updates entitlement immediately and survives refresh and later sessions.
- Selecting the current plan does not duplicate or corrupt state.
- No payment details or external billing systems are requested.
- Plan and price language consistently identifies the experience as simulated.

## Exclusions

- Billing dates, payment processing, invoices, refunds, and taxes.

## Dependencies

EPIC-02 and EPIC-03.

