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
| R-01 | Reliability | 2s-5s backend latency on submit | Client shows pending state; eventual success/fail consistent | P1 |
| R-02 | Reliability | Partial offline submit then reconnect | Local queue syncs once, no duplicate review | P1 |
| R-03 | Reliability | Dependency timeout in aggregate service | Graceful fallback, no corrupted aggregates | P1 |
| P-01 | Performance | Peak load read of review feed | P95/P99 within SLO, no elevated error rates | P1 |
| U-01 | UX | Validation errors and helper text clarity | User can correct and resubmit without confusion | P1 |
| U-02 | UX | Dispute flow from review detail | User can complete dispute with clear status feedback | P1 |
| X-01 | Regression | Existing rating history after schema changes | No data loss, counts and averages preserved | P0 |
| X-02 | Regression | Cancellation-related rating edge case | Eligibility and visibility follow policy | P0 |
