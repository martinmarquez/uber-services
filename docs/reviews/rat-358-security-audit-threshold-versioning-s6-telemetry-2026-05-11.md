# RAT-358 — Security audit update: threshold versioning + S6 telemetry

Date: 2026-05-11  
Owner: Security Engineer

## Scope
- Review domain event telemetry for fraud heuristics.
- Validate auditable `threshold_version` propagation.
- Validate S6 cross-surface completeness signal presence.

## Findings
1. Gap fixed: events had fraud bands but no threshold policy version identifier.
2. Gap fixed: events had no explicit S6 feature-completeness telemetry.
3. No auth/secrets/encryption regression introduced by this change set.

## Security changes applied
- Added immutable fraud config metadata field to emitted heuristics:
  - `fraudHeuristics.thresholdVersion`
  - default: `anti_gaming_v1_2026-05-10`
  - override supported through `ReviewService({ thresholdVersion })`
- Added S6 telemetry payload for auditability and drift monitoring:
  - `fraudHeuristics.s6Telemetry.sourcesExpected`
  - `fraudHeuristics.s6Telemetry.sourcesPresent`
  - `fraudHeuristics.s6Telemetry.completenessRatio`
  - `fraudHeuristics.s6Telemetry.status`

## Verification
- Targeted tests passed:
  - `node --test server/tests/reviewService.test.js`
  - Result: 25 passed, 0 failed.

## Risk assessment
- Residual risk: `S6` telemetry currently derives from local event context and does not yet ingest full multi-source availability from upstream services; quality is suitable for baseline monitoring but not for high-stakes autonomous threshold tuning.

## Required next action
- Backend/Data follow-up: wire real upstream source-availability counters into `s6Telemetry` and add alerting on sustained `status=partial`.
