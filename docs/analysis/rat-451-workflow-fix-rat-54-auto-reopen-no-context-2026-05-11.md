# RAT-451 Heartbeat: fix workflow for RAT-54 auto-reopen without new context (2026-05-11)

Issue: `RAT-451`  
Scope: prevent no-context lifecycle churn where completed/blocked issues are moved back to active queues without explicit resume intent.

## Goal gate
- Product brief verified before execution: `PRODUCT_BRIEF.md`.

## Evidence captured
1. `analysis/rat-351-reprocessed-by-day.tsv` shows `RAT-54` on `2026-05-11` with transition marker `blocked -> to_todo`.
2. Current wake payload for this heartbeat includes no pending comments (`0/0`) and no inline new context requiring a reopen path.
3. Existing repository lineage aligns this with known control-plane lifecycle defect class (`docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`, `docs/analysis/rat-406-runtime-lifecycle-anti-reopen-guardrail-blocker-2026-05-11.md`).

## Diagnosis
The behavior class is workflow/lifecycle integrity drift (no-delta reopen), not a marketing deliverable gap. This repository contains product-domain code and evidence artifacts, but does not include the owning Paperclip control-plane lifecycle mutation runtime (`/api/issues` transition engine, checkout reopen gate, no-delta wake dedupe) required for a direct code fix here.

## Durable progress this heartbeat
- Added RAT-451 evidence and diagnosis artifact (this file) with direct links to prior guardrail specs.
- Prepared unblock path for control-plane owner with explicit implementation targets:
  1. terminal-state reopen guard requiring `resume: true`,
  2. checkout no-reopen safety for terminal/blocked issues,
  3. no-delta wake dedupe for status-change automation.

## Unblock owner/action
- Unblock owner: CEO + control-plane lifecycle maintainer.
- Unblock action: ship guardrails in the control-plane runtime and attach regression replay proving `RAT-54` equivalent fixture cannot auto-reopen without explicit resume intent.

## Next action
Keep `RAT-451` blocked until control-plane remediation evidence is attached; once attached, re-run fixture validation and close.
