# RAT-739 — RAT-730 FE singleton unblock normalization (2026-05-11)

## Scope executed this heartbeat
- Issue focus: prevent frontend modal-state drift in Rating 360 review UI and leave durable unblock evidence.
- Code lane: `src/components/MobileReviewFlow.jsx` + targeted regression in `src/components/MobileReviewFlow.test.jsx`.

## Goal gate
- `PRODUCT_BRIEF.md`: present.
- `design-system.md`: present; accessibility contract requires modal focus handling and stable dialog behavior.

## Normalization change
- Replaced dual dialog state (`activeReport` + `activeRespond`) with a singleton modal controller (`activeModal`).
- Modal controller now enforces a single active dialog (`report` or `respond`) at runtime.
- This removes risk of multi-modal overlap and keeps `aria-modal` behavior contract-safe.

## Verification
- Ran focused FE regression only (no full workspace run):
  - `npm test`
- Added test: `keeps report/respond dialogs mutually exclusive through a singleton modal controller`.

## Unblock contract
- FE singleton normalization is complete for this scope.
- Next action owner: Backend + PM sign-off owners on RAT-324 contract thread.
- Next action: post pending explicit approvals in canonical format on
  `docs/reviews/rat-324-fe-be-rating360-contract-freeze-v1.md` so downstream lifecycle closure can proceed.
