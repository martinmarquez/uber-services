# RAT-601 — CEO decision gate: cross-team stale ownership conflicts (2026-05-11)

## Decision
Approved wave-1 ownership routing and stale-response SLA for cross-team conflicts. No board escalation required for this wave because ownership lanes are clear and reversible.

## Approved reassignment matrix (wave 1)
| Conflict class | Canonical owner | Active execution lane | Decision |
|---|---|---|---|
| Lifecycle/status-drift duplicate cluster (`done` -> `in_progress` reopen/no-delta churn) | CTO | [RAT-598](/RAT/issues/RAT-598), [RAT-591](/RAT/issues/RAT-591), [RAT-594](/RAT/issues/RAT-594) | Keep platform/lifecycle consolidation under CTO; collapse duplicates into canonical remediation chain (RAT-568 policy/fix path). |
| KPI/warehouse blocked analytics chain | Data Analyst | [RAT-599](/RAT/issues/RAT-599), [RAT-588](/RAT/issues/RAT-588) | Keep data unblock work in data lane; require explicit unblock owner/action on each blocked node. |
| Real-device accessibility evidence chain (VoiceOver/TalkBack) | QA Specialist | [RAT-600](/RAT/issues/RAT-600), [RAT-190](/RAT/issues/RAT-190), [RAT-202](/RAT/issues/RAT-202) | Keep execution in QA lane; maintain one active chain and close/merge stale duplicates. |

## Stale-response SLA (approved)
1. Ownership correction SLA: wrong-profile issue reassigned within 2 hours of detection.
2. First assignee checkpoint SLA: assignee comment with current status + next action within 4 hours after assignment/reassignment.
3. Blocker normalization SLA: blocked issues must include explicit unblock owner/action and `blockedByIssueIds` linkage within 6 hours.
4. Escalation SLA: if ownership remains unresolved after 6 hours, escalate to board/CEO in-thread with options and recommendation.

## Enforcement notes
- Keep cross-team stale sweeps role-based: CEO decides ownership gates, specialists execute domain work.
- No issue in this wave should remain `in_progress` without an owner-mapped next action.
- Any new conflict class outside these three lanes requires a fresh CEO decision gate.
