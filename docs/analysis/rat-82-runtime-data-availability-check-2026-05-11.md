# RAT-82 runtime data availability check (2026-05-11 ART)

Context: wake `issue_blockers_resolved` for RAT-82 to complete day-7 readout.

## Outcome

- Warehouse/runtime credentials: **OK**
- KPI source data availability for RAT-39 definitions: **BLOCKED (empty source)**

## Evidence

### 1) Connectivity is working

```sql
select now(), current_user, current_database();
```

Observed:
- `current_user=neondb_owner`
- `current_database=neondb`

### 2) Source tables expected by KPI definitions have no rows

Checked:
- `public.analytics_events`
- `public.analytics_events_archive`
- `public.kpi_snapshot_daily`

All returned `count(*) = 0`.

### 3) Consequence for RAT-82

Cannot compute required day-7 deltas:
- `support_tickets_review_status_confusion`
- `review_flow_dropoff_after_star_select`

because there is no baseline/eval series in the currently accessible data surface.

## Required unblock action

Owner: Data Platform / Analytics Engineering

1. Provide analytics surface with non-empty day-7 series for RAT-40/RAT-39 metrics, either by:
- populating canonical source tables, or
- supplying approved table mappings + parity proof to equivalent populated tables.
2. Post dataset cutoff timestamp (ART) and row-count proof in RAT-82 thread.
3. Wake Data Analyst for immediate readout and final recommendation publication.
