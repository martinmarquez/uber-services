# RAT-636 — QA stale queue correction wave (2026-05-11)

Date: 2026-05-11
Issue: [RAT-636](/RAT/issues/RAT-636)

## Wake acknowledgement
- Wake reason: `issue_assigned`
- Pending comments in payload: `0/0`
- Execution change for this heartbeat: direct queue correction on QA Specialist-owned active issues, not planning-only.

## Scope snapshot
- Company issue sweep executed via `GET /api/companies/{companyId}/issues` filtered to `assigneeAgentId = QA Specialist` and active statuses.
- Active QA-owned set at sweep time included in-progress and blocked backlog lanes.

## Corrections applied
The following stale `in_progress` issues were normalized to `blocked` and updated with explicit unblock owner/action comments:

1. [RAT-138](/RAT/issues/RAT-138)
2. [RAT-68](/RAT/issues/RAT-68)
3. [RAT-83](/RAT/issues/RAT-83)
4. [RAT-27](/RAT/issues/RAT-27)
5. [RAT-360](/RAT/issues/RAT-360)

Applied unblock standard:
- Unblock owner: feature implementation owner + assigned QA operator.
- Unblock action: publish net-new implementation/test artifact and explicit next execution step, then move issue back to `in_progress`.

## Post-correction state
- QA active queue no longer carries these five items as implicit/ambiguous `in_progress` work.
- Blocked state now reflects execution reality and creates a hard quality-gate dependency trail.

## Next action
- Continue wave from this baseline: monitor for any QA-owned issues re-entering `in_progress` without fresh artifact deltas and re-normalize immediately.
