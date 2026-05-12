# RAT-1000 CTO Review - Anti-brigading hardening for burst deboost trigger

Date: 2026-05-12
Issue: [RAT-1000](/RAT/issues/RAT-1000)
Owner: CTO

## Problem
The burst deboost trigger relied on volume and could be abused by coordinated low-reliability brigading to force ranking penalties.

## Decision
Adopt reliability-weighted burst triggering.

- Preserve raw velocity telemetry for monitoring and investigations.
- Compute weighted velocity and use it as the burst/elevated decision input.
- Keep deterministic, auditable output fields in fraud heuristics.

## Implementation
- `server/src/domain/reviewService.js`
  - Added `toReliabilityWeight(riskScore)` with clamp `[0.1, 1.0]`.
  - Added `velocityRawCount`, `velocityWeightedCount`, `velocityReliabilityWeight` to fraud heuristics payload.
  - Switched `velocityBand` classification to weighted velocity.

- `server/tests/reviewService.test.js`
  - Added regression test: high raw velocity + low reliability must not trigger burst band.
  - Added regression test: high raw velocity + high reliability still triggers burst band.
  - Added baseline assertions for new telemetry fields.

## Verification
Command:

```bash
node --test server/tests/reviewService.test.js
```

Result:
- PASS (`32/32`)

## Security outcome
This closes the specific anti-brigading gap for burst-triggered deboost by making reliability a first-class gate while preserving observability.
