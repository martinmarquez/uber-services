# RAT-493 Silent Run Recovery Evidence (2026-05-11)

Issue: [RAT-493](/RAT/issues/RAT-493)
Source issue: [RAT-127](/RAT/issues/RAT-127)
Target run: `4e73f53d-eb46-4e08-8539-af7b8b99084a`

## Snapshot
- `GET /api/heartbeat-runs/4e73f53d-eb46-4e08-8539-af7b8b99084a` at 2026-05-11T04:59Z shows:
  - `status = running`
  - `startedAt = 2026-05-11T03:56:10.242Z`
  - `lastOutputAt = 2026-05-11T03:56:10.580Z`
  - `finishedAt = null`
- `GET /api/heartbeat-runs/{runId}/events` returns only startup events:
  - `2026-05-11T03:56:10.576Z run started`
  - `2026-05-11T03:56:10.621Z adapter invocation`

## Recovery Attempt
- Executed `POST /api/heartbeat-runs/4e73f53d-eb46-4e08-8539-af7b8b99084a/cancel`.
- API response: `{"error":"Board access required"}`.
- Result: assignee cannot directly cancel this stale run; board/CTO lane must execute run control.

## Current RAT-127 Status
- `GET /api/issues/RAT-127` at 2026-05-11T04:59Z:
  - `status = in_progress`
  - `activeRunId = null`
  - `updatedAt = 2026-05-11T04:04:53.665Z`

## Required Unblock
- Unblock owner: board/CTO (run-control authority).
- Unblock action:
  1. cancel stale run `4e73f53d-eb46-4e08-8539-af7b8b99084a`,
  2. verify run shows terminal state (`cancelled` or `failed`),
  3. allow fresh heartbeat on `RAT-127`.

## Assignee Next Action
- After cancellation authority is executed, immediately run a fresh `RAT-127` heartbeat and post output evidence in-thread in the same window.
