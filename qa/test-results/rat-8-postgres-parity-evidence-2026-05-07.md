# RAT-8 Postgres Parity Evidence (2026-05-07 ART)

## Context
- Issue: RAT-8 Backend Core
- Goal: run Postgres parity tests with a real `DATABASE_URL` and produce non-skipped evidence.

## Environment
- Ephemeral DB container:
  - `docker run -d --rm --name rat8-postgres-evidence -e POSTGRES_PASSWORD=rat8 -e POSTGRES_DB=rat8 -p 55432:5432 postgres:16-alpine`
- Test URL:
  - `DATABASE_URL=postgresql://postgres:rat8@localhost:55432/rat8`

## Command
```bash
DATABASE_URL='postgresql://postgres:rat8@localhost:55432/rat8' node --test server/tests/postgresIntegration.test.js
```

## Output (key lines)
```text
ok 1 - postgres migration runner + review persistence parity
ok 2 - postgres idempotency parity
1..2
# pass 2
# fail 0
# skipped 0
```

## Notes
- During first execution, parity tests exposed concrete gaps:
  - schema-scoped enum creation checks in Postgres migrations (`001`, `002`)
  - missing `idempotency_records` table in canonical Postgres migration
  - `psql` output parsing in Postgres repository (`SET` line handling)
- All gaps were fixed in-code and parity tests then passed non-skipped.
