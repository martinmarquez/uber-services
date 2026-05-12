# RAT-218 Edge Signing Rollout Runbook

Date: 2026-05-09
Owner: Security / Platform

## Objective

Enable edge actor-signing for all backend requests hitting:
- `/api/v1/*`
- `/api/reviews`

## Required Runtime Configuration

Backend:
- `ACTOR_SIGNING_SECRET` provisioned from secret manager
- `ACTOR_SIGNING_ENFORCED=true`

Edge signer:
- Same shared secret as backend verifier
- NTP-synced clock

## Signing Contract

Compute:
- `x-actor-sig = HMAC_SHA256(secret, "${x-actor-id}|${x-actor-roles}|${x-actor-ts}")`

Headers to send:
- `x-actor-id`
- `x-actor-roles`
- `x-actor-ts` (unix seconds)
- `x-actor-sig` (hex)

## Reference Implementation (Node/JS middleware layer)

```js
import { createActorSignatureHeaders } from "../../server/src/security/actorSignature.js";

function signOutboundActorHeaders({ actorId, roles, secret }) {
  return createActorSignatureHeaders({ actorId, roles, secret });
}
```

## Rollout Steps

1. Provision `ACTOR_SIGNING_SECRET` in staging and production secret managers.
2. Enable edge signer for `/api/v1/*` and `/api/reviews`.
3. Set backend `ACTOR_SIGNING_ENFORCED=true` after edge signer deploy.
4. Run smoke script in each environment:

```bash
tools/guardrails/actor-signing-smoke.sh <base_url> <actor_signing_secret>
```

5. Collect 24h auth monitoring by `details.code` and attach evidence.

## Evidence Destination

Populate:
- `qa/test-results/rat-218-actor-signing-rollout-evidence-template.md`

