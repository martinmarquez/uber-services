# Ratings/Reviews Test Matrix

| ID | Category | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| F-01 | Functional | Eligible rider submits rating + text review | Persisted once, visible in history, aggregated correctly | P0 |
| F-02 | Functional | Ineligible user attempts review | Rejected with clear error and no side effects | P0 |
| F-03 | Functional | User edits own review within allowed window | Latest version displayed, audit trail preserved | P1 |
| F-04 | Functional | User deletes own review | Review hidden per policy, aggregates updated | P1 |
| F-05 | Functional | Pagination/sorting of reviews | Stable ordering and no duplication/skips | P1 |
| A-01 | Abuse/Security | Coordinated burst of low ratings to same driver | Anti-abuse signal triggered, suspicious reviews flagged | P0 |
| A-02 | Abuse/Security | Offensive content in review text | Content blocked/flagged according to moderation policy | P0 |
| A-03 | Abuse/Security | Auth bypass attempt on moderation endpoint | Unauthorized blocked, event logged | P0 |
| A-04 | Abuse/Security | Duplicate submit replay | Idempotency prevents duplicate persisted reviews | P0 |
| R-01 | Reliability | 2s-5s backend latency on submit | Client pending state renders in <=250ms; final resolution <=8s; timeout error rate <=1% | P1 |
| R-02 | Reliability | Partial offline submit then reconnect | Local queue syncs once, no duplicate review | P1 |
| R-03 | Reliability | Dependency timeout in aggregate service | Graceful fallback in <=1s; stale-safe response served; aggregate mismatch incidents = 0 | P1 |
| P-01 | Performance | Peak load read of review feed | `/reviews/feed` p95 <=350ms, p99 <=800ms, error rate <0.5% at peak profile | P1 |
| U-01 | UX | Validation errors and helper text clarity | User can correct and resubmit without confusion | P1 |
| U-02 | UX | Dispute flow from review detail | User can complete dispute with clear status feedback | P1 |
| U-03 | UX/A11y | Report/Reply modal keyboard behavior | `Escape` closes dialog; focus trap cycles tabbables; focus restores to trigger on close | P0 |
| X-01 | Regression | Existing rating history after schema changes | No data loss, counts and averages preserved | P0 |
| X-02 | Regression | Cancellation-related rating edge case | Eligibility and visibility follow policy | P0 |
| RR-01 | Ranking Robusto | `Q_bayes` with low `v` converges to prior `C` | Score remains close to prior and does not over-rank low-sample providers | P0 |
| RR-02 | Ranking Robusto | `F_volume` monotonic behavior with increasing `v` | Factor increases monotonically and asymptotically approaches 1 | P0 |
| RR-03 | Ranking Robusto | `F_recency` range validation in worst/best rating history | `F_recency = 0.85 + 0.15 * ((R_rec-1)/4)` y salida exacta en `[0.85,1.00]` | P0 |
| RR-04 | Ranking Robusto | High fraud risk lowers `F_reliability` and final score | Providers with high risk signals receive deterministic deboost | P0 |
| RR-05 | Ranking Robusto | Incident severity shock (`I_sev`) impacts score within SLA | Severe incident causes expected score drop and rollback path under 1 hour | P0 |
| RR-06 | Ranking Robusto | Low-N display boundaries by `v_eff` | Correct badge and score visibility at thresholds `<5`, `5`, `15`, `40` | P0 |
| RR-07 | Ranking Robusto | `F_recency` exact boundary checks (`R_rec=1` and `R_rec=5`) | Returns exactly `0.85` and `1.00` with `R_rec_norm=(R_rec-1)/4` | P0 |
| RR-08 | Ranking Robusto | `I_sev` aggregation with multiple incidents (sum + decay + cap) | Deterministic `I_sev=min(3.0,sum(sev_j*d_j))` for rolling 180d | P0 |
| RR-09 | Ranking Robusto | API/UI contract for low-N formatting and rounding | `displayScore` only when `v_eff>=5`, 1 decimal, half-away-from-zero rounding | P0 |
| RR-10 | Ranking Robusto | Anti-gaming burst trigger and deboost duration | `reviews_24h_zscore>=3.5` or `>=p99` applies `F_burst=0.85` for 72h | P0 |
| RR-11 | Ranking Robusto | Shadow-eval handling for high-risk reviews | Reviews with `risk>=0.8` excluded from public score until verification | P0 |
| RR-12 | Ranking Robusto | Offline simulation reproducibility gate | Run metadata includes `baseline_naive_avg_v1`, snapshot, seed `20260506`, commit | P0 |
| MC-01 | Moderation Contract | Canonical enum parity API/UI for moderation state | Only `verificada`, `en_revision`, `no_recomendada`, `removida` accepted/rendered; unknown state rejected or mapped to safe fallback | P0 |
| MC-02 | Moderation Contract | Threshold band mapping `riskScore` -> state | `0-39`=>`verificada`, `40-69`=>`verificada` (reduced weight), `70-84`=>`no_recomendada`, `85-100`=>`en_revision` | P0 |
| MC-03 | Moderation Contract | Public score isolation by moderation state | Any review in `en_revision`, `no_recomendada`, `removida` excluded from public aggregates | P0 |
| MC-04 | Moderation Contract | UI low-confidence indicator behavior | UI shows low-confidence marker for `riskScore >= 70` and moderation filter includes all non-`verificada` states | P1 |
| MC-05 | Policy/Playbook Consistency | Policy-to-product reasoning consistency for low-confidence handling | API status semantics, UI labels, and playbook wording do not conflict for hold/quarantine/removal flows | P0 |
| API-01 | Contract Versioning | Moderation/ranking payload backward compatibility | Contract tests pass for `vCurrent` and `vPrev`; additive fields tolerated; removed/renamed fields fail CI | P0 |
