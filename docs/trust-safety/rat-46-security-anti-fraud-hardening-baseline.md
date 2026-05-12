# RAT-46 Security: Anti-Fraud Hardening Baseline

Date: 2026-05-06  
Owner: CTO  
Status: Baseline locked for MVP execution

## Objective
Define the minimum anti-fraud hardening controls that must be in place before rating/review features can move to release readiness.

## Mandatory Controls
1. Auth and identity hardening
- Phone OTP required for review-eligible accounts.
- Device fingerprint captured and linked to review submission events.
- Velocity guardrails on signup/login/review submit by account, device, and IP.

2. Abuse-resistant review ingestion
- All new reviews enter trust evaluation before score impact.
- Trust states required: `pending_trust`, `published`, `quarantined`, `removed`.
- `quarantined` and `pending_trust` reviews are excluded from public score computation.

3. Risk scoring and deterministic enforcement
- Persist `risk_score` (0-100) with decision band and rule version.
- Enforce deterministic actions by band:
  - `0-39`: publish
  - `40-69`: publish with reduced ranking weight
  - `70-84`: hold from aggregate + moderation queue
  - `85-100`: quarantine + mandatory moderation
- Rule thresholds/config must be versioned and auditable.

4. Signal baseline (MVP minimum)
- Burst velocity anomaly (provider and geo bucket).
- Account risk profile (age, reuse indicators, abuse correlation).
- Graph collusion signal (reviewer-provider density and repeated edge patterns).
- Text duplication/manipulation signal (near-duplicate clusters).
- Rating extremity outlier burst window detection.

5. Moderation and appeal integrity
- Manual moderation decisions must require reason code + severity.
- SLA lanes enforced: P0 <= 4h, P1 <= 24h, P2 <= 72h.
- Appeals must not mutate raw evidence; only append immutable decision records.

6. Security and audit guarantees
- Immutable audit events for every moderation/risk decision transition.
- Signed service-to-service event envelopes for risk->moderation pipeline.
- Least-privilege access model for moderation tooling and rule management.
- PII separation between identity data and review content per ADR compliance.

## Release Blocking Criteria (Security Gate)
- Any open `security-high` finding blocks release.
- Missing trust-state isolation blocks release.
- Missing immutable audit trail blocks release.
- Missing velocity controls blocks release.

## Execution Owners
- Backend: risk scoring schema, state transitions, moderation APIs.
- Security: auth hardening, velocity controls, audit integrity, access model.
- Data: thresholds calibration, detector quality monitoring, FP/FN tracking.
- QA: abuse regression suite and gate evidence.

## Verification Evidence Required
1. End-to-end trace proving `risk_score` and state transitions on synthetic abuse scenarios.
2. Proof that quarantined/held reviews never affect score aggregates.
3. Moderation SLA dashboard snapshot with queue segmentation.
4. Audit log extract showing immutable chain for decision lifecycle.
5. QA run report for adversarial abuse suite with pass/fail and residual risks.
