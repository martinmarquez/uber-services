# RAT-156 BI/Warehouse Access Provisioning Evidence (2026-05-07)

## Objective
Provision platform access required to publish the RAT-39 CS dashboard from existing SQL artifacts.

## Scope from RAT-156
1. Materialize `analysis/sql/rat-39-cs-dashboard-operational-view.sql` in warehouse.
2. Enable BI datasource for CS dashboard consumers.
3. Confirm D+2/D+7 first readout window.

## Runtime Verification Performed
- Checked runtime environment for warehouse/BI connection variables (`PG*`, `DATABASE_URL`, `BI_*`, `LOOKER*`, `METABASE*`, `SUPERSET*`).
- Result: no warehouse or BI access variables are present in this runtime.

Command/result snapshot:
- Command: `printenv | rg '^(PG|DATABASE_URL|BI_|LOOKER|METABASE|SUPERSET)'`
- Output: `NO_WAREHOUSE_OR_BI_ENV_VARS`

## Decision
RAT-156 cannot complete materialization or BI datasource binding from this execution runtime until credentials and workspace-level BI access are provisioned.

## Unblock Owner and Action
- Unblock owner: Data/Analytics Engineering (assignee for RAT-39 stream).
- Required action:
  1. Provision read-only production warehouse credentials into execution runtime.
  2. Apply RAT-39 operational-view SQL in production warehouse.
  3. Configure BI datasource + dashboard permissions for Data Analyst.
  4. Post evidence on RAT-156 and RAT-39 with datasource identifier, refresh cadence, and D+2/D+7 checkpoint timestamp.

## Acceptance Evidence Required
- Warehouse object name for materialized operational view.
- Refresh policy (cadence + timezone).
- BI datasource connection identifier and access confirmation for Data Analyst.
- Parent RAT-39 comment linking concrete connection details.
