# RAT-325 Security Hardening: Anti-Abuse in Appeals (2026-05-10)

## Scope
Backend hardening for review appeals to reduce abuse/gaming risk in moderation operations.

## Findings
1. `openAppeal` allowed unlimited submissions for the same review (appeal flooding vector).
2. `closeAppeal` did not verify that `appealId` existed, belonged to `reviewId`, or was still open.
3. Appeal evidence threshold was inconsistently enforced across API and domain layers.

## Security Changes Implemented
- Enforced idempotency replay for `openAppeal`.
- Enforced a minimum evidence note length of 10 chars in domain layer.
- Added single-active-appeal guard per review (`appeal_already_open`).
- Added reopen cooldown window after closure (`appeal_cooldown_active`, default 24h).
- Persisted appeal state in service memory structures and enforced close-state transitions.
- Added close validation for unknown/mismatched/non-open appeals (`appeal_not_found`, `appeal_not_open`).
- Aligned route validation to `validateAppealPayload` for consistent pre-validation.

## Verification
- `node --test server/tests/reviewService.test.js server/tests/routes.test.js`
- Result: 31/31 passing.

## Residual Risk / Next Hardening
- Cooldown is currently in-service memory; for distributed runtime, persist appeal state and cooldown checks in shared storage to avoid bypass across instances.
