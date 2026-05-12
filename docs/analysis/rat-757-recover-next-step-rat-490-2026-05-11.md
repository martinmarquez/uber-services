# RAT-757 Recover Missing Next Step — RAT-490 (2026-05-11)

Issue: RAT-757  
Target: RAT-490

## Problem
RAT-490 had implementation and sqlite-backed verification completed, but the issue lacked an explicit executable next action to finish the remaining hardening gate.

## Recovered next step
Run the Postgres integration path with a real `DATABASE_URL`, capture non-skip pass output, and post evidence to RAT-490; then close RAT-490 as `done`.

## Why this is the correct next step
- Repository-layer appeal persistence/cooldown enforcement is already implemented.
- Existing checkpoint explicitly marks Postgres non-skip proof as the residual closure gate.
- Without this run, distributed-storage hardening remains partially evidenced.

## Evidence basis
- `docs/reviews/rat-490-storage-backed-appeal-state-checkpoint-2026-05-11.md`
- `docs/reviews/rat-490-security-audit-appeal-repository-followup-2026-05-11.md`

## Execution contract (operational)
1. In runtime with `DATABASE_URL` set, execute:
   - `node --test server/tests/postgresIntegration.test.js server/tests/reviewService.test.js`
2. Require explicit non-skip evidence in output:
   - Postgres cross-instance appeal state test executed and passed.
   - No failing tests in invoked suite.
3. Post command + summarized result on RAT-490.
4. Transition RAT-490 to `done` in the same heartbeat once evidence is attached.

## Owner and SLA
- Owner: backend assignee of RAT-490.
- SLA: complete within the next active heartbeat after runtime credentials are available.

## Escalation trigger
If Postgres runtime credentials are unavailable or tests fail, mark RAT-490 `blocked` with unblock owner/action and attach failing output artifact.
