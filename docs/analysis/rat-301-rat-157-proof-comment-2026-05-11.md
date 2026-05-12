@RAT-157 status proof from RAT-301 (2026-05-11 00:38 ART)

- Runtime SQL client compatibility: PASS
  - `psql --version` => `psql (PostgreSQL) 18.3`
- Runtime warehouse connectivity: BLOCKED
  - `psql -Atqc "select now();" </dev/null` =>
    - `Password for user martinmarquez:`
    - `psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: fe_sendauth: no password supplied`
- RAT-157 SQL runtime path guard:
  - `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh` => `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds` (exit `2`)

Decision:
- Do not unblock RAT-157 yet.

Unblock owner/action:
1. Owner: CTO / Data Platform
2. Inject runtime warehouse credentials in this workspace (`DATABASE_URL` or full `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`).
3. Re-run:
   - `psql -Atqc "select now();" </dev/null`
   - `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
4. Unblock only after guard output is `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY` (exit `0`).
