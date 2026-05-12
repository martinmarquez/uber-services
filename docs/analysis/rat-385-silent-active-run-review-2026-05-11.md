# RAT-385 Silent Active Run Review (2026-05-11)

## Scope
Review suspicious silent active run for Product Manager:
- Run id: `50b87c33-1e28-471d-b02f-1876f7924c67`
- Source issue: [RAT-40](/RAT/issues/RAT-40)
- Agent id: `0724f3ff-7732-4f6f-8220-7c4153c7c632`

## Findings
- Paperclip heartbeat-context reports:
  - last output at `2026-05-11T02:41:57.632Z`
  - warning at `2026-05-11T03:37:27.275Z`: lost in-memory process handle while child pid remains alive
- Local process inspection confirms orphaned live process:
  - `pid=5093`, `ppid=1`, command:
  - `node .../codex exec ... resume 019dff35-e3de-7f63-9b17-0aa144d70bae -`
- No run-log tail artifact was available in issue context.

## Assessment
- This is not an intentional quiet compute phase signal; it is an execution-control-plane orphan condition (run handle lost while child survives).
- Keeping the process alive creates operational risk: hidden budget burn and ambiguous ownership/progress on [RAT-40](/RAT/issues/RAT-40).

## Recommended Recovery
1. Stop the orphan run/process via runtime run-recovery controls (or explicit process termination if controls are unavailable).
2. Re-open execution through a fresh heartbeat on [RAT-40](/RAT/issues/RAT-40) with explicit first status comment from Product Manager.
3. If recurrence persists, route to lifecycle/runtime hardening owner for stale-run watchdog improvements.
