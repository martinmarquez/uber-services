# RAT-376 — Wire upstream S6 source-availability telemetry into fraudHeuristics

## Scope
- Wired `fraudHeuristics.s6Telemetry` to consume upstream source-availability payloads when present.
- Kept backward-compatible fallback to legacy local inference (`reasonCode`-based) when upstream payload is absent/invalid.
- Added sustained partial-availability alerting in `fraudHeuristics` so repeated degraded upstream coverage is explicitly surfaced.

## Implementation
- Updated `server/src/domain/reviewService.js`:
  - `buildFraudHeuristics(...)` accepts `reviewId`, `s6PartialAlertThreshold`, and streak state map.
  - `buildS6Telemetry(...)` prioritizes normalized upstream availability and computes:
    - `sourcesExpected`
    - `sourcesPresent`
    - `completenessRatio`
    - `status`
  - Added `buildS6Alert(...)` + `updateS6PartialStreak(...)`:
    - tracks consecutive `partial` telemetry status per review
    - emits `fraudHeuristics.s6Alert` `{ active, kind, threshold, consecutivePartialCount }`
    - triggers `kind: "sustained_partial_availability"` once threshold is reached
    - resets streak on `complete`
- Availability wiring remains in all event-producing flows:
  - `createReview(input.sourceAvailability)`
  - `transitionModeration(input.decision?.sourceAvailability ?? input.sourceAvailability)`
  - `reportReview(input.sourceAvailability)`

## Verification
- Updated `server/tests/reviewService.test.js` coverage:
  - upstream telemetry used in moderation/create flows
  - sustained partial alert activation after threshold
  - alert reset when completeness recovers to `complete`
- Executed:
  - `node --test server/tests/reviewService.test.js`
- Result:
  - `30/30` passing

## Commit
- `1d65a79` — `RAT-376: add sustained S6 partial-availability alerting`

## Blocker / Risk Notes
- Required `ADR.md` was not present in this workspace (`find`/`rg` returned no match). Implementation proceeded aligned to existing backend domain and tests, but architecture-signoff should confirm no missing ADR constraint.

## Next Action
- Front-end/API consumer contract alignment: confirm whether `fraudHeuristics.s6Alert` should be treated as additive optional payload in current version or promoted to explicit contract docs with version bump.
