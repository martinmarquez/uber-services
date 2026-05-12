# RAT-392 Staging/Production Actor-Signing Rollout Evidence Status (2026-05-11)

Issue: RAT-392  
Related rollout contract: RAT-134

## Scope

Provide closure-ready evidence that actor-signing enforcement is deployed and operating in both staging and production.

## Evidence Already Present in Repository

1. Contract and enforcement implementation:
- `docs/trust-safety/rat-134-actor-signing-contract.md`
- `server/src/security/actorAuth.js`
- `server/src/security/actorSignature.js`

2. Rollout and monitoring runbooks:
- `docs/trust-safety/rat-218-edge-signing-rollout-runbook.md`
- `docs/trust-safety/rat-218-monitoring-evidence-runbook.md`

3. Automation tooling:
- `tools/guardrails/actor-signing-smoke.sh`
- `tools/guardrails/generate-rat-218-evidence.sh`
- `tools/guardrails/collect-rat-218-env-evidence.sh`
- `tools/guardrails/actor-signing-monitoring-summary.js`

4. Local enforcement proof (non-env):
- `qa/test-results/rat-218-local-enforcement-smoke-2026-05-09.md`
- `qa/test-results/rat-218-local-enforcement-auto-evidence-2026-05-09.md`
- `qa/test-results/rat-218-local-collected-evidence-2026-05-11.md`

## Missing Evidence Required for RAT-392 Closure

1. Staging proof that `ACTOR_SIGNING_SECRET` is provisioned.
2. Production proof that `ACTOR_SIGNING_SECRET` is provisioned.
3. Staging proof that `ACTOR_SIGNING_ENFORCED=true` is active at runtime.
4. Production proof that `ACTOR_SIGNING_ENFORCED=true` is active at runtime.
5. Staging smoke artifact generated from the live environment.
6. Production smoke artifact generated from the live environment.
7. 24h auth-error monitoring breakdown for staging.
8. 24h auth-error monitoring breakdown for production.

## Exact Collection Commands

### Staging smoke artifact

```bash
tools/guardrails/generate-rat-218-evidence.sh staging <staging_base_url> <actor_signing_secret> qa/test-results/rat-392-staging-enforcement-evidence-$(date +%F).md
```

### Production smoke artifact

```bash
tools/guardrails/generate-rat-218-evidence.sh production <production_base_url> <actor_signing_secret> qa/test-results/rat-392-production-enforcement-evidence-$(date +%F).md
```

### Staging 24h monitoring summary

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <staging_24h_authentication_error.ndjson>
```

### Production 24h monitoring summary

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <production_24h_authentication_error.ndjson>
```

## Ready-to-Attach Evidence Template

Use and complete:
- `qa/test-results/rat-218-actor-signing-rollout-evidence-template.md`

Recommended output files for this issue:
- `qa/test-results/rat-392-staging-enforcement-evidence-YYYY-MM-DD.md`
- `qa/test-results/rat-392-production-enforcement-evidence-YYYY-MM-DD.md`
- `qa/test-results/rat-392-monitoring-summary-YYYY-MM-DD.md`

## Current Issue State Recommendation

- RAT-392 should remain `blocked` until environment-level evidence (staging + production + 24h summaries) is attached.
- Unblock owner: Platform/SRE.
- Unblock action: run commands above in each environment and attach artifacts.
