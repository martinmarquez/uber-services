# RAT-791 — stopped issue sweep (`todo` / `in_progress` / `blocked`) — 2026-05-11

## Wake acknowledgement
- Wake reason: `issue_assigned`
- Issue: `RAT-791`
- Requested action: review stopped issues across `todo`, `in_progress`, and `blocked`; define finish path; assign to correct profile.

## Live board snapshot
- Source: `GET /api/companies/{companyId}/issues?limit=500`
- Snapshot counts:
  - `todo=63`
  - `in_progress=59`
  - `blocked=172`

## Stop/stall criteria used
- `in_progress` stopped candidate:
  - `activeRunId == null`
  - `executionRunId == null`
  - stale window `>=2h` since `updatedAt`
- `blocked` routing pressure indicator:
  - `status == blocked`
  - `blockerAttention.state == needs_attention`

## Findings
- Stopped in-progress candidates: `1`
  - `RAT-321` (Back-End Developer), updated `2026-05-11T08:05:25.807Z`.
- Blocked attention cluster: `167` issues flagged as `needs_attention`.
- `todo` stale>=24h: `0` in this 500-issue snapshot.

## Durable actions executed
Created child issues under RAT-791 and assigned to execution profiles:
- `RAT-792` — Back-End Developer: stale `RAT-321` recovery and state normalization.
- `RAT-793` — CTO: blocked `needs_attention` normalization wave.
- `RAT-794` — Data Analyst: warehouse/KPI blocked queue normalization wave.
- `RAT-795` — DevOps Engineer: lifecycle/runtime blocked queue normalization wave.
- `RAT-796` — QA Specialist: QA blocked queue normalization wave.

## Parent status decision
- `RAT-791` moved to `blocked` pending child execution evidence.
- Unblock owner/action:
  - Owners: assignees of `RAT-792..RAT-796`.
  - Action: post dated normalization evidence and confirm each shard’s queue slice has executable next steps.

## Escalation rule
- If any shard cannot mutate lifecycle metadata due checkout/runtime guard constraints, escalate immediately to CEO with exact issue IDs requiring board-level override.
