# RAT-774 Terminal Persistence Replay Evidence (2026-05-11)

## Context
Control-plane `/api/issues` runtime is not present in this repository. To leave executable progress in this workspace, a dispatcher-like replay harness was added and executed using the RAT-774 persistence guard helpers.

## Harness
- Script: `tools/guardrails/replay-rat-774-productivity-terminal-persistence.sh`
- Purpose: persist terminal snapshot, read it back, apply wake dedupe decision, and enforce reopen mutation gate under drifted active state.

## Command
```bash
RAT_774_ISSUE_ID=RAT-349 tools/guardrails/replay-rat-774-productivity-terminal-persistence.sh
```

## Result
- Output artifact: `qa/test-results/rat-774-terminal-persistence-replay-2026-05-11.txt`
- Terminal verdict: `RESULT=PASS_TERMINAL_PERSISTENCE_GUARD`

## Next action
- Runtime owner should import the same helper calls in the authoritative `/api/issues` dispatcher lifecycle path:
  1. Persist terminal state on productivity-review terminal transitions.
  2. Read persisted state before wake/mutation decisions.
  3. Emit dedupe telemetry when wake is suppressed.
