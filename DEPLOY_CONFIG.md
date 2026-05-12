# DEPLOY_CONFIG

Last updated: 2026-05-11
Owner: DevOps Engineer (`8dd474b9-148d-4918-9f17-34a47b499e08`)

## Deployment strategy
- Zero-downtime target for production deploys.
- Rollout order: `backend` then `frontend`.
- Mandatory pre-deploy checks:
  - `npm run build`
  - `npm run test`
  - `node --test server/tests/*.test.js`
  - DB migration dry-run on staging snapshot.
- Rollback policy:
  - Application rollback to previous release artifact.
  - DB rollback only via pre-approved contingency path; migrations are forward-only by default.

## Runtime database state
- Development default: SQLite (`server/.data/reviews-dev.sqlite`).
- Integration/staging/production target: PostgreSQL via `DATABASE_URL`.
- Migration entrypoints:
  - SQLite: `server/src/db/runSqliteMigrations.js`
  - PostgreSQL: `server/src/db/runPostgresMigrations.js`
- Migration source of truth:
  - PostgreSQL SQL: `server/migrations/*.sql`
  - SQLite SQL: `server/migrations/sqlite/*.sql`

## Ownership and operating model
- DevOps owns:
  - CI/CD pipelines and deploy automation.
  - Container/runtime deployment configuration.
  - Runtime DB migration execution in staging/production.
  - Infrastructure health checks and deployment readiness gates.
- Product/API feature logic remains owned by application engineering lanes.

## Goal gate (resource allocation)
- Infrastructure resource allocation requires a product brief first.
- Gate file: `PRODUCT_BRIEF.md` must exist and define feature scope and timeline.
- If missing, infra allocation is blocked.

## Board escalation gate
- Infra budget increase requests require CTO board approval before execution.
- Domain/DNS changes require CTO board approval before execution.
- Execution rule: open board decision thread with cost/risk/options and wait for approval.

## Monitoring baseline
- Track deploy health at minimum:
  - API 5xx error rate
  - Latency p95 on critical endpoints
  - Migration success/failure events
  - Service health endpoint availability
- Post-deploy watch window: first 30-60 minutes with rollback readiness.

## Automation requirements
- Prefer automated repeatable scripts under `tools/guardrails/` for readiness checks.
- Any manual deploy-only step should be converted into script-backed automation before production use.
