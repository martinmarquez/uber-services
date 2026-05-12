# RAT-617 — Lifecycle cluster unblock: converge to single fix path (2026-05-11)

## Scope
Own the auto-reopen blocked chain and collapse parallel/duplicate lanes to one executable remediation path.

## What was checked
- Issue heartbeat context for `RAT-617`.
- Global active issue set (`todo`, `in_progress`, `blocked`, `in_review`) for lifecycle/reopen/status-drift family.
- Canonical upstream implementation issue detail for `RAT-568`.

## Findings
- `RAT-568` (`Control-plane: enforce done->in_progress reopen guard with scoped-input gate`) is the active implementation lane and currently `in_progress`.
- The lifecycle/status-drift family is already structurally converged onto `RAT-568` as a blocker root across the blocked chain.
- Current unblock bottleneck is singular: ship `RAT-568` plus QA validation gate (`RAT-383`) before sweep-style duplicate closure can remain durable.

## CTO Decision (RAT-617)
1. Freeze parallel implementation lanes for this defect family.
2. Keep `RAT-568` as the only executable fix path.
3. Treat remaining lanes as governance/routing records unless they provide fresh issue-specific post-fix evidence.
4. Keep ownership explicit:
   - Fix owner: assignee of `RAT-568`.
   - Verification gate: `RAT-383` QA evidence.
   - Cluster closeout sweep: `RAT-594`.

## Next action
- Wait on `RAT-568` completion evidence and `RAT-383` pass; then execute final duplicate-lane closure sweep through `RAT-594`.
