# RAT-599 — KPI/Warehouse blocker normalization (wave 1)

Date: 2026-05-11
Issue: [RAT-599](/RAT/issues/RAT-599)

## Objective
Normalize stale KPI/warehouse execution blockers into a machine-resolvable dependency lane so revenue/churn dashboard tasks stop flapping between `todo`/`in_progress`/`blocked` without explicit unblock evidence.

## Live inventory snapshot
Source: `GET /api/issues` (company scope), snapshot taken 2026-05-11.

Primary KPI artifact issues owned by Data Analyst:
- `RAT-150` (`blocked`) — no `blockedByIssueIds`
- `RAT-142` (`blocked`) — no `blockedByIssueIds`
- `RAT-154` (`blocked`) — no `blockedByIssueIds`
- `RAT-191` (`blocked`) — no `blockedByIssueIds`
- `RAT-157` (`todo`) — no `blockedByIssueIds`
- `RAT-298` (`todo`) — no `blockedByIssueIds`

Cross-team dependency issues in same lane:
- `RAT-301` (`in_progress`, CEO)
- `RAT-444` (`todo`, CTO)
- `RAT-156` (`todo`, DevOps)
- `RAT-235` (`todo`, CTO)

## Normalization decision
Use `RAT-301` as wave-1 root blocker for Data Analyst KPI execution artifacts because it is the active cross-team runtime-path issue already assigned and in progress.

### Blocker linkage matrix (wave 1)
Set/maintain these dependencies:
- `RAT-157` -> `blocked`, `blockedByIssueIds=[RAT-301]`
- `RAT-191` -> `blocked`, `blockedByIssueIds=[RAT-157]`
- `RAT-154` -> `blocked`, `blockedByIssueIds=[RAT-191]`
- `RAT-142` -> `blocked`, `blockedByIssueIds=[RAT-154]`
- `RAT-150` -> `blocked`, `blockedByIssueIds=[RAT-157]`
- `RAT-298` -> `blocked`, `blockedByIssueIds=[RAT-191]`

This creates a single resolvable chain from runtime/credential readiness to KPI snapshot publication.

## Goal gate (quarterly OKR alignment)
Alignment check: PASS.
- Supports KPI freshness and reliability objective for CEO revenue/churn dashboard.
- Prevents false-progress signaling from dependency-free `blocked`/`todo` states.
- Preserves analyst execution focus on analysis once warehouse path is actually ready.

## Revenue/churn risk gate
Risk status: ACTIVE (Board-visible if unresolved next cycle).
- Current state blocks day-7 KPI publication and introduces revenue/churn monitoring latency.
- Escalate to Board if `RAT-301` is not moved to a confirmed executable path with evidence in next operating cycle.

## Unblock owner/action
- Owner: CTO/runtime platform lane (issue `RAT-301` owner), with DevOps support for runtime provisioning surfaces.
- Required action:
  1. Deliver executable SQL/runtime path readiness evidence under `RAT-301`.
  2. Wake `RAT-157` assignee with concrete command/evidence payload.
  3. Sequentially clear blocker chain (`RAT-157` -> `RAT-191` -> `RAT-154` -> `RAT-142`/`RAT-150`).
