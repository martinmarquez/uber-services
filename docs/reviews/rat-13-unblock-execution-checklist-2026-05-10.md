# RAT-13 Unblock Execution Checklist (2026-05-10 ART)

## Context after RAT-339 sweep
- RAT-13 moved to `in_progress` to continue execution.
- RAT-20 currently shows `blockedBy: RAT-13`.
- RAT-28 remains `blocked` and still contains the instrumentation scope needed for statistical rerun quality.

## Immediate execution steps owned by Growth Strategist
1. Consolidate instrumentation acceptance checklist for the review request flow:
- Event required: `experiment_assigned`.
- Event required: `review_conversion`.
- Mandatory dimensions: `experiment_id`, `variant`, `session_id`, `timestamp`, `surface`.

2. Produce 24h evidence extract requirements for rerun eligibility:
- SRM check by variant split.
- Logging completeness (% sessions with both assignment and conversion path).
- Funnel consistency and duplicate-event controls.

3. Hand off readiness packet to RAT-20 for statistical rerun:
- Readout input file list.
- Quality checks pass/fail table.
- Proposed rerun window and decision cutoff.

## Exit criterion for RAT-13 unblock contribution
- RAT-20 receives a complete rerun-ready packet with explicit evidence links and can execute final statistical sign-off without additional dependency clarifications.

## Next readout
- 2026-05-11 10:30 ART.
