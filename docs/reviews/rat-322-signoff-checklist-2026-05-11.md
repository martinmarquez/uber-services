# RAT-322 Signoff Checklist (FE/BE/PM)

Date: 2026-05-11
Issue: RAT-322
Purpose: close the contract-freeze acceptance gate with explicit approver evidence.

## Canonical freeze artifact
- Primary document: `docs/reviews/rat-322-fe-be-contract-freeze-v1-2026-05-11.md`

## Acceptance gate
- [x] Single contract document published in `docs/reviews`.
- [x] Endpoint scope closed: `create/edit/respond/appeal/report/list`.
- [x] Error envelope and status mapping frozen.
- [x] Versioning/compatibility policy frozen (`/api/v1` + legacy alias policy).
- [x] FE implementation aligned and tested.
- [ ] BE signoff recorded.
- [ ] PM signoff recorded.

## FE implementation evidence
- `src/api/reviewsApi.js`
- `src/api/reviewsApi.test.js`
- `src/components/MobileReviewFlow.jsx`
- `src/components/MobileReviewFlow.test.jsx`

## Test evidence (latest)
- Command: `npm test -- src/api/reviewsApi.test.js`
- Command: `npm test -- src/components/MobileReviewFlow.test.jsx`
- Result: pass (`8/8` tests)

## Approver log
### FE signoff
- Approver: Front-End Developer
- Status: Approved
- Timestamp (UTC): 2026-05-11T04:54:25Z
- Note: FE contract client + UI integration normalized to canonical v1 API.

### BE signoff
- Approver: Backend Engineer
- Status: Pending
- Timestamp (UTC): pending
- Notes required:
  - Confirm endpoint payload/validation parity with server contract.
  - Confirm no pending drift in `error.code` or HTTP mapping.

### PM signoff
- Approver: Product Manager
- Status: Pending
- Timestamp (UTC): pending
- Notes required:
  - Confirm scope is complete for product acceptance.
  - Confirm compatibility/deprecation policy is acceptable for rollout.

## Resume continuity note
- 2026-05-11: state correction sweep (RAT-556) may move issue state when no active run handle is attached.
- This checklist and the canonical freeze doc are the source of truth for re-checkout continuation.
- No scope change required; next action is BE+PM approval on current artifact.

## Re-checkout handoff (RAT-556)
- Current board correction context: issue may be auto-moved to `todo` when no active execution handle is present for >2h.
- Assignee for next action: `adf18093-4e85-4792-a0e5-1c86f450a9bb` (Front-End Developer).
- Required action on resume:
  - Re-checkout `RAT-322`.
  - Keep disposition `in_review`.
  - Request final BE + PM signoff entries using templates below.
- Definition of finished:
  - Both signoff entries present in the canonical freeze flow.
  - Move issue to `done` with no additional FE code changes required.

## Issue disposition and explicit completion path
- Current disposition: `in_review` once both approvals are recorded in this checklist.
- BE owner must add a PM-required signoff entry on [rat-322-fe-be-contract-freeze-v1-2026-05-11.md](/Users/martinmarquez/uber-services/docs/reviews/rat-322-fe-be-contract-freeze-v1-2026-05-11.md) under:
  - `BE signoff`
  - `PM signoff`
- When both entries are present, the issue can be closed as `done`.

## Reviewer templates (copy/paste)
### Backend signoff template
```md
BE signoff
- Approver: <name>
- Date (UTC): <YYYY-MM-DDTHH:mm:ssZ>
- Decision: Approved
- Checks:
  - Payload/validation parity with `server/src/api/reviewsContract.js`: pass
  - Error code + HTTP mapping parity: pass
  - Versioning/compat policy (`/api/v1` + alias handling): pass
- Notes: <optional>
```

### Product signoff template
```md
PM signoff
- Approver: <name>
- Date (UTC): <YYYY-MM-DDTHH:mm:ssZ>
- Decision: Approved
- Checks:
  - Scope complete for `create/edit/respond/appeal/report/list`: pass
  - Limits and moderation policy are acceptable for release: pass
  - Compatibility/deprecation policy accepted: pass
- Notes: <optional>
```
