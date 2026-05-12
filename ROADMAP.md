# Product Roadmap - Uber Services Argentina MVP

Last updated: 2026-05-11
Owner: Product Manager
Source alignment: PRODUCT_BRIEF.md, plans/master-plan-rat-1-2026-05-06.md

## Q2 2026 Milestones

### M1 - Trust Core Foundation
Goal: Ship trusted review lifecycle and anti-fraud baseline.

Scope:
- Rating and review architecture/spec completion (RAT-5).
- Backend review lifecycle and eligibility APIs (RAT-8, RAT-45).
- Fraud/manipulation controls and baseline hardening (RAT-9, RAT-46).
- Scoring/ranking model and reproducibility gates (RAT-10, RAT-21, RAT-22, RAT-23, RAT-24).

Exit criteria:
- End-to-end verified-review flow working in staging.
- Fraud gates and moderation taxonomy enforced in backend.
- Ranking model calibration + QA checks documented.

### M2 - MVP UX + Frontend Delivery
Goal: Deliver mobile-first user flow with low-friction review capture.

Scope:
- Mobile-first UX specification and handoff (RAT-6).
- Frontend implementation of rating/review module (RAT-7).
- Copy clarity, accessibility, and usability hardening (RAT-65, RAT-70, RAT-71, RAT-118).

Exit criteria:
- Frontend module integrated with backend contract.
- Accessibility/manual QA pass or explicit blocker with owner/action.
- No P1 UX regressions in QA smoke.

### M3 - Growth Experiment Loop
Goal: Validate conversion lift without trust regression.

Scope:
- Growth hypothesis prioritization and experiment execution (RAT-13, RAT-17, RAT-18).
- Statistical and CX review gates (RAT-19, RAT-20).
- Instrumentation and sample-quality QA (RAT-28, RAT-30).

Exit criteria:
- Decision-ready experiment readout (go/no-go) with sample-quality confidence.
- KPI deltas tied to conversion + churn risk indicators.

### M4 - CS/Analytics Operationalization
Goal: Operational monitoring for churn/friction and post-release response.

Scope:
- CS friction/churn dashboard instrumentation (RAT-37, RAT-39, RAT-40).
- Day-7 KPI readouts and warehouse evidence workflows (RAT-82, RAT-84, RAT-122, RAT-123, RAT-142).
- Runtime and DB prerequisites for stable execution environments (RAT-346, RAT-347).

Exit criteria:
- Dashboard publish checklist completed with named data source.
- Day-7 KPI snapshots available and reproducible.
- Runtime access blockers converted to done or explicit blocked ownership.

## Current Priority Order
1. Runtime/app availability blockers: RAT-346, RAT-347, RAT-341, RAT-338, RAT-334.
2. Core implementation continuity: RAT-7, RAT-26, RAT-323, RAT-322, RAT-324, RAT-325.
3. Analytics dependency chain closure: RAT-122, RAT-123, RAT-142, RAT-84.
4. Documentation/go-to-market readiness: RAT-348 and closure notes for done issues without artifacts.

## Scope Guardrails
- No net-new major feature lanes until runtime stability and experiment analytics closure are complete.
- Any new request must map to one of: trust quality, conversion lift, or churn-risk reduction.
- Work without measurable product outcome is deferred.
