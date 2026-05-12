# RAT-402 Finalization Note — issue_continuation_needed (2026-05-11)

Issue: `RAT-402` (fixing RAT-205 auto-reopen status churn).
Wake: `issue_continuation_needed`.

## Root cause assessment
- No new non-duplicate drift vector has been introduced in this workspace.
- The auto-reopen path remains in the Paperclip control-plane lifecycle engine (`/api/issues`, checkout/wake mutation logic), which is not present in this checkout.
- Therefore `RAT-402` remains a duplicate lane that maps to `RAT-568` and sweep `RAT-594`.

## Patch status in this workspace
- Reviewed and preserved earlier local hardening work for review-domain close idempotency ([closeAppeal replay guard], already in scope for `server/src/domain/reviewService.js`) as safe local correctness, but this does not govern `RAT-205` issue churn.
- No new patch applied in this heartbeat due to canonical boundary.

## Final disposition for this wake
- Issue status posture: `blocked` in this workspace.
- Unblock owner/action:
  1. `RAT-568` maintainer applies control-plane runtime terminal reopen guard (`done`/`cancelled` immutable without explicit scoped resume).
  2. `RAT-428` unblocks/reassigns that work to owning control-plane repository if needed.
  3. Attach owning-runtime replay evidence and direct lifecycle QA coverage (RAT-383 or successor gate).
  4. Re-run duplicate sweep via `RAT-594` and then re-open `RAT-402` only if fresh RAT-205-specific drift evidence remains.

