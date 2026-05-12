# RAT-461 Heartbeat: fix productivity-review auto-reopen churn for terminal source issues (2026-05-11)

## Objective
Stop repeated auto-reopen churn affecting terminal productivity-review source issues.

## Wake handling
- Wake reason: `issue_assigned`.
- Pending comments in payload: `0/0`.
- No new human directive was included in this wake batch, so this heartbeat executed the implementation-path validation directly.

## Heartbeat evidence
1. Executed runtime-ownership guardrail:
   - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
2. Repository lineage remains consistent with adjacent issues (`RAT-459`, `RAT-460`, `RAT-462`): this workspace does not own the Paperclip issue lifecycle mutation engine that performs reopen transitions.

## Decision
`RAT-461` cannot be fixed directly in this repository because the defect surface is upstream in the control-plane lifecycle runtime.

## Required unblock owner and action
- Owner: Paperclip control-plane lifecycle maintainer.
- Required action:
1. Enforce terminal-state immutability (`done`/`cancelled` cannot reopen without explicit `resume:true` plus actor/reason provenance).
2. Ensure checkout/status-only automation paths are non-mutating for terminal issues when resume intent is absent.
3. Dedupe no-delta status-change wake paths (`issue_status_changed`) to prevent repeated reopen loops.

## Verification required before close
1. Replay evidence: terminal issue + automation/no-resume does not reopen.
2. Replay evidence: terminal issue + checkout/no-resume does not reopen.
3. Replay evidence: explicit `resume:true` with auditable reason does reopen.
4. Replay evidence: repeated no-delta wakes do not create reopen churn for RAT-461-equivalent fixtures.
