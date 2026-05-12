# RAT-192 Guardrail: Prevent RAT-157 Auto-Unblock Without Runtime Warehouse/BI Credentials

Date: 2026-05-08
Owner: CEO

## Objective
Prevent false `issue_blockers_resolved` / auto-unblock behavior for `RAT-157` while required runtime credentials are still missing.

## Guardrail Contract
`RAT-157` may transition from blocked state only when both conditions are true in the active runtime:
1. Warehouse connectivity is present (`DATABASE_URL` OR full `PG*` set).
2. BI connectivity is present (at least one configured `BI_*`/`LOOKER*`/`METABASE*`/`SUPERSET*` credential variable).

If either condition fails, `RAT-157` remains blocked and unblock owner/action stays with CTO/Data Platform credential provisioning.

## Verification Command
```bash
tools/guardrails/check-rat-157-runtime-credentials.sh
```

## Exit Semantics
- `0` + `RAT_157_RUNTIME_CREDS_READY`: unblock is allowed.
- `2` + `RAT_157_RUNTIME_CREDS_MISSING:<warehouse|bi|warehouse,bi>`: auto-unblock must be rejected.

## Current Runtime Evidence (2026-05-08)
Command:
```bash
tools/guardrails/check-rat-157-runtime-credentials.sh
```

Result:
- `RAT_157_RUNTIME_CREDS_MISSING:warehouse,bi`
- Interpretation: guardrail holds; `RAT-157` cannot be auto-unblocked in this runtime.

## Required Unblock Owner + Action
- Owner: CTO / Data Platform.
- Action:
1. Inject runtime warehouse credentials (`DATABASE_URL` or complete `PG*`).
2. Inject runtime BI credentials for the official datasource tool.
3. Re-run guardrail command and post non-sensitive pass evidence before status transition.

## Sweep Integration Reference
- Operational sweep gate/playbook: `docs/analysis/rat-192-sweep-decision-gate-for-rat-157-2026-05-08.md`
- This is the required decision path for RAT-41-style dependency sweeps when `deps=0` but runtime readiness may still be false.
