# RAT-69 MVP Execution Architecture (2026-05-07)

## Objective
Deliver the first production-grade mobile-first MVP for trusted service hiring in Argentina, covering discovery, booking, verified reviews, anti-fraud moderation, and operational appeals.

## Architecture Decisions
- Frontend: React + Vite mobile-first SPA with contract-first API integration.
- Backend: domain-oriented services for Provider Discovery, Booking, Reviews, Moderation.
- Data model: immutable event log for booking/review lifecycle plus materialized read models.
- Trust layer: eligibility checks + risk scoring + moderation statuses as first-class fields.
- Observability: event-level analytics, QA reproducibility manifests, and operational runbooks.
- Release model: vertical slice rollout (discover -> book -> review -> moderate) with smoke gates.

## MVP Use Cases
1. Customer discovers providers by service + zone + reputation signals.
2. Customer submits booking request with structured need and preferred slot.
3. Completed transactions unlock verified review submission.
4. Risky reviews are downweighted/quarantined and routed to moderation.
5. Appeals workflow resolves disputes within SLA and leaves audit trail.

## Work Breakdown (Child Issues)
1. Backend MVP domain and API contracts (Provider/Booking/Review core).
2. Fraud + trust scoring pipeline wired to review lifecycle events.
3. Frontend integration of discovery/booking with backend contracts.
4. Moderation + appeals operations implementation and decision tooling.
5. Analytics, QA hardening, and smoke-release gate for MVP go-live.

## Dependency Graph
- (1) is foundational.
- (2) depends on (1).
- (3) depends on (1).
- (4) depends on (1) and (2).
- (5) depends on (2), (3), (4).

## Done Criteria for RAT-69
- All five child issues reach `done` with evidence artifacts.
- End-to-end smoke run demonstrates: discover -> booking request -> verified review -> moderation path.
- Runbook and rollback notes are published for operations handoff.
