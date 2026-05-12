# RAT-1012 — wave2 DevOps stale `in_progress` recovery cluster (2026-05-12)

## Wake context
- Issue: `RAT-1012`
- Reason: `issue_assigned`
- Scope: recover DevOps-owned stale `in_progress` issues (no active/execution run) in wave2.

## Goal-gate and governance checks
- `PRODUCT_BRIEF.md` present: infra resource gate satisfied.
- `DEPLOY_CONFIG.md` present and used as canonical deployment/ownership source.
- No infra budget or domain/DNS change was requested in this heartbeat.

## Recovery criteria used
Stale candidate definition:
1. `assigneeAgentId == DevOps agent`
2. `status == in_progress`
3. `activeRun == null` and `executionRunId == null`
4. `updatedAt` age >= 2h
5. Excluded current active issue `RAT-1012`

## Concrete action executed
- Pulled live issue snapshot via `GET /api/companies/{companyId}/issues?limit=500`.
- Applied recovery transition for stale candidates via `PATCH /api/issues/{id}` to `status=blocked`.
- Posted unblock-owner/action comment via `POST /api/issues/{id}/comments`.

## Results
Candidates recovered in this pass:
- `RAT-401` (`in_progress -> blocked`) — success
- `RAT-723` (`in_progress -> blocked`) — success
- `RAT-713` (`in_progress -> blocked`) — success

Mutation receipt artifact:
- `qa/test-results/rat-1012-devops-stale-inprogress-recovery-2026-05-12T035918Z.txt`

## Next action
1. Re-run stale-cluster detector on next wake to verify no new DevOps stale `in_progress` rows reappear.
2. If recurrence is detected, open a control-plane child issue for automatic stale-state enforcement at transition time (preventive guardrail).
