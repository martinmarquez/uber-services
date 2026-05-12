# RAT-410 Heartbeat: recurring status regression for closed productivity review issues (2026-05-11)

## Scope
Issue: `RAT-410` (medium priority)

Objective: stop recurring reopen/status drift on closed productivity-review issues.

## Action Taken
1. Verified the current workspace ownership and searchable executable code paths.
2. Searched for control-plane lifecycle mutation surfaces required to implement this fix family:
- terminal issue transition guards (`done`/`cancelled` immutability),
- checkout reopen prevention,
- no-delta `issue_status_changed` wake dedupe.
3. Confirmed this repository (`/Users/martinmarquez/uber-services`) contains product app/backend code only and does not contain the Paperclip control-plane issue lifecycle runtime.
4. Produced this durable blocker record with explicit unblock owner/action.

## Evidence
- Prior same-defect lineage in this workspace already points to control-plane ownership and identical closure criteria:
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
  - `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`
  - `docs/analysis/rat-406-runtime-lifecycle-anti-reopen-guardrail-blocker-2026-05-11.md`

## Blocker Declaration
`RAT-410` is **blocked in this workspace**.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Patch lifecycle transition paths so terminal issues (`done`/`cancelled`) cannot reopen without explicit `resume: true`.
  2. Enforce checkout guard so checkout cannot implicitly reopen terminal issues.
  3. Add no-delta status-change wake dedupe to prevent recurring reopen churn.
  4. Attach API/service-level replay evidence proving:
     - terminal + automation/no-resume => no reopen,
     - terminal + checkout/no-resume => non-mutating,
     - explicit `resume:true` => reopen allowed.

## Next Technical Step
When control-plane patch + replay evidence are attached in the owning runtime, run focused regression validation for this defect family and close `RAT-410`.
