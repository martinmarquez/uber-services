# RAT-45 Handoff: Unblock Cascade to RAT-47 -> RAT-28 -> RAT-51

Date: 2026-05-06  
Owner: CTO  
Context: RAT-45 is root blocker for RAT-15 execution flow.

## Purpose
Provide a single, verifiable handoff packet so RAT-45 closure immediately enables downstream work without interpretation gaps.

## RAT-45 Exit Gate (Must Be Complete)
Reference: `docs/reviews/rat-45-be-eligibility-events-moderation-domain-v1.md` sections 9 and 10.

Required evidence bundle:
1. Schema contract merged (migrations + apply log).
2. Eligibility enforcement tests passing.
3. Event catalog contract tests + fixtures.
4. Moderation transition guard tests.
5. Security hooks evidence (immutability + PII minimization).
6. QA PASS artifact linked to RAT-45 sections.

## Unblock Cascade Map
1. RAT-47 (immediate after RAT-45 criteria #1-#4)
- Unblock owner: BE + FE implementation owners.
- Required handoff inputs from RAT-45:
  - Canonical review states and transitions.
  - Event envelope fields and idempotency requirements.
  - Eligibility rejection reasons for FE/API consistency.
- Existing evidence path:
  - `qa/test-results/rat-47-fe-instrumentation-implementation-note-2026-05-06.md`

2. RAT-28 (after RAT-47 implementation evidence is attached)
- Unblock owner: QA owner for instrumentation/sample-quality validation.
- Required handoff inputs:
  - Stable emitted event data aligned with RAT-45 event contract.
  - One-day sample extract for QA rerun.
- Existing evidence path:
  - `qa/test-results/rat-28-ab-instrumentation-qa-readout-2026-05-06.md`
  - `qa/test-plans/rat-28-ab-instrumentation-sample-quality-qa.md`

3. RAT-51 (after RAT-28 PASS is confirmed)
- Unblock owner: Program/Issue owner for RAT-51.
- Required handoff inputs:
  - RAT-45 done evidence bundle.
  - RAT-47 implementation evidence.
  - RAT-28 QA PASS readout.
- Current gap:
  - No RAT-51 artifact found in repo during this heartbeat; issue-thread linkage must be added when RAT-51 owner confirms acceptance criteria.

## Close-Ready Comment Template (Issue Thread)
Use this when posting RAT-45 closure:

1. RAT-45 done-gate criteria #1-#6: `PASS` with links.
2. RAT-47 unblock state: `READY` (criteria #1-#4 satisfied).
3. RAT-28 unblock state: `READY/PENDING` with latest QA evidence link.
4. RAT-51 unblock state: `PENDING OWNER CONFIRMATION` (attach acceptance criteria link when available).

