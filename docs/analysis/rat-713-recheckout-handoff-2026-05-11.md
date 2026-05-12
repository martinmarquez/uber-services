# RAT-713 — Re-checkout handoff after state correction (2026-05-11)

## Wake delta handled
- New comment `e0e36002-1f8b-4fb7-9273-1f75d386235c` (2026-05-11T21:17:06.884Z) indicates RAT-556 state correction moved `RAT-713` out of stale `in_progress` and into `todo` for explicit re-checkout by assignee `8dd474b9-148d-4918-9f17-34a47b499e08`.

## What changes now
- Previous blocker normalization artifacts remain valid.
- Execution mode must restart via explicit assignee checkout, then apply blocker edges in control-plane records.
- Until checkout occurs, this lane is a handoff checkpoint, not active execution.

## Ready-to-run resume sequence (assignee)
1. Re-checkout `RAT-713` into a fresh run.
2. Apply `blockedByIssueIds` from:
   - `docs/analysis/rat-713-devops-blocker-link-proposal-2026-05-11.md`
3. Re-run guardrail:
   - `bash tools/guardrails/check-rat-713-needs-attention-devops-cluster.sh`
4. Expected pass condition:
   - `missing_blockers_count=0`
5. If any edge fails to persist upstream, keep issue `blocked` and record:
   - failing issue id,
   - API failure reason,
   - named unblock owner/action.

## Current blocker owner/action
- Owner: CTO / control-plane lifecycle owner.
- Action: accept and persist first-class blocker edges for the 10-item DevOps `needs_attention` slice.
