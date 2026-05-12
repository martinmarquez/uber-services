# RAT-406 Heartbeat: anti-reopen guardrail in control-plane lifecycle runtime (2026-05-11)

## Scope
Issue: `RAT-406` (high priority)

Objective: implement anti-reopen guardrail in the control-plane lifecycle runtime so terminal issues do not reopen without explicit resume intent.

## Action Taken
1. Validated assigned wake scope (`RAT-406`) and confirmed no pending thread comments in this heartbeat.
2. Scanned this workspace (`/Users/martinmarquez/uber-services`) for owning lifecycle mutation code paths.
3. Confirmed this repository does not contain Paperclip control-plane issue lifecycle modules (`/api/issues` transition engine, checkout reopen gate, status-change wake dedupe).
4. Published durable blocker and unblock contract to prevent surrogate implementation in a non-owning repository.

## Evidence
- Current repo contains application-domain lifecycle logic (`server/src/domain/reviewService.js` appeals flow), not control-plane issue lifecycle runtime.
- Prior same-defect lineage already scoped to control-plane ownership:
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
  - `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`

## Blocker Declaration
`RAT-406` is **blocked in this workspace**.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Patch terminal transition paths so `done`/`cancelled` cannot reopen without explicit `resume: true`.
  2. Enforce checkout guard so checkout cannot implicitly reopen terminal issues.
  3. Add no-delta wake dedupe so `issue_status_changed` cannot requeue/reopen completed issues.
  4. Attach API/service-level replay evidence for:
     - terminal + automation/no-resume => no reopen,
     - explicit `resume:true` => reopen allowed,
     - no-delta status-change wake => no reopen churn.

## Next Technical Step
Once the control-plane patch and replay evidence are attached in the owning repo, run a focused regression replay for this defect family and close `RAT-406`.
