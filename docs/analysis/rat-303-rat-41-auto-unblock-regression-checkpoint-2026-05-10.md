# RAT-303 RAT-41 Auto-Unblock Regression Checkpoint (2026-05-10)

Issue: [RAT-303](/RAT/issues/RAT-303)  
Trigger comment: `0fa30804-7e7c-4b49-8092-8a3b636da8e5` ("Auto-unblocked in RAT-41 iterative sweep: deps=0.")

## What changed
RAT-303 was auto-unblocked by dependency-only signal (`deps=0`). This directly conflicts with RAT-191 credential-readiness gating requirements.

## Verification run
Command:

```bash
bash tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh; echo EXIT_CODE:$?
```

Observed output:

```text
RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING
EXIT_CODE:2
```

## Decision gate outcome
Auto-unblock is invalid while executable readiness remains false. RAT-191/RAT-303 must remain blocked until the runtime credential guard returns READY.

## Unblock owner/action
Owner: CTO / Data Platform

Action required:
1. Inject runtime warehouse credentials (`DATABASE_URL` or full `PG*`).
2. Re-run guard until `RAT_191_RUNTIME_WAREHOUSE_CREDS_READY` (`exit 0`).
3. Post passing evidence in RAT-191 and RAT-303 before any sweep-based unblock.
