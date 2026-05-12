# RAT-218 Closure Evidence Bundle (2026-05-11)

Issue: RAT-218  
Related: RAT-134

## 1) Code and Guardrail Deliverables (Completed)

- Enforcement startup guard added (`ACTOR_SIGNING_ENFORCED` requires secret):
  - `server/src/http/server.js`
- Actor signature verifier contract enforced at API edge:
  - `server/src/security/actorAuth.js`
- Reusable signer utility for edge parity:
  - `server/src/security/actorSignature.js`
- Smoke automation tools:
  - `tools/guardrails/actor-signing-smoke.sh`
  - `tools/guardrails/generate-rat-218-evidence.sh`
- Monitoring summarizer:
  - `tools/guardrails/actor-signing-monitoring-summary.js`

## 2) Verification Evidence (Completed)

### Unit/API tests

Command:

```bash
node --test server/tests/actorAuth.test.js server/tests/httpServer.test.js
```

Result:
- PASS: 18/18 tests

### Local runtime enforcement smoke

Artifacts:
- `qa/test-results/rat-218-local-enforcement-smoke-2026-05-09.md`
- `qa/test-results/rat-218-local-enforcement-auto-evidence-2026-05-09.md`

Observed:
- Signed request: `HTTP 201`
- Unsigned request: `HTTP 401` + `actor_signature_required`
- Tampered signature: `HTTP 401` + `invalid_actor_signature`

## 3) Runbooks and Templates (Completed)

- Edge rollout runbook:
  - `docs/trust-safety/rat-218-edge-signing-rollout-runbook.md`
- Monitoring readout runbook:
  - `docs/trust-safety/rat-218-monitoring-evidence-runbook.md`
- Rollout evidence template:
  - `qa/test-results/rat-218-actor-signing-rollout-evidence-template.md`

## 4) Remaining Closure Requirements (Pending Platform/SRE Evidence)

1. Staging proof: `ACTOR_SIGNING_SECRET` provisioned.
2. Production proof: `ACTOR_SIGNING_SECRET` provisioned.
3. Staging proof: `ACTOR_SIGNING_ENFORCED=true` active.
4. Production proof: `ACTOR_SIGNING_ENFORCED=true` active.
5. Staging smoke execution evidence using:
   - `tools/guardrails/generate-rat-218-evidence.sh`
6. Production smoke execution evidence using:
   - `tools/guardrails/generate-rat-218-evidence.sh`
7. 24h staging/prod auth monitoring breakdown using:
   - `tools/guardrails/actor-signing-monitoring-summary.js`

## 5) Exact Commands for Platform/SRE

### Staging smoke evidence

```bash
tools/guardrails/generate-rat-218-evidence.sh staging <staging_base_url> <actor_signing_secret> qa/test-results/rat-218-staging-enforcement-evidence-$(date +%F).md
```

### Production smoke evidence

```bash
tools/guardrails/generate-rat-218-evidence.sh production <production_base_url> <actor_signing_secret> qa/test-results/rat-218-production-enforcement-evidence-$(date +%F).md
```

### 24h monitoring summaries

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <staging_24h.ndjson>
node tools/guardrails/actor-signing-monitoring-summary.js <production_24h.ndjson>
```

## 6) Status Recommendation

- Keep RAT-218 `in_progress` until Section 4 evidence is attached.
- Once attached, move RAT-218 to closure review as closure-ready.

