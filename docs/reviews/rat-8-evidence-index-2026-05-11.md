# RAT-8 Evidence Index (2026-05-11 ART)

Canonical index for RAT-8 backend closure evidence to prevent status-drift reopen loops.

## Core implementation commits
- `0d2d8d4` - backend scaffold (migration + contracts + base tests)
- `ccf418a` - idempotency/eligibility/moderation domain service
- `aea5807` - lifecycle endpoints + tests
- `0d00d87` - SQLite repository/outbox + migration runner + integration tests
- `a2db440` - Postgres migration runner + parity tests
- `ea04112` - response/appeal lifecycle + migration parity + tests
- `82ecef9` - live-DB Postgres parity fixes (schema checks + idempotency table + parser)

## Mandatory evidence artifacts
- Postgres non-skipped parity evidence:
  - `qa/test-results/rat-8-postgres-parity-evidence-2026-05-07.md`
- Reopen revalidation pass:
  - `qa/test-results/rat-8-reopen-revalidation-2026-05-11.md`
- Follow-up resolution note:
  - `docs/reviews/rat-8-followup-resolution-2026-05-11.md`
- Final closure receipt:
  - `docs/reviews/rat-8-final-closure-receipt-2026-05-11.md`
- Re-close checkpoint:
  - `docs/reviews/rat-8-reclose-checkpoint-2026-05-11.md`

## Acceptance-criteria mapping
- Database schema + API contracts: covered by migrations + `routes`/service commits above.
- Eligibility/anti-abuse rules: covered by domain logic + test suite.
- Audit/moderation hooks: covered by `review_events`, integrity signing, moderation/appeal flows.
- Cross-review rounds: documented in RAT-72, RAT-104, RAT-148, RAT-183 review artifacts.

## Operational conclusion
- RAT-8 backend scope is complete and closure-ready.
- If status is flipped to `in_progress` again without new scope/comments, use this file as canonical close-out reference and move back to `done`.
