# RAT-28 QA Readout (2026-05-06)

Decision: HOLD

## Scope executed
- Static verification of current implementation surface in `src/`
- Repository evidence scan for assignment/conversion event wiring
- Validation against checklist in `qa/test-plans/rat-28-ab-instrumentation-sample-quality-qa.md`

## Gate results
- Gate 1 (Instrumentation mandatory): FAIL
  - No explicit `experiment_assigned` emitter found in implementation.
  - No explicit conversion event payload with `experiment_id` + `variant` found in implementation.
- Gate 2 (Sample quality / split): BLOCKED
  - Cannot compute sample counts/split/SRM without event stream.
- Gate 3 (Funnel integrity): BLOCKED
  - Cannot validate exposure->conversion lineage without instrumentation join keys.
- Gate 4 (Decision governance): PASS (policy defined)
  - `n >= 100` per variant gate is documented and enforced by QA policy.

## Evidence notes
- `src/components/MobileReviewFlow.jsx` includes UX flow and submit behavior but no A/B assignment + conversion tracking contract implementation.
- Existing docs define event expectations, but implementation evidence is insufficient for QA sign-off.

## Exit status
- QA status: HOLD (not releasable for A/B decisioning)
- Required unblock: implement assignment + conversion instrumentation and provide one-day stable sample extract for QA rerun.
