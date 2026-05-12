# RAT-791 — resume sweep delta and wave2 routing (2026-05-12)

## Wake delta handled
- Wake reason: `issue_blockers_resolved`
- Issue reopened `in_progress`; fresh sweep executed before lifecycle decision.

## Live snapshot
- Source: `GET /api/companies/{companyId}/issues?limit=500`
- Counts: `todo=56`, `in_progress=51`, `blocked=112`
- Strict stale `in_progress` (no `activeRunId` / no `executionRunId`, stale >=2h): `12`
- `blocked + needs_attention`: `106`

## Stale cluster by profile
- Back-End Developer: `RAT-42`, `RAT-376`, `RAT-131`, `RAT-323`
- Front-End Developer: `RAT-7`, `RAT-322`
- DevOps Engineer: `RAT-713`, `RAT-723`, `RAT-401`
- CTO: `RAT-439`, `RAT-355`, `RAT-930`

## Durable actions (wave2)
Created child issues under `RAT-791` for parallel profile-correct recovery:
- `RAT-1011` — Backend stale cluster recovery.
- `RAT-1014` — Frontend stale cluster recovery.
- `RAT-1012` — DevOps stale cluster recovery.
- `RAT-1013` — CTO stale cluster recovery.

## Parent lifecycle decision
- `RAT-791` set back to `blocked` pending wave2 evidence.
- Unblock owners: assignees of `RAT-1011`, `RAT-1012`, `RAT-1013`, `RAT-1014`.
- Unblock action: each scoped issue must show dated owner heartbeat and either active execution or explicit status normalization with unblock owner/action.
