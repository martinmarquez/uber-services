# RAT-9 Trust & Safety Security Spec

## Scope
Design anti-fraud controls to protect review/rating integrity for the Argentina services marketplace.

## 1) Fraud Signal Catalog (with thresholds and actions)

### S1. Burst velocity anomaly
- Signal: sudden review volume spike per provider or geo-cluster.
- Metric: reviews_per_hour vs 30-day baseline percentile.
- Thresholds:
  - `warn`: > P99 for 1h
  - `high`: > P99.9 for 2 consecutive buckets
- Action:
  - `warn`: soft downrank in recommendation.
  - `high`: hold publication + queue human review.

### S2. Reviewer account risk score
- Signal: low-account-age, low-activity, repeated device/IP overlap.
- Features: account_age_days, device_fingerprint_reuse, ip_asn_risk, payment_instrument_reuse.
- Thresholds:
  - `risk_score >= 70`: do not count toward public rating until reviewed.
  - `risk_score >= 85`: auto-quarantine and lock voting actions pending review.
- Action:
  - quarantine + case creation for T&S.

### S3. Collusion graph density
- Signal: bipartite graph between reviewers/providers with abnormal closure and reciprocity.
- Metric: local clustering coefficient, repeated reviewer-provider edges, shared metadata.
- Thresholds:
  - `density_zscore >= 3`
- Action:
  - freeze impacted review cluster from ranking model input.

### S4. Linguistic duplication/manipulation
- Signal: semantically near-duplicate text patterns across accounts.
- Metric: cosine similarity embeddings + n-gram overlap.
- Thresholds:
  - `cos_sim >= 0.92` across >= 3 accounts in <= 7 days.
- Action:
  - mark as suspicious, lower weight, route sample to moderator.

### S5. Rating extremity outlier
- Signal: 1-star/5-star concentration inconsistent with provider historical variance.
- Metric: KL divergence against provider historical distribution.
- Thresholds:
  - `KL >= 0.8` and count >= 15 in 24h.
- Action:
  - temporarily exclude burst window from aggregate rating.

### S6. Cross-surface abuse correlation
- Signal: shared indicators with payment abuse, refund abuse, chargeback spikes.
- Threshold:
  - correlation score >= 0.75 from abuse pipeline.
- Action:
  - force manual review before recommendation eligibility.

## 2) Automated + Manual Moderation Workflow

## States
- `published`
- `shadow_limited` (visible to author only, no ranking impact)
- `held_for_review`
- `suppressed`
- `reinstated`

## Automatic policy engine
- Risk decision bands:
  - `0-39`: publish normally.
  - `40-69`: publish with reduced ranking weight.
  - `70-84`: hold from rating aggregate, enqueue review.
  - `85-100`: suppress + mandatory review.

## Manual review policy
- Reviewer decisions:
  - `confirm_legit`, `confirm_fraud`, `insufficient_evidence`.
- SLAs:
  - High-risk queue: <= 4h.
  - Normal queue: <= 24h.
- Appeals:
  - one appeal per decision, routed to second reviewer.

## Recommendation impact policy
- Never fully delete on first suspicion; isolate impact first.
- Suppressed content excluded from:
  - recommendation ranking features
  - provider reputation aggregates
- Re-evaluate suppressed clusters every 14 days.

## 3) False Positive / False Negative Monitoring

## Core metrics
- FP proxy: appeal_success_rate of suppressed/held reviews.
- FN proxy: post-hoc confirmed fraud that was initially published.
- Precision@K for top-risk alerts.
- Queue latency percentile (p50/p95).

## Guardrails
- If `appeal_success_rate > 20%` for 7-day window:
  - lower aggressiveness by +10 threshold points for S4/S5.
- If confirmed-fraud leakage > baseline + 30%:
  - increase sampling and tighten S1/S2 thresholds.

## Adversarial test suite (required for review cycles)
- Synthetic burst attacks.
- Sybil account farms with rotating IP/device fingerprints.
- Prompted paraphrase campaigns for text obfuscation.
- Mixed legitimate + fraudulent traffic to test collateral damage.

## 4) Security & OWASP Alignment
- OWASP ASVS controls:
  - Event integrity: immutable audit logs for every moderation action.
  - Access control: least privilege on moderation tooling.
  - Input handling: sanitize review text before NLP pipeline.
  - Abuse protection: rate limits + bot detection on review submission.
- Crypto/auth requirements:
  - signed event envelopes between scoring service and moderation queue.
  - mTLS or service auth tokens for internal fraud APIs.

## 5) Implementation checkpoints
1. Add risk scoring schema and event logging fields.
2. Implement policy engine state transitions.
3. Wire moderation queue + reviewer decision API.
4. Add metric dashboards and threshold tuning playbook.
5. Run 2 review cycles (Backend, Researcher, QA) with adversarial scenarios.

## 6) Immediate next tasks
- Backend: implement `risk_score` pipeline + `held_for_review` state handling.
- Research: calibrate thresholds with historical traffic.
- QA: execute adversarial suite and report FP/FN deltas.
