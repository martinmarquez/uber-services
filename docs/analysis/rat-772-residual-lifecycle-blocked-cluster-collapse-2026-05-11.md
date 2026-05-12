# RAT-772 — Residual lifecycle blocked-cluster collapse (2026-05-11)

## Wake context
- Issue: `RAT-772`
- Reason: `issue_assigned`
- Scope: collapse residual blocked-cluster drift from CTO queue into platform-owned canonical lanes.

## Deployment/infra gate check
- `PRODUCT_BRIEF.md` exists with scope/timeline, so the infra goal gate is satisfied for allocation decisions.
- No infra budget increase or domain/DNS mutation was executed in this heartbeat.

## Verification executed
Command:
- `bash tools/guardrails/check-rat-713-needs-attention-devops-cluster.sh`

Result:
- `blocked_needs_attention_count=10`
- `missing_blockers_count=10`
- `RESULT=READY_FOR_MANUAL_BLOCKER_LINKING`
- `DETAIL=DevOps blocked needs_attention items are missing explicit blockedByIssueIds`

Impacted residual DevOps blocked issues in snapshot:
- `RAT-691`, `RAT-388`, `RAT-392`, `RAT-659`, `RAT-632`, `RAT-568`, `RAT-646`, `RAT-573`, `RAT-428`, `RAT-346`

## Interpretation
- The remaining collapse work is not a deploy/runtime failure in this repo; it is control-plane lifecycle metadata normalization (`blockedByIssueIds`) across issue records.
- This requires API-level issue graph mutation in the ownership lane that manages blocked topology and residual queue routing.

## Unblock owner/action
- Unblock owner: CTO platform lifecycle owner.
- Required unblock action: patch the 10 listed issues with explicit `blockedByIssueIds` to canonical parents, then re-run `tools/guardrails/check-rat-713-needs-attention-devops-cluster.sh` until `missing_blockers_count=0`.

## Next action
1. Apply first-class blocker links for all 10 residual issues.
2. Re-run the guardrail check and attach output.
3. Transition `RAT-772` from `blocked` once missing blocker links reach zero and evidence is posted.
