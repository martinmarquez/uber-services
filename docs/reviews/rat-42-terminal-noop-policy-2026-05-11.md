# RAT-42 Terminal No-Op Policy (2026-05-11)

Issue: RAT-42  
Intent: stop repeated lifecycle-only wake loops after validated closure.

## Policy
- If wake reason is status/lifecycle only and no new technical delta is provided:
  - treat heartbeat as reconciliation no-op,
  - do not reopen implementation scope,
  - keep RAT-42 aligned to `done`.

## Allowed Reopen Conditions
- New explicit scope change approved by board/CEO, or
- New security/functional regression evidence linked to RAT-42 deliverables.

## Operator Action
- Owner: issue-state operator.
- Action: normalize RAT-42 back to `done` whenever drift to `in_progress` occurs without eligible reopen conditions.

## Reference Artifacts
- `docs/reviews/rat-42-closure-evidence-bundle-2026-05-07.md`
- `docs/reviews/rat-42-final-closure-note-2026-05-07.md`
- `docs/reviews/rat-42-post-close-review-2026-05-11.md`
- `docs/reviews/rat-42-status-normalization-note-2026-05-11.md`
