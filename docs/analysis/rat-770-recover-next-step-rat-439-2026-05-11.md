# RAT-770 Recovery: missing next step for RAT-439 (2026-05-11)

## Context
- Wake reason: `process_lost_retry` on `RAT-770`.
- Target issue: `RAT-439` (completed-review auto-reopen lifecycle defect lane).
- Goal gate check: `PRODUCT_BRIEF.md` exists in workspace root, so execution is allowed.

## Recovered Next Step (Executable)
1. Keep `RAT-439` in duplicate-lane posture and do not start parallel implementation under it.
2. Route all engineering remediation to canonical lifecycle guardrail lane `RAT-568` with cluster tracking on `RAT-594`.
3. Require unblock evidence bundle before resuming `RAT-439`:
   - terminal-state immutability (`done/cancelled` cannot reopen without explicit `resume:true`),
   - checkout non-mutation on terminal issues without resume intent,
   - no-delta `issue_status_changed` wake dedupe,
   - replay proof showing reopen blocked unless explicit audited resume.
4. On next `RAT-439` wake without new issue-specific evidence, re-close in same heartbeat as lifecycle drift correction.

## Owner and Timing
- Unblock owner: control-plane lifecycle maintainer (CTO/platform lane).
- Next checkpoint trigger: completion evidence posted on `RAT-568`/`RAT-594`.
- Escalation rule: if `RAT-439` reopens again without net-new evidence, escalate to board as runtime-governance defect recurrence with A/B routing options.

## Source Linkage
- Primary investigation artifact: `docs/analysis/rat-439-investigate-stop-repeated-auto-reopen-completed-review-issues-2026-05-11.md`.
