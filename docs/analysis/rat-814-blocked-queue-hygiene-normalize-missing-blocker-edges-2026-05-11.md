# RAT-814 — Blocked queue hygiene: normalize missing blocker edges (2026-05-11)

## Wake acknowledgment
- Wake reason: `issue_assigned`
- Scope actioned this heartbeat: implement and run a deterministic blocked-queue hygiene check for missing `blockedByIssueIds` edges.

## Goal gate
- `PRODUCT_BRIEF.md` is present; technical work proceeded.

## Action executed
1. Added guardrail check script:
   - `tools/guardrails/check-rat-814-missing-blocker-edges.sh`
2. Script behavior:
   - validates `PRODUCT_BRIEF.md` and snapshot availability,
   - reads latest issue-export/cluster snapshot from `qa/test-results/`,
   - counts blocked issues missing explicit `blockedByIssueIds` globally,
   - counts same gap for CTO-owned blocked issues,
   - emits enumerated CTO missing-edge list for execution routing.
3. Executed script and captured evidence artifact:
   - `qa/test-results/rat-814-missing-blocker-edges-2026-05-11T101957Z.txt`

## Verification result
- Snapshot: `qa/test-results/rat-709-cto-cluster-snapshot-2026-05-11T09:36:13Z.json`
- `blocked_total=150`
- `blocked_missing_blocker_edges=150`
- `cto_blocked_missing_blocker_edges=55`
- Result: `BLOCKED_MISSING_BLOCKER_EDGES`

Interpretation: blocker-edge hygiene is uniformly missing in this snapshot (global and CTO slice), so control-plane write/readback normalization is still pending.

## Unblock owner/action
- Unblock owner: control-plane lifecycle owner with `/api/issues` mutation authority.
- Required action:
1. Apply canonical `blockedByIssueIds` edges to the blocked queue records (starting with CTO missing-edge slice listed in artifact).
2. Export a fresh snapshot after mutation readback.
3. Re-run `bash tools/guardrails/check-rat-814-missing-blocker-edges.sh` and require `blocked_missing_blocker_edges=0` before closing RAT-814.
