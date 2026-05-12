# RAT-305 Fix: Prevent RAT-303/RAT-191 Auto-Unblock While Credential Guard Fails (2026-05-10)

Issue: [RAT-305](/RAT/issues/RAT-305)  
Scope target: RAT-41 dependency-sweep unblock behavior for [RAT-303](/RAT/issues/RAT-303) and [RAT-191](/RAT/issues/RAT-191)

## Regression
RAT-303 could be auto-unblocked from dependency-only readiness (`deps=0`) even when RAT-191 runtime warehouse credential guard remained non-READY.

## Fix implemented in this repo
Added dedicated executable guardrail command for RAT-303:

- `tools/guardrails/check-rat-303-runtime-warehouse-credentials.sh`

Decision contract:

1. Run RAT-191 guard (`tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh`) as source of truth.
2. Return `RAT_303_RUNTIME_WAREHOUSE_CREDS_READY` with exit `0` only when RAT-191 returns READY.
3. Return `RAT_303_RUNTIME_WAREHOUSE_CREDS_MISSING` with exit `2` otherwise.

## Verification
Commands run:

```bash
bash tools/guardrails/check-rat-303-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
DATABASE_URL='postgres://example' bash tools/guardrails/check-rat-303-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_303_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
RAT_303_RUNTIME_WAREHOUSE_CREDS_READY
EXIT_CODE:0
```

## Operational rule for RAT-41 sweeps
Do not auto-unblock RAT-303 (or RAT-191) on `deps=0` without fresh READY output from the corresponding runtime guard command posted in-thread.

Unblock owner: CTO / Data Platform  
Required action: inject runtime warehouse credentials and post passing guard output before unblock.
