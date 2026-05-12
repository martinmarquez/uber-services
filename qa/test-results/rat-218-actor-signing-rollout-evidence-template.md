# RAT-218 Actor Signing Rollout Evidence Template

Date:
Owner:
Issue: RAT-218
Related issue: RAT-134

## 1) Secret Provisioning Confirmation

- Staging secret manager path/key:
- Production secret manager path/key:
- Rotation owner and next rotation due date:

Evidence links/screenshots:
- Staging:
- Production:

## 2) Runtime Enforcement Confirmation

Expected config in both environments:
- `ACTOR_SIGNING_ENFORCED=true`
- `ACTOR_SIGNING_SECRET` present

Recorded evidence:
- Staging runtime/env proof:
- Production runtime/env proof:

## 3) Signed Request Smoke Evidence

Command used:

```bash
tools/guardrails/actor-signing-smoke.sh <base_url> <actor_signing_secret> [actor_id] [roles]
```

### Staging

- Base URL:
- Timestamp:
- Case 1 (signed): status + key response lines:
- Case 2 (unsigned): status + `details.code`:
- Case 3 (tampered): status + `details.code`:

### Production

- Base URL:
- Timestamp:
- Case 1 (signed): status + key response lines:
- Case 2 (unsigned): status + `details.code`:
- Case 3 (tampered): status + `details.code`:

## 4) 24h Monitoring Readout (`AUTHENTICATION_ERROR` by `details.code`)

Suggested command (from exported NDJSON logs):

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <ndjson_log_file>
```

Monitoring window:
- Start (UTC):
- End (UTC):

Breakdown:
- `actor_signature_required`:
- `invalid_actor_signature`:
- `actor_signature_expired`:
- `invalid_actor_timestamp`:

Interpretation:
- Expected behavior observed?
- Any regressions or unusual spikes?
- Follow-up actions (if any):

## 5) Closure Statement

- RAT-218 rollout criteria met: yes/no
- Residual risk:
- Recommended issue status:

