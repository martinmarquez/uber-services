# RAT-352: Executable SQL Runtime + Warehouse/BI Credential Gate for RAT-39 (2026-05-11)

Issue: RAT-352  
Parent readout context: RAT-39

## Objective
Validate whether the current issue runtime is actually executable for RAT-39 SQL readout work, not just configured with nominal credentials.

## Probes Executed (2026-05-11)

1. Runtime-path guardrail:

```bash
bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh; echo EXIT_CODE:$?
```

Output:

```text
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface
EXIT_CODE:2
```

2. Connectivity and identity probe:

```bash
psql "$DATABASE_URL" -Atqc "select current_database(), current_user, now();"
```

Output:

```text
neondb|neondb_owner|2026-05-11 03:29:19.15809+00
```

3. RAT-39 source-surface existence probe:

```bash
psql "$DATABASE_URL" -Atqc "select count(*) from information_schema.tables where table_schema='public' and table_name in ('events','support_tickets');"
```

Output:

```text
0
```

4. Non-system table inventory probe (first 200):

```bash
psql "$DATABASE_URL" -Atqc "select table_schema||'.'||table_name from information_schema.tables where table_schema not in ('pg_catalog','information_schema') order by 1 limit 200;"
```

Result: connection is live and populated, but surface does not expose `public.events` nor `public.support_tickets`.

## Conclusion
- Runtime credential injection is present and non-interactive SQL execution works.
- RAT-39 execution contract is still unmet because the connected warehouse surface is not the one required by RAT-39 SQL artifacts.
- RAT-352 cannot be closed as done; it must remain blocked on warehouse surface mapping/provisioning.

## Unblock Owner / Action
- Unblock owner: Data/Analytics Engineering + Data Platform.
- Required action:
  1. Point this runtime to the production warehouse/schema containing `public.events` and `public.support_tickets`, or
  2. Publish canonical RAT-39 table mapping replacement and update all RAT-39 SQL/guardrails in the same change set.
- Verification command for completion:

```bash
bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh
```

Ready signal must be exactly:

```text
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY
```

## Revalidation Delta (2026-05-11 00:32 ART)

Follow-up wake revalidation confirms partial progress and remaining blockers:

1. Credential gate:

```bash
bash tools/guardrails/check-rat-157-runtime-credentials.sh; echo EXIT_CODE:$?
```

Output:

```text
RAT_157_RUNTIME_CREDS_MISSING:bi
EXIT_CODE:2
```

2. SQL client compatibility:

```bash
psql --version; echo EXIT_CODE:$?
```

Output:

```text
psql (PostgreSQL) 18.3
EXIT_CODE:0
```

Interpretation:
- Prior SQL-client architecture concern is cleared in the current runtime (`psql` executes).
- Remaining blockers are:
  - missing BI credentials in runtime, and
  - missing RAT-39 source surface on the connected DB (`rat39_source_surface`).
