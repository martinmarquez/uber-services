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
