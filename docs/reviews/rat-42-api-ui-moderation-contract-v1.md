# RAT-42 API/UI Moderation Contract v1 + Low-Confidence Thresholds

Date: 2026-05-06  
Owner: CTO  
Status: Active (MVP mobile-first)

## Canonical Moderation States (API/UI)
- `verificada`: visible in feed and eligible for public aggregate impact.
- `en_revision`: queued/under manual moderation; excluded from public aggregate impact.
- `no_recomendada`: low-confidence decision from trust/risk rules; excluded from public aggregate impact.
- `removida`: removed by policy/moderation; not visible publicly.

## Deterministic Low-Confidence Thresholds (risk_score)
- `0-39`: `verificada` (publish).
- `40-69`: `verificada` (publish with reduced ranking weight, no state change in UI v1).
- `70-84`: `no_recomendada` (hold from aggregate, moderation queue).
- `85-100`: `en_revision` (quarantine + mandatory moderation).

## API Contract Requirements
- API must return moderation `status` from the canonical enum above.
- API must return `riskScore` integer `0..100` for trusted internal surfaces and UI wiring.
- Any review with `status in (en_revision, no_recomendada, removida)` must be excluded from public score aggregates.

## UI Contract Requirements
- UI badge labels map only from the canonical enum.
- UI must show explicit low-confidence indicator for `riskScore >= 70`.
- Moderation filter in feed must include all non-`verificada` states.

## Implementation References
- FE contract module: `src/reviewModerationContract.js`
- FE consumer: `src/components/MobileReviewFlow.jsx`
