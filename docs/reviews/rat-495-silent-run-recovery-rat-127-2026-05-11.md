# RAT-495 Silent Run Recovery Evidence (RAT-127)

## Scope
- Recovery issue: [RAT-495](/RAT/issues/RAT-495)
- Source issue: [RAT-127](/RAT/issues/RAT-127)
- Silent run under investigation: `4e73f53d-eb46-4e08-8539-af7b8b99084a`
- Recovery run invoked: `d0cc14d6-eef7-4ce8-a8d1-86d2c6610f37`

## Evidence (2026-05-11T04:59Z)
- Source run record for `4e73f53d...` on [RAT-127](/RAT/issues/RAT-127):
  - `status=running`
  - `startedAt=2026-05-11T03:56:10.242Z`
  - `finishedAt=null`
  - `lastUsefulActionAt=null`
  - `livenessState=null`, `watchdogState=null`
- Source issue state mismatch at inspection time:
  - [RAT-127](/RAT/issues/RAT-127) remained `in_progress`
  - `executionHeartbeatAt=null`
  - `executionSummary=null`
- Manual recovery action executed:
  - `POST /api/agents/{agentId}/heartbeat/invoke` with reason `manual_recovery_for_stale_run_4e73f53d`
  - New run created: `d0cc14d6-eef7-4ce8-a8d1-86d2c6610f37`
  - New run metadata: `invocationSource=on_demand`, `status=running`, `startedAt=2026-05-11T04:59:11.476Z`

## Security/Governance Assessment
- Classification: stale/silent execution telemetry requiring explicit recovery evidence.
- Risk: prolonged null liveness on `running` runs can hide stuck execution and delay security hardening delivery.
- Control applied: manual recovery invoke to force fresh execution heartbeat path and auditable run lineage.

## Next Action
1. Track [RAT-127](/RAT/issues/RAT-127) for a new assignee update or terminal run state linked to `d0cc14d6...`.
2. If no useful progress signal appears, escalate in parent issue [RAT-489](/RAT/issues/RAT-489) and request watchdog remediation scope.
