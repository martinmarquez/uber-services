# RAT-392 Rollout Execution Checkpoint (2026-05-11)

Issue: RAT-392  
Owner: DevOps Engineer  
Related requirement: RAT-134 actor-signing production closure

## Wake Acknowledgement

Latest issue comment (`5c937388-3bb4-4a69-b34d-3b4f2a89e012`, 2026-05-11T09:23:21.515Z) rerouted RAT-392 ownership from CEO to DevOps for staging/production rollout evidence generation.

This checkpoint executes that reroute by validating prerequisites, confirming tooling, and preparing operator-ready evidence collection for staging/prod environments.

## Prerequisite Gate Check

1. Product brief gate: `PRODUCT_BRIEF.md` present and readable (gate satisfied).
2. Deployment strategy reference: `DEPLOY_CONFIG.md` not found in repo root and not found at:
   - `/Users/martinmarquez/.paperclip/instances/default/companies/ecee6d4c-08bc-4e67-af62-5f6eb884f553/agents/8dd474b9-148d-4918-9f17-34a47b499e08/instructions/DEPLOY_CONFIG.md`

## Evidence Tooling Verified

- `tools/guardrails/generate-rat-218-evidence.sh`
- `tools/guardrails/actor-signing-monitoring-summary.js`
- `docs/trust-safety/rat-218-edge-signing-rollout-runbook.md`
- `docs/trust-safety/rat-218-monitoring-evidence-runbook.md`
- `qa/test-results/rat-218-actor-signing-rollout-evidence-template.md`

## Why Full Evidence Could Not Be Executed In This Workspace

The required non-local inputs are unavailable in this execution environment:

- Staging base URL + signing secret
- Production base URL + signing secret
- Staging 24h AUTHENTICATION_ERROR NDJSON export
- Production 24h AUTHENTICATION_ERROR NDJSON export

Without those, commands cannot produce valid staging/prod rollout artifacts.

## Exact Commands For Platform/SRE (Unblock Path)

### 1) Staging smoke evidence

```bash
tools/guardrails/generate-rat-218-evidence.sh staging <staging_base_url> <actor_signing_secret> qa/test-results/rat-392-staging-enforcement-evidence-$(date +%F).md
```

### 2) Production smoke evidence

```bash
tools/guardrails/generate-rat-218-evidence.sh production <production_base_url> <actor_signing_secret> qa/test-results/rat-392-production-enforcement-evidence-$(date +%F).md
```

### 3) Staging 24h monitoring summary

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <staging_24h_authentication_error.ndjson> > qa/test-results/rat-392-staging-monitoring-summary-$(date +%F).json
```

### 4) Production 24h monitoring summary

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <production_24h_authentication_error.ndjson> > qa/test-results/rat-392-production-monitoring-summary-$(date +%F).json
```

## Required Attachments For RAT-392 Closure

1. Staging proof: `ACTOR_SIGNING_SECRET` provisioned.
2. Production proof: `ACTOR_SIGNING_SECRET` provisioned.
3. Staging proof: `ACTOR_SIGNING_ENFORCED=true` active.
4. Production proof: `ACTOR_SIGNING_ENFORCED=true` active.
5. Staging smoke artifact (command output file).
6. Production smoke artifact (command output file).
7. Staging 24h monitoring summary.
8. Production 24h monitoring summary.

## Status Recommendation

Keep RAT-392 in `blocked`.

- Unblock owner: `@platform-sre`
- Unblock action: run the four commands above in staging/production with live credentials and attach resulting evidence files to RAT-392.
