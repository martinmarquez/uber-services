# RAT-406 Status Drift Correction (2026-05-11)

## Trigger
- Wake reason: `issue_status_changed`
- Pending comments: `0/0`
- No new scope/evidence/blocker/assignee delta provided.

## Decision
RAT-406 remains a duplicate/non-canonical lane per prior closure decision.

- Canonical remediation: `RAT-568`
- Sweep coordination: `RAT-594`
- Reopen gate prerequisite: `RAT-383` complete plus fresh issue-specific drift evidence.

## Correction
- Treat this reopen as lifecycle status drift, not new implementation work.
- Keep RAT-406 in closed/duplicate posture; do not execute runtime guardrail implementation from this lane.

## Next Action
- Continue execution and proof collection in canonical lane (`RAT-568`).
- Only resume RAT-406 if post-fix evidence shows a distinct unresolved defect not covered by RAT-568.
