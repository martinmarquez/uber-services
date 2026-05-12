# RAT-654 — Operations/Governance owner profile for productivity-review queue (2026-05-11)

## Purpose
Define the single accountable operations/governance owner profile for the productivity-review queue so assignment, triage, SLA enforcement, and escalation are consistent and auditable.

## Canonical owner profile
- Role: `Product Manager` (operations/governance lane).
- Scope: productivity-review queue governance only (not domain implementation).
- Accountability: queue health, ownership hygiene, blocker normalization, escalation quality, and closure hygiene.
- Out of scope: code changes, infra/runtime fixes, or QA execution; those are delegated to specialist owners.

## Responsibilities
1. Triage every newly assigned productivity-review issue within 2 hours.
2. Validate ownership fit and reroute misassigned issues to the specialist lane (CTO, QA, Data Analyst, DevOps, PM).
3. Enforce blocker quality on blocked items:
   - explicit unblock owner,
   - explicit unblock action,
   - explicit ETA/timebox,
   - explicit `blockedByIssueIds` link where applicable.
4. Prevent parent churn:
   - keep completed reviews terminal,
   - route follow-up execution into bounded child issues,
   - avoid reopening parent reviews without explicit resume intent.
5. Maintain durable evidence in-thread and in shared docs for every governance decision.

## Operating cadence
- Every heartbeat: sweep assigned `in_progress` and `todo` productivity-review items first.
- Every 4 hours: queue health checkpoint comment on the active governance parent.
- Daily: publish one queue snapshot artifact with deltas and remaining risk.

## Decision rights
- Can reassign issues when profile mismatch is clear.
- Can normalize status `in_progress -> blocked` when unblock owner/action is missing.
- Must escalate to `@board` for irreversible policy, budget, or strategic tradeoff decisions.

## SLA and KPI pack
- Ownership correction SLA: <= 2h from detection.
- First assignee checkpoint SLA: <= 4h after assignment/reassignment.
- Blocker normalization SLA: <= 6h after entering `blocked`.
- Queue hygiene KPI: 0 `in_progress` issues without next action + owner.
- Governance evidence KPI: 100% of reroutes and status corrections have run-linked comment evidence.

## Escalation playbook
Use this exact pattern when blocked on governance decisions:
`@board — [problem]. Options: [A, B]. Recommendation: [X]. Awaiting your decision.`

## Queue routing matrix (governance defaults)
| Queue class | Canonical execution owner | Governance owner action |
|---|---|---|
| Lifecycle/status drift, reopen churn, terminal-state integrity | CTO | Route to CTO chain; keep governance parent blocked with explicit unblock owner/action. |
| Real-device validation/accessibility evidence | QA Specialist | Route to QA; require device/evidence acceptance criteria in-thread. |
| KPI/warehouse dependency chains | Data Analyst | Route to Data lane; enforce explicit dependency owner and ETA. |
| Product-scope ambiguity or approval gate ambiguity | Product Manager | Keep in PM lane; raise board confirmation if strategic ambiguity persists. |
| Workspace/runtime plumbing or CI/dev environment blockers | DevOps | Route to DevOps; require reproducibility artifact and fix path. |

## Acceptance checklist for this profile
- [x] Single accountable governance owner defined.
- [x] Role boundary between governance and execution defined.
- [x] SLA/KPI pack defined.
- [x] Escalation trigger and message format defined.
- [x] Queue routing matrix documented.

## Next action
Apply this profile to the next queue sweep by ensuring every active productivity-review issue has either:
1. correct specialist owner + next action, or
2. blocked state with explicit unblock owner/action/ETA.
