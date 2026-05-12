# RAT-134 Actor Signing Contract (API Edge)

Date: 2026-05-08  
Owner: Security Engineer

## Objective

Define the production contract for authenticated actor context so review/fraud/moderation flows do not trust unsigned identity headers.

## Required Headers

- `x-actor-id`: authenticated principal id
- `x-actor-roles`: comma-separated role list (example: `customer,moderator`)
- `x-actor-ts`: unix timestamp in seconds
- `x-actor-sig`: HMAC-SHA256 hex signature of:
  - `${x-actor-id}|${x-actor-roles}|${x-actor-ts}`

## Verification Behavior (Backend)

When actor signing secret is configured (`ACTOR_SIGNING_SECRET` or server `actorAuth.secret`):

- Missing `x-actor-ts` or `x-actor-sig` -> `401 AUTHENTICATION_ERROR` (`actor_signature_required`)
- Invalid timestamp -> `401 AUTHENTICATION_ERROR` (`invalid_actor_timestamp`)
- Expired/future timestamp outside skew window (default 300s) -> `401 AUTHENTICATION_ERROR` (`actor_signature_expired`)
- Invalid signature -> `401 AUTHENTICATION_ERROR` (`invalid_actor_signature`)

When no signing secret is configured:

- Current behavior remains backward-compatible for local/dev; actor is parsed from headers without signature enforcement.

## Security Requirements

- `ACTOR_SIGNING_SECRET` must be provisioned through secret manager (not source control).
- `ACTOR_SIGNING_ENFORCED=true` must be set in staging/production after secret provisioning. Backend now fails fast at startup when enforcement is enabled without a secret.
- Secret rotation cadence: <= 90 days.
- Edge signer and backend verifier must rotate in coordinated deploy windows.
- Time sync (NTP) is mandatory at edge/backend to avoid false expiry.

## Rollout Checklist

1. Provision `ACTOR_SIGNING_SECRET` in staging and production.
2. Enable edge middleware signing for all `/api/v1/*` and `/api/reviews` requests.
3. Run smoke tests for signed moderation/report/appeal/review creation routes.
4. Monitor `401 AUTHENTICATION_ERROR` rates by `details.code` for 24h.
5. Promote to enforced mode in all environments.
