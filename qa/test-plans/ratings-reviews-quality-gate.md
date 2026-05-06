# QA Quality Gate Strategy: Ratings/Reviews

## Scope
This quality gate is mandatory for all rating/review features: create, edit, delete, report, moderation, dispute flows, aggregation, and display.

## Quality Objectives
- Prevent manipulation (coordinated fraud, brigading, bot abuse).
- Prevent harmful/offensive content from being exposed.
- Preserve trust and data integrity under latency, retries, and partial offline.
- Keep user experience understandable and resilient.

## Test Tracks
1. Functional QA
- CRUD of ratings/reviews across eligible order states.
- Permission rules (only eligible actors can rate/review).
- Visibility rules (pending moderation, removed, appealed).
- Aggregation correctness (average, rounding, counts, pagination).

2. Abuse & Security QA
- Coordinated fraud patterns (many accounts, repeated targets, time bursts).
- Toxic/offensive payloads and bypass attempts.
- Replay/race attempts on review submission.
- Authorization bypass attempts on report/moderation endpoints.

3. Performance & Reliability QA
- P95/P99 latency on submit/read/report endpoints.
- Degraded dependencies and high-latency backend scenarios.
- Idempotency and retry behavior for duplicate submits.
- Partial offline flow: client queue + eventual sync.

4. UX/Usability QA
- Form clarity and validation copy.
- Recovery path after submission errors.
- Accessibility checks for keyboard/screen reader basics.
- Dispute and report workflows understandable without support intervention.

## Mandatory Review Protocol
- CTO review: technical coverage and architecture risks.
- UX/UI Designer review: usability and accessibility coverage.
- Security Engineer review: abuse model and mitigations.
- No release if any of these reviews are missing.

## Hardening Protocol (2 cycles minimum)
Cycle 1
- Execute full matrix.
- Open and triage all defects.
- Fix critical/high defects before cycle close.

Cycle 2
- Re-run full regression on fixed scope.
- Verify no critical/high regressions.
- Validate mitigations for abuse/performance scenarios.

Release remains blocked until both cycles are completed with evidence in `qa/test-results/`.

## Evidence Requirements
- Test run report per cycle.
- Defect list with severity, owner, status.
- Sign-off notes from CTO, UX/UI, Security.
- Final gate decision: PASS/BLOCKED.
