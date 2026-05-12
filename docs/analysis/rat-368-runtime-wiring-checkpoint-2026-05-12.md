# RAT-368 runtime wiring checkpoint (2026-05-12)

## Wake delta handled
- Wake reason: `issue_children_completed`.
- No pending comments/scope deltas in wake payload.

## Concrete work completed in this heartbeat
1. Added executable acceptance probe:
- `tools/guardrails/check-rat-368-reopen-loop-runtime-wiring.sh`
2. Captured fresh evidence artifact:
- `qa/test-results/rat-368-runtime-wiring-check-2026-05-12.txt`

## Probe contract
- `RESULT=BLOCKED_WRONG_REPO`: owning control-plane lifecycle runtime signatures are absent in this workspace.
- `RESULT=BLOCKED_RUNTIME_NOT_WIRED`: runtime surface exists but RAT-368 guardrail calls are not wired.
- `RESULT=PASS_RUNTIME_WIRED`: runtime surface exists and explicit guardrail wiring is detected.

## Current result
- `RESULT=BLOCKED_WRONG_REPO`
- `DETAIL=No control-plane lifecycle runtime signatures found in server/*`

## Unblock owner/action
- Owner: control-plane runtime maintainer (repo that owns `/api/issues` lifecycle mutation + wake dispatch).
- Action: wire RAT-368 guardrail calls in runtime and re-run this probe from the owning repo until `RESULT=PASS_RUNTIME_WIRED`.
