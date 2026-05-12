# RAT-49 QA/Ops Quality Gate Readout (2026-05-10)

Issue: RAT-49  
Scope: quality gates, synthetic abuse suite, rollout runbook readiness

## Gate Decision

- Decision: `PASS (local QA gate)`
- Release posture: `CONDITIONAL` until env-level rollout evidence is attached.

## Evidence Executed In This Heartbeat

### 1) Synthetic abuse + security regression suite

Command:

```bash
node --test server/tests/*.test.js
```

Result:

- `tests`: 60
- `pass`: 58
- `fail`: 0
- `skipped`: 2 (Postgres parity tests)

Key abuse/quality assertions passing:

- `createReview ignores client-provided riskScore`
- `createReview rejects missing idempotency key`
- `transitionModeration rejects non-moderator actor`
- `signed actor mode rejects unsigned actor headers`
- `offline verifier detects payload tampering`
- `forbidden transition verificada->removida is denied`

### 2) Actor-signing enforcement runbook alignment

Validated runbook + local enforcement evidence are present and aligned:

- Runbook: `docs/trust-safety/rat-218-edge-signing-rollout-runbook.md`
- Local smoke evidence: `qa/test-results/rat-218-local-enforcement-smoke-2026-05-09.md`
- Auto-generated local evidence: `qa/test-results/rat-218-local-enforcement-auto-evidence-2026-05-09.md`

Local smoke behavior already evidenced:

- Signed request: `201`
- Unsigned request: `401 actor_signature_required`
- Tampered signature: `401 invalid_actor_signature`

## Quality Gate Mapping

- RAT-46 criterion #1 (synthetic abuse trace): covered by adversarial suite PASS.
- RAT-46 criterion #5 (QA abuse suite report): covered by this readout + test output.
- RAT-45 criterion #6 (QA gate linked evidence): covered by this QA artifact and existing RAT-45 closure bundle references.

## Residual Risks / Remaining Release Blockers

1. Postgres parity tests remain skipped in local run (`postgres migration runner + review persistence parity`, `postgres idempotency parity`).
2. Runbook step requiring environment smoke + 24h monitoring evidence is not re-executed in this heartbeat (staging/prod secrets + runtime required).

## Required Next Actions

1. Security/Platform: execute `tools/guardrails/actor-signing-smoke.sh` in staging and production and attach outputs.
2. Security/Platform: attach 24h auth monitoring summary by `details.code` per runbook.
3. Backend/QA: execute skipped Postgres parity tests in CI or env with Postgres available and attach evidence.
