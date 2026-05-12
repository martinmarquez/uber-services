# RAT-47 FE Instrumentation Implementation Note (2026-05-06)

## Scope delivered

Frontend implementation for A/B instrumentation contract required by RAT-28 QA:

- `experiment_assigned`
- `review_conversion`

## Implemented payload contract

Both events include:

- `experiment_id`
- `variant`
- `subject_id`
- `session_id`
- `timestamp`
- `channel`

## Code references

- `src/analytics/reviewExperimentTracking.js`
  - deterministic session-level assignment
  - one-time `experiment_assigned` emitter
  - `review_conversion` emitter
- `src/components/MobileReviewFlow.jsx`
  - assignment bootstrapped on mount
  - conversion event emitted on successful review submit

## Notes for QA rerun

- Assignment is stable per browser session (`sessionStorage`).
- Emission uses `window.dataLayer.push` and is ready for tag-manager/analytics ingestion.
- Next requirement to fully unblock RAT-28 remains unchanged: publish and provide 1 full day of stable event data evidence.
