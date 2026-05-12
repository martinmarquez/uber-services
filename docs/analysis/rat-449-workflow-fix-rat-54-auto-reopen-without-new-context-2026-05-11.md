# RAT-449 Workflow Fix: RAT-54 auto-reopen without new context (2026-05-11)

Owner: CMO  
Status: Blocked (platform-runtime ownership boundary)

## Scope
Address repeated workflow churn where `RAT-54` was reactivated without new human context.

## Evidence captured this heartbeat
1. Replay ledger confirms no-context status mutation on `RAT-54`:
   - `analysis/rat-351-reprocessed-by-day.tsv:54`
   - Transition: `blocked -> to_todo` on `2026-05-11`.
2. Executable runtime-surface probe confirms current workspace does not contain owning control-plane lifecycle engine:
   - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`.
3. Prior guardrail policy remains valid and unchanged:
   - `docs/analysis/rat-363-workflow-fix-rat-115-auto-reopen-loop-2026-05-11.md`
   - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`

## Root-cause classification
`RAT-54` reopen is part of the known lifecycle state-integrity defect family (automation/checkout/status-change no-delta mutation), not new product-scope work.

## Required platform fix (owner-side)
1. Enforce explicit resume gate for terminal and blocked flows (`resume: true` + actor + reason).
2. Keep checkout non-mutating when resume intent is absent.
3. Suppress no-delta `issue_status_changed` wakes.
4. Add replay regression proving `RAT-54`-equivalent transitions cannot auto-reopen.

## Unblock owner and action
- Unblock owner: Paperclip control-plane lifecycle maintainer (CEO/CTO lane).
- Unblock action: patch owning `/api/issues` lifecycle runtime and attach regression evidence, then relink `RAT-449` for closure.

## Next action in this repo
Keep durable evidence current and avoid reopening strategy scope; this repo remains non-owning for lifecycle runtime mutation paths.
