# RAT-397 Heartbeat: done issues reopening on heartbeat checkout (2026-05-11)

## Wake Context
- Issue: `RAT-397`
- Priority: high
- Wake reason: `issue_assigned`
- Pending comments: none (`0/0`)

No new assignee-thread comment changed scope in this wake; action remains direct implementation against the assigned defect.

## Scope
Fix issue lifecycle drift where terminal issues (`done`) reopen during heartbeat checkout without explicit resume intent.

## What Was Executed In This Heartbeat
1. Validated goal gate before work: `PRODUCT_BRIEF.md` exists in repo root.
2. Ran targeted ownership scan for lifecycle mutation surfaces in this workspace (`/Users/martinmarquez/uber-services`):
- checkout/reopen/state transition paths,
- heartbeat status mutation paths,
- runtime issue-engine endpoints.
3. Compared findings to prior terminal-state drift investigations already documented in this repo.

## Findings
1. This repository does not contain the Paperclip control-plane issue lifecycle runtime where heartbeat checkout state transitions are implemented.
2. Located status logic is product-domain logic (reviews/moderation/booking), not board issue lifecycle engine logic.
3. Defect signature matches the existing control-plane terminal-state drift family already documented in:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
- `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`
- `docs/analysis/rat-406-runtime-lifecycle-anti-reopen-guardrail-blocker-2026-05-11.md`

## Blocker
`RAT-397` is blocked in this workspace because the owning lifecycle runtime modules are absent.

## Unblock Owner / Action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
1. Enforce terminal-state guard in lifecycle transitions and checkout paths so `done`/`cancelled` cannot reopen without explicit `resume: true`.
2. Ensure heartbeat checkout is non-mutating on terminal issues unless explicit resume intent is present.
3. Add regression tests proving:
- terminal + heartbeat checkout/no-resume => no reopen,
- explicit `resume: true` => reopen allowed,
- no-delta status-change wake => no reopen churn.

## Next Action
When control-plane patch + regression evidence is attached in the owning repository, run a focused replay on this defect family and close `RAT-397`.
