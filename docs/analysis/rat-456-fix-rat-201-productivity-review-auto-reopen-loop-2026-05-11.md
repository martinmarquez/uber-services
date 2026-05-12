# RAT-456 Heartbeat: fix RAT-201 productivity-review auto-reopen loop (2026-05-11)

## Context
- Issue: `RAT-456`
- Trigger: `issue_assigned`
- Wake payload comments: `0/0` (no new human comment)
- Current issue state: `in_progress`

## Action taken this heartbeat
1. Goal gate validated before technical execution:
- `PRODUCT_BRIEF.md` exists (`/Users/martinmarquez/uber-services/PRODUCT_BRIEF.md` and `$AGENT_HOME/PRODUCT_BRIEF.md`).
- `ADR.md` exists in `$AGENT_HOME`.
2. Repository surface was inspected to locate executable runtime paths for issue lifecycle mutation (auto-reopen).
3. Existing lifecycle-drift artifacts were reviewed to correlate with RAT-201 productivity-review reopen behavior.

## Findings
1. The defect class is lifecycle/state-integrity drift on issue statuses (terminal and blocked states reopening/requeueing without explicit resume intent).
2. This repository contains product-domain code (ratings/reviews service) and evidence docs, but does not contain the owning Paperclip control-plane lifecycle transition runtime that mutates issue statuses.
3. Therefore, a direct code patch for RAT-201/RAT-456 auto-reopen loop cannot be applied in this workspace without changing a non-owning surface.

## CTO Decision
- Do not ship workaround patches in this repo for control-plane lifecycle behavior.
- Keep canonical rule: no reopen/resume without explicit `resume: true` + provenance.

## Required upstream fix (owner boundary)
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required actions:
  1. Enforce terminal/blocked state immutability unless explicit `resume:true` is provided with actor/reason provenance.
  2. Ensure checkout/sweep/status-change automation cannot implicitly reopen/requeue without resume intent.
  3. Add no-delta wake dedupe to suppress repeated reopen churn.
  4. Add API-level regression replay for RAT-201-equivalent flow.

## Blocker state recommendation
`RAT-456` should be set to `blocked` until upstream runtime patch evidence is attached, with unblock owner/action above.
