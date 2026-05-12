# RAT-424 Investigation: repeated reopen loop on completed issue RAT-358 (2026-05-11)

## Scope
- Issue: `RAT-424`
- Trigger: repeated reopen loop on completed issue `RAT-358`
- Security owner lane: state integrity and lifecycle abuse prevention

## Evidence Collected
1. Replay ledger confirms affected transition:
- `analysis/rat-351-reprocessed-by-day.tsv` includes:
  - `2026-05-11 ... RAT-358 done to_todo`
2. Pattern is systemic, not isolated:
- Same ledger slice shows multiple `done -> to_todo` flips on same date (`RAT-342`, `RAT-344`, `RAT-359`, `RAT-361`, `RAT-370`, `RAT-375`, `RAT-379`, `RAT-383`, `RAT-386`).
3. Workspace ownership boundary:
- This repository does not contain the Paperclip control-plane issue lifecycle runtime that mutates issue states.
- Local executable code covers review-domain reopen controls (`reviewService.openAppeal`) but not issue engine state transitions.

## Security Assessment
- Severity: **High** (state-integrity defect with governance/compliance impact).
- Risk:
  - Terminal-state guarantees are violated (`done` is no longer authoritative).
  - Audit trail trust is weakened when automation can reopen without explicit intent.
  - Workflow abuse path exists: repeated no-delta reopen churn can bypass release and review gates.

## Required Guardrails
1. Terminal gate in control-plane lifecycle runtime:
- Reject transitions from `done`/`cancelled` unless payload has explicit `resume: true` and actor provenance.
2. Checkout safety:
- Checkout/requeue paths must be read-only for terminal status unless explicit resume intent is provided.
3. Wake dedupe:
- `issue_status_changed` with no scope/comment delta must not reopen or requeue terminal issues.
4. Audit provenance:
- Persist `resumedBy`, `resumedAt`, and `resumeReason` on every accepted terminal resume.

## Blocker and Unblock
- Current state in this workspace: **blocked for direct patching** (non-owning runtime).
- Unblock owner: Paperclip control-plane lifecycle maintainer (CTO org).
- Unblock action:
  1. Patch lifecycle mutation guards in owning service.
  2. Add API-level regression tests for:
     - terminal + no `resume:true` => denied,
     - terminal + `resume:true` => allowed + provenance persisted,
     - no-delta status-change wake => no reopen churn.
  3. Attach replay evidence with `RAT-358` fixture proving no regression.

## Next Action
- Escalate to CTO for control-plane patch authorization and request security sign-off gate before deployment.
