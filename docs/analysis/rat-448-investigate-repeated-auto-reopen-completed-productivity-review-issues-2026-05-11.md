# RAT-448 Investigation: repeated auto-reopen of completed productivity review issues (2026-05-11)

## Scope
Investigate why completed productivity review issues continue reopening without explicit resume intent.

## Evidence captured
1. Wake payload for `RAT-448` arrived as `issue_assigned` with `0/0` pending comments and no inline blocker/comment deltas.
2. Lifecycle surface probe in this repository:
   - Command: `bash tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane lifecycle reopen signatures found in server/*`
3. Reopen-churn ledger probe (local reproducible signal):
   - Command: `bash tools/guardrails/check-rat-448-productivity-review-reopen-ledger.sh`
   - Result: `RESULT=REOPEN_PATTERN_CONFIRMED`
   - Key output:
     - `done_to_todo_count=105`
     - `blocked_to_todo_count=36`
     - `target_done_to_todo=yes`
     - `target_line=2026-05-11 ... RAT-285 done to_todo`
4. Prior same-day investigations show the same defect family and ownership boundary:
   - `docs/analysis/rat-459-fix-repeated-auto-reopen-completed-productivity-review-issues-2026-05-11.md`
   - `docs/analysis/rat-460-investigate-repeated-auto-reopen-on-completed-productivity-review-issues-2026-05-11.md`

## Root-cause classification
This is recurrent lifecycle state-drift/reopen churn in the Paperclip control-plane runtime, not a new product-repo defect.

## Required upstream fix
1. Terminal immutability gate: prevent `done`/`cancelled` reopen unless mutation includes explicit `resume: true` with actor and reason.
2. Checkout and status-only automation must be non-mutating on terminal issues when resume intent is absent.
3. No-delta dedupe for `issue_status_changed` automation to prevent repeated reopen churn.
4. Replay regression proving:
   - terminal + no resume => no reopen,
   - checkout/no resume => no terminal mutation,
   - explicit resume => audited reopen only.

## Disposition for RAT-448
- Status recommendation: `blocked`.
- Unblock owner: board/runtime lifecycle maintainer.
- Unblock action: deploy lifecycle guardrails in the owning control-plane repo and attach replay evidence for RAT-448-equivalent scenarios.
- Wave-1 stale sweep closure policy (comment `6c1163e9-f783-486e-9568-5d8e92fa8963`, 2026-05-11):
  - RAT-448 is a duplicate lifecycle/status-drift lane.
  - Canonical remediation remains [RAT-568](/RAT/issues/RAT-568).
  - Cluster execution sweep is tracked in [RAT-594](/RAT/issues/RAT-594).
  - Reopen RAT-448 only on fresh RAT-448-specific drift evidence after RAT-568 implementation plus QA gate [RAT-383](/RAT/issues/RAT-383) completion.

## Verification notes
- Validated one concrete scenario from scoped request:
  - `RAT-285` appears in the churn ledger as `done -> to_todo` on `2026-05-11`, matching the unexpected reopen pattern.
- Validation is reproducible in this repo via:
  - `tools/guardrails/check-rat-448-productivity-review-reopen-ledger.sh [RAT-ID]`

## Next action
- Keep RAT-448 non-executable until canonical lane exits:
  1. control-plane owner ships RAT-568 lifecycle guardrails,
  2. QA closes RAT-383 gate,
  3. sweep validation runs under RAT-594.

## Handoff checkpoint (2026-05-11, finish_successful_run_handoff)
- Lifecycle disposition for RAT-448 in this repo remains `blocked` (duplicate lane, no local control-plane mutation surface).
- Unblock owner: control-plane lifecycle maintainer.
- Unblock action: complete `RAT-568` implementation, pass QA gate `RAT-383`, execute cluster sweep `RAT-594`, then reopen RAT-448 only if fresh RAT-448-specific drift evidence still reproduces.
- No additional local implementation is valid before that gate sequence completes.
