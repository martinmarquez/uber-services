# RAT-304 READY Evidence Bundle

Generated at (UTC): 2026-05-11T03:57:47Z

## Inputs

- RAT-157 guard: `/Users/martinmarquez/uber-services/tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
- RAT-41/RAT-235 gate: `/Users/martinmarquez/uber-services/tools/guardrails/check-rat-41-rat-235-auto-unblock.sh`
- Same-thread evidence file used: `(auto-generated ephemeral file)`

## RAT-157 Runtime Guard

- Exit code: `2`

```text
RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds
```

## RAT-41 RAT-235 Auto-Unblock Gate

- Exit code: `2`

```text
RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface
```

## Decision

NOT READY. Keep RAT-235 blocked with reason `rat39_source_surface`.
