# RAT-390 Wave-1 Duplicate Closure Note (2026-05-11)

Issue: `RAT-390` — terminal-state resume gate in control-plane lifecycle runtime.

## Wake Delta Applied
Latest thread comment (`e5a106ef-cfab-4bc6-9ff5-f43258d4e982`, 2026-05-11T08:19:56.173Z) reclassifies RAT-390 as a duplicate lifecycle/status-drift lane for wave-1 stale sweep handling.

## Decision
- RAT-390 is closed as duplicate lane for execution tracking purposes.
- Canonical remediation ownership remains with:
  - `RAT-568` (implementation lane)
  - `RAT-594` (cluster execution sweep tracking)

## Reopen Policy
Do not reopen RAT-390 unless all conditions are true:
1. RAT-568 implementation has landed.
2. QA gate RAT-383 has completed.
3. Fresh issue-specific drift evidence exists (not generalized sweep noise).

## Security / Scope Guard
- No lifecycle semantic expansion approved in this lane.
- Terminal-state policy remains explicit-intent reopen only (`resume:true`).
