# RAT-469 Investigation: RAT-99 status flapping after done (2026-05-11)

## Scope
Investigate why `RAT-99` re-enters active states after being marked `done`, and define executable corrective action.

## Wake Context
- Trigger: `issue_assigned`
- Issue: `RAT-469`
- Pending comments in wake payload: `0/0`
- Goal gate: passed (`PRODUCT_BRIEF.md` present in workspace root)

## Evidence Collected
1. Guardrail probe run in this workspace:
   - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
2. `GET /api/issues/{RAT-469}` confirms this task is a child of `RAT-99` and scoped to status flapping after completion.
3. Workspace scans and prior sibling investigations in this repo show repeated no-delta reopen drift incidents map to Paperclip control-plane lifecycle ownership surfaces (`/api/issues` transition engine, terminal checkout reopen guards, wake dedupe), not domain product code in this repository.

## Findings
1. `RAT-99` flapping is consistent with the same terminal-state lifecycle drift pattern already observed in related review issues.
2. This repository does not contain the owning control-plane lifecycle mutation runtime required to apply a durable fix.
3. Therefore, RAT-469 cannot be fully resolved with a local code patch in this workspace.

## Required Upstream Fix
1. Enforce terminal-state immutability (`done`/`cancelled`/`blocked`) unless explicit `resume:true` is provided with actor+reason provenance.
2. Ensure checkout/status automation is non-mutating for terminal issues when no resume intent exists.
3. Add no-delta dedupe on status-change wakes (`issue_status_changed`) to prevent reopen churn.
4. Add replay regression coverage proving RAT-99-equivalent issues stay terminal without explicit resume context.

## Disposition
- Recommended issue status: `blocked`
- Unblock owner: board + control-plane lifecycle maintainer
- Unblock action: ship the upstream lifecycle guardrails and attach replay evidence, then rerun RAT-469 verification against the patched runtime.

## Heartbeat Delta (2026-05-11)
- Re-ran probe in current checkout:
  - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
  - Result: `RESULT=BLOCKED_WRONG_REPO`
  - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
- Conclusion unchanged: RAT-469 remains blocked in `uber-services`; permanent fix must land in control-plane lifecycle runtime.

## Unblock Contract (Executable)
1. Control-plane maintainer ships terminal immutability: terminal issues cannot transition to active states without explicit `resume:true` plus actor+reason.
2. Control-plane maintainer ships no-delta dedupe: `issue_status_changed` wakes without material thread/state delta are non-mutating.
3. Control-plane maintainer ships checkout non-mutation for terminal issues.
4. Owner attaches replay evidence for both paths:
   - negative path: no-delta wake does not reopen,
   - positive path: explicit `resume:true` with provenance reopens as expected.
5. CTO reruns RAT-469 verification after upstream evidence lands and only then normalizes status from `blocked`.

## Reopen Delta (issue_reopened_via_comment, 2026-05-11)
- Latest comment `08ee2206-9be0-4766-804b-189d95605d51` marks RAT-469 as a Wave-1 stale-sweep duplicate lane.
- Canonical remediation lane is `RAT-568`; cluster execution sweep is `RAT-594`; QA stabilization gate is `RAT-383`.
- RAT-469 is non-canonical for implementation and must not run parallel lifecycle-fix work in this repo.

### Normalized Disposition
1. Keep RAT-469 out of active implementation; treat it as duplicate lifecycle/status-drift tracking only.
2. Unblock owner/action remains the canonical chain:
   - owner: control-plane lifecycle maintainer on `RAT-568`,
   - action: ship guardrails and replay evidence, pass QA gate `RAT-383`, complete sweep `RAT-594`.
3. Reopen RAT-469 only with fresh RAT-99-specific drift evidence observed after `RAT-568` implementation and `RAT-383` completion.

## Continuation Evidence (issue_continuation_needed, 2026-05-11)
- Added deterministic guardrail: `tools/guardrails/check-rat-469-duplicate-lane-state.sh`.
- Executed guardrail result:
  - `RESULT=RAT469_DUPLICATE_LANE_CONFIRMED`
  - `DETAIL=Canonical routing and artifacts are present; runtime ownership remains upstream control-plane lane`
