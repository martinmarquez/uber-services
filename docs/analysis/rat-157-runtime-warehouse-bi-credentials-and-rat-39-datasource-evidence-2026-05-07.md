# RAT-157 Runtime Warehouse + BI Credential Provisioning and RAT-39 Datasource Evidence (2026-05-07)

## Objective
Provision runtime warehouse and BI credentials, then publish verifiable datasource evidence for RAT-39 dashboard operations.

## Goal Gate (Quarterly OKR Alignment)
This work is on the critical path for KPI reliability and CEO dashboard freshness (revenue/churn risk visibility). Without datasource activation, RAT-39 cannot provide D+2/D+7 operational readouts.

## Scope
1. Verify runtime warehouse credential injection.
2. Verify runtime BI credential and datasource access.
3. Publish RAT-39 datasource evidence package (object name, datasource id, refresh SLA, timezone, ownership).

## Verification Executed (2026-05-07)

### 1. Runtime environment check
Command:
```bash
printenv | rg '^(PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|DATABASE_URL|BI_|LOOKER|METABASE|SUPERSET)'
```
Observed:
- `NO_WAREHOUSE_OR_BI_ENV_VARS`

### 2. Warehouse connectivity check
Command:
```bash
psql -Atqc "select current_user, current_database(), now();"
```
Observed:
- Interactive password prompt appears for local user.
- Authentication fails: `fe_sendauth: no password supplied`.

Interpretation:
- This execution runtime has no injected warehouse credentials.
- BI credential variables are also absent.

## RAT-39 Datasource Evidence Status
Evidence cannot be published yet because datasource creation/binding requires warehouse and BI access in runtime.

Pending evidence bundle (to post once unblocked):
- Materialized object/view name for RAT-39 operational dataset.
- BI datasource identifier and workspace URL/path.
- Refresh cadence and timezone (target: daily 09:00 ART alert window).
- Access ACL proof for CS + Data Analyst role.
- First successful query timestamp and checksum/sample row count.

## Unblock Owner and Required Action
- Owner: CTO / Data Platform (credential and schema owner)
- Immediate actions:
  1. Inject runtime warehouse credentials (`PG*` or `DATABASE_URL`) via secret manager.
  2. Inject BI connector credentials/config for official BI tool.
  3. Confirm target warehouse schema/table compatibility for `analysis/sql/rat-39-cs-dashboard-operational-view.sql`.
  4. Post non-sensitive validation output and datasource metadata in RAT-157 + RAT-39 threads.

## Board Escalation Gate
If credentials + datasource evidence are not available by next operating cycle, escalate to Board due to KPI latency risk on revenue/churn monitoring.

## Auto-Unblock Guardrail (2026-05-08)
- Reference: `docs/analysis/rat-192-rat-157-auto-unblock-guardrail-2026-05-08.md`
- Runtime gate command:
  ```bash
  tools/guardrails/check-rat-157-runtime-credentials.sh
  ```
- Rule: if command output starts with `RAT_157_RUNTIME_CREDS_MISSING`, RAT-157 must remain blocked and cannot be auto-unblocked.
