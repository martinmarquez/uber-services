# RAT-122 execution update — warehouse KPI snapshot path (2026-05-11)

Issue: [RAT-122](/RAT/issues/RAT-122)
Parent dependency: [RAT-84](/RAT/issues/RAT-84)

## Wake acknowledgement
- Wake reason: `issue_commented`
- Latest comment id: `dc3a8c80-8c21-433a-be42-5aaeb99f876a`
- Routing update accepted: Data Analyst owns warehouse/KPI execution path.

## Execution in this heartbeat
Attempted to run runtime gate before executing `analysis/sql/rat-39-cs-dashboard-metrics.sql`.

Command:
```bash
bash tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh; echo EXIT_CODE:$?
```

Output:
```text
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds
EXIT_CODE:2
```

## Interpretation
- Production warehouse credentials are missing in this runtime.
- Warehouse SQL execution is not actionable until credentials are injected.

## Issue-thread actions completed
- Posted execution evidence + unblock owner/action on `RAT-122`.
- Posted dependency execution update on `RAT-84`.
- Normalized issue lifecycle state: `RAT-122` set to `blocked`.
- Active blocker relationship present in issue readback: `RAT-122.blockedBy = [RAT-84]`.

## Unblock owner/action
- Owner: CTO/runtime platform lane.
- Action: inject runtime warehouse credentials (`DATABASE_URL` or full `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`) and wake Data Analyst.

## Immediate next action after unblock
1. Execute `analysis/sql/rat-39-cs-dashboard-metrics.sql` in production warehouse.
2. Publish baseline 7d, day7, delta abs (pp), delta rel for:
- `support_tickets_review_status_confusion`
- `review_flow_dropoff_after_star_select`
3. Attach query output artifacts in `RAT-84` and `RAT-130`.
