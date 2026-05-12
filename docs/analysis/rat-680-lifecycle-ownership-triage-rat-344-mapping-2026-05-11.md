# RAT-680 lifecycle ownership triage: resolve RAT-344 reference mismatch (2026-05-11)

## Context
`RAT-678` requested lifecycle ownership consolidation for `RAT-400` and `RAT-344`.

During triage, `RAT-344` was treated as missing from index. Re-check on 2026-05-11 confirms `RAT-344` exists, but it is a **productivity-review** issue (`Review productivity for RAT-301`) and is not the lifecycle remediation lane intended by `RAT-678`.

## Canonical mapping decision
- Invalid lifecycle pointer in `RAT-678`: `RAT-344`.
- Canonical lifecycle replacement: `RAT-568` (`Control-plane: enforce done->in_progress reopen guard with scoped-input gate`).

Rationale:
1. `RAT-568` is the active control-plane lifecycle/status-drift remediation chain.
2. `RAT-344` belongs to productivity-review workflow and should not be routed as lifecycle-fix ownership.
3. `RAT-678` objective is lifecycle ownership consolidation, so blocker linkage must target lifecycle runtime lane.

## Ownership + blocker normalization
- `RAT-568` remains assigned to the lifecycle/control-plane owner queue.
- `RAT-678` is normalized to block on `RAT-568` with explicit unblock owner/action in-thread.

## Action output
- Posted mapping evidence comment on `RAT-678`.
- Updated `RAT-678` blockers to reference `RAT-568`.
- Closed `RAT-680` after mapping + routing evidence was recorded.
