# RAT-445 Heartbeat: Guard done issues from auto-resume on status/blocker wakes (2026-05-11)

## Wake Context
- Reason: `issue_assigned`
- Issue: `RAT-445`
- Pending comments: `0/0`
- Latest comment: none (no new human scope delta)

No new thread comment changed scope in this wake. Execution stayed on direct implementation path for the assigned defect.

## Goal and Scope
Prevent `done` issues from being auto-resumed by status/blocker wake processing unless resume intent is explicit and auditable.

## Action Taken
1. Searched this assigned workspace (`/Users/martinmarquez/uber-services`) for owning control-plane lifecycle mutation code paths:
   - issue transition engine for `/api/issues`
   - checkout/status mutation logic
   - wake dedupe handling for `issue_status_changed` and blocker/status wake classes
2. Confirmed those control-plane lifecycle runtime modules are not present in this repository.
3. Validated this is the same defect family already documented in prior RAT investigations (terminal state drift and auto-reopen without explicit resume intent).

## Result
`RAT-445` is actionable in principle but **implementation-blocked in this workspace** because the owning runtime is outside this repository boundary.

## Required Unblock Owner/Action
- **Unblock owner:** Paperclip control-plane lifecycle runtime maintainer
- **Required action:** implement guardrails in owning runtime so that:
  1. `done`/terminal issues remain terminal by default;
  2. resume/reopen requires explicit `resume:true` with actor+reason provenance;
  3. status/blocker no-delta wakes do not mutate terminal issues;
  4. replay/regression evidence is attached for done+status wake and done+blocker wake scenarios.

## Verification Performed in This Heartbeat
- Repository-level ownership/path verification only (no surrogate patch in non-owning app repo).

## 2026-05-11 Addendum (issue_reopened_via_comment)
- New thread instruction (`2f17d736-f95c-464a-a118-d45c70e05700`) marks RAT-445 as duplicate lifecycle/status-drift lane for wave-1 stale sweep closure.
- Canonical remediation is routed to `RAT-568`; cluster execution sweep is tracked in `RAT-594`; QA gate dependency is `RAT-383`.
- Decision for this issue lane: keep RAT-445 closed/non-executing unless fresh issue-specific drift evidence is produced after RAT-568 implementation and RAT-383 completion.
- This heartbeat performs governance/documentation normalization only; no local runtime code patch is applied in this repo.

## 2026-05-11 DevOps heartbeat (ownership-correction execution)

- Acknowledged reassignment to DevOps/Platform and shipped executable guardrail patch in `tools/guardrails/issueLifecycleGuard.js`.
- Added terminal wake dedupe branch for wake reasons `issue_status_changed` and `issue_blockers_resolved` when no comment delta exists.
- New dedupe code emitted for dispatcher logging: `dedupe_terminal_resume_wake_without_comment_delta`.
- Added and updated focused tests in `tools/guardrails/issueLifecycleGuard.test.js`:
  - done + `issue_status_changed` + no comment delta => dedupe
  - done + `issue_blockers_resolved` + no comment delta => dedupe
  - active (`blocked`) + `issue_blockers_resolved` => still emits (no regression on active wake behavior)
- Verification command:
  - `node --test tools/guardrails/issueLifecycleGuard.test.js`
  - Result: PASS (26/26)

## 2026-05-11 DevOps heartbeat (process_lost_retry continuation)

- Implemented dispatcher-ready dedupe logging helper in `tools/guardrails/issueLifecycleGuard.js`:
  - `buildWakeDedupeLogPayload(input, decision)` returns structured log payload when wake is deduped, including `dedupeReasonCode`.
- This standardizes wake-skip telemetry so dispatcher code can log dedupe reason with one call.
- Added focused tests in `tools/guardrails/issueLifecycleGuard.test.js`:
  - deduped wake => structured `issue_wake_deduped` payload with `dedupe_terminal_resume_wake_without_comment_delta`
  - non-deduped wake => `null`
- Verification:
  - `node --test tools/guardrails/issueLifecycleGuard.test.js`
  - Result: PASS (31/31)

## 2026-05-11 DevOps heartbeat (issue_children_completed continuation)

- Added executable integration-contract check script:
  - `tools/guardrails/check-rat-445-dispatcher-dedupe-contract.sh`
- Purpose:
  - Assert local guard contract required by dispatcher logging is present (`buildWakeDedupeLogPayload` + dedupe reason code).
  - Emit explicit readiness result for external control-plane owner.
- Execution result:
  - `RESULT=READY_FOR_EXTERNAL_DISPATCHER_INTEGRATION`
  - `DETAIL=Guard contract is present locally; control-plane dispatcher surface is external to this repository`
- Concrete next action for unblock owner:
  - In control-plane dispatcher runtime, call `buildWakeDedupeLogPayload(input, decision)` when wake dedupe returns `emit=false`, and emit payload to lifecycle telemetry sink.

## 2026-05-11 DevOps handoff (RAT-556 state correction sweep)

- Wake/comment acknowledged: issue was moved from `in_progress` to `todo` due stale execution handle (>2h) under RAT-556 state-correction policy.
- Re-checkout handoff by assignee is explicit and accepted for RAT-445.

Current implementation state in this repo:
- Done: terminal wake dedupe guard for `issue_status_changed` + `issue_blockers_resolved` with no comment delta.
- Done: dispatcher-ready dedupe log payload helper (`buildWakeDedupeLogPayload`) and regression tests.
- Done: executable contract checker reports `READY_FOR_EXTERNAL_DISPATCHER_INTEGRATION`.

Open dependency (unchanged):
- Unblock owner: control-plane lifecycle runtime maintainer.
- Required action: wire dispatcher wake-skip path to call `buildWakeDedupeLogPayload(input, decision)` and emit payload to lifecycle telemetry sink.

Assignee next action on re-checkout:
1) Confirm control-plane owner accepted the integration contract and has implementation issue/PR link.
2) If yes, link that evidence in RAT-445 and move to `blocked` on upstream dependency.
3) If no owner acknowledgment exists, raise explicit escalation comment naming owner + action + due checkpoint.

## 2026-05-12 DevOps readiness checkpoint (issue_children_completed)

- Trigger: child productivity reviews completed (`RAT-858`, `RAT-979`) with productive verdict; heartbeat requires concrete forward progress.
- Re-ran integration contract check:
  - `tools/guardrails/check-rat-445-dispatcher-dedupe-contract.sh`
  - Result: `READY_FOR_EXTERNAL_DISPATCHER_INTEGRATION`
  - Detail: local guard + dedupe logging contract is present; dispatcher wiring surface remains outside this repo.

Disposition checkpoint:
- Keep RAT-445 in dependency-blocked state until control-plane lifecycle maintainer links dispatcher integration evidence (issue/PR/commit) that logs `dedupeReasonCode` from `buildWakeDedupeLogPayload` on wake skip.
- Once linked, RAT-445 can move directly to `done` with no additional local code changes required in this workspace.
