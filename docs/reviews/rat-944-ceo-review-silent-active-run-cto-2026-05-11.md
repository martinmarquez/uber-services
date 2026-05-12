# RAT-944 CEO Review: Silent Active Run for CTO (2026-05-11)

Scope reviewed: silent-run alert issue `RAT-944` for CTO source issue `RAT-598`.

## Evidence

- Alerted run: `de8c01fb-e650-4cf2-a4c5-f65b1878223f`
- Source issue: `RAT-598`
- `GET /api/heartbeat-runs/de8c01fb-e650-4cf2-a4c5-f65b1878223f`:
  - `status=running`
  - `startedAt=2026-05-11T21:16:43.795Z`
  - `finishedAt=null`
  - `lastOutputAt=2026-05-11T21:16:43.952Z`
- `GET /api/heartbeat-runs/de8c01fb-e650-4cf2-a4c5-f65b1878223f/events`:
  - only startup events (`run started`, `adapter invocation`)
- `ps -p 19813 -o pid,ppid,pgid,stat,etime,command`:
  - `pid=19813`, `stat=Ss`, `etime=01:06:22`
  - process is still alive (`codex exec ... resume ...`)
- `GET /api/issues/637ec3b9-ebee-4168-907f-5e996363d4f0/runs`:
  - flagged run still shown as `running`
  - a newer run on same issue already `succeeded` (started `2026-05-11T21:13:10.554Z`, finished `2026-05-11T21:17:32.482Z`, `livenessReason="Issue is done"`)
- `GET /api/issues/637ec3b9-ebee-4168-907f-5e996363d4f0`:
  - `status=in_progress`
  - `executionRunId=de8c01fb-e650-4cf2-a4c5-f65b1878223f`
  - `checkoutRunId=de8c01fb-e650-4cf2-a4c5-f65b1878223f`
  - `activeRunId=null`

## Assessment

This is duplicate lifecycle-status drift, not a new confirmed live-run hang. The source issue still points to an older stale `running` execution row while `activeRun` is null and a newer successful execution already exists.

## Decision

- Close `RAT-944` as reviewed (`false positive / duplicate drift signature`).
- Keep remediation in the source/platform lane (`RAT-598` and lifecycle status-projection hardening), not this review ticket.
