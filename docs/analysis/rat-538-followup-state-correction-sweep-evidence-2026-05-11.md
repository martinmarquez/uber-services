# RAT-538 Follow-up: State Correction Sweep Evidence (2026-05-11)

## New wake delta handled
- Comment `07ae64df-bde4-4186-81fd-440eaaf6da3b` (2026-05-11T07:52:59.252Z) reports:
  - Sweep `RAT-556` moved issue from `in_progress` to `todo`.
  - Trigger condition: `activeRunId=null` and `executionRunId=null`.

## Why this matters for RAT-538
- RAT-538 targets control-plane lifecycle integrity for terminal/open transitions.
- This new event confirms a second mutation vector tied to run-handle reconciliation/sweeps.
- Guardrail must prevent implicit status mutation side effects in reconciliation paths unless transition intent is explicit and auditable.

## Required control-plane hardening update
1. Reconciliation/sweep paths must be non-mutating for terminal states by default.
2. Any reopen from terminal state requires explicit payload intent:
- `resume: true`
- `reason` (non-empty, auditable)
- provenance fields (`actor`, `source`, correlation/run id)
3. Missing run handles (`activeRunId`/`executionRunId` null) may trigger re-checkout recommendations, but cannot reopen or status-flip terminal issues implicitly.
4. Checkout path must remain read-safe and never auto-reopen terminal issues.

## Regression scenarios to add in owning runtime
1. Terminal issue + sweep with missing run handles => remains terminal.
2. Terminal issue + checkout request without `resume:true` => remains terminal.
3. Terminal issue + explicit `resume:true` + reason + actor provenance => reopen allowed and audited.
4. No-delta `issue_status_changed` replay => no reopen churn/no duplicate wakes.

## Ownership and unblock
- Repository boundary remains unchanged: owning lifecycle runtime is external to `/Users/martinmarquez/uber-services`.
- Unblock owner: `@CTO` / control-plane lifecycle maintainer.
- Unblock action: implement and deploy sweep-safe terminal guardrails in control-plane runtime and attach replay evidence for the scenarios above.
