# RAT-8 Backend Scaffold

This scaffold provides the minimum execution surface to unblock RAT-8:

- Migration drafts under `server/migrations`
- API contract skeleton under `server/src/api`
- Domain guardrails under `server/src/domain`
- Contract/unit tests under `server/tests`

## Status

- ADR path from CTO comment (`$AGENT_HOME/ADR.md`) was not present at runtime.
- Implementation is aligned to:
  - `docs/reviews/rat-45-be-eligibility-events-moderation-domain-v1.md`
  - `docs/reviews/rat-42-api-ui-moderation-contract-v1.md`

## Next wiring steps

1. PostgreSQL migration runner is available:
`node server/src/db/runPostgresMigrations.js "$DATABASE_URL" rat8_dev`
2. SQLite migration runner is available now:
`node server/src/db/runSqliteMigrations.js server/.data/reviews-dev.sqlite`
3. DB-backed repository/outbox integration is available through `SqliteReviewRepository` + `ReviewService({ repository })`.
4. Promote SQLite + PostgreSQL integration tests to CI with a seeded `DATABASE_URL`.

## Security runtime notes

- API actor headers can be cryptographically verified by setting `ACTOR_SIGNING_SECRET`.
- Signature contract reference:
  - `docs/trust-safety/rat-134-actor-signing-contract.md`

## Lifecycle guardrails

- Terminal issue immutability contract (RAT-363):
  - `npm run guard:rat-363`
- This check enforces that `done`/`cancelled` issues cannot reopen without explicit scoped resume context.
