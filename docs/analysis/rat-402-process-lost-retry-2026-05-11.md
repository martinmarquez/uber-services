# RAT-402 Process-Lost Retry Note (2026-05-11)

Issue: `RAT-402` — Fix RAT-205 auto-reopen status churn after terminal close.
Wake reason: `process_lost_retry`.

## Retry assessment
- No new comments, scope deltas, or issue-specific RAT-205 drift evidence were introduced in this wake.
- Prior disposition remains valid: implementation is blocked in this workspace because the owning lifecycle mutation runtime is external (control-plane `/api/issues` path).

## Current disposition
- Keep `RAT-402` in `blocked` posture.

## Unblock owner/action
- Owner: control-plane lifecycle maintainer (`RAT-568` lane), with dependency on `RAT-428` unblock/repo handoff as needed.
- Action:
  1. Land authoritative terminal reopen guard in owning runtime.
  2. Attach before/after replay proving no implicit `done/cancelled -> in_progress` reopen.
  3. Complete lifecycle QA gate (`RAT-383` lineage).
  4. Run duplicate closure sweep (`RAT-594`).

## Next action for RAT-402
- Re-evaluate only after the canonical evidence bundle is posted; reopen RAT-402 only if fresh RAT-205-specific drift persists.
