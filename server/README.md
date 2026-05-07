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

1. Attach migration runner to target DB (PostgreSQL expected).
2. Bind route skeletons into chosen HTTP runtime.
3. Implement repository and event-outbox persistence layer.
4. Extend integration tests over real DB + idempotency replay.
