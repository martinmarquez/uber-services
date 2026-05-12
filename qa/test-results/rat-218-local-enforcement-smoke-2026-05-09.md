# RAT-218 Local Enforcement Smoke Evidence (2026-05-09)

Issue: RAT-218
Related: RAT-134
Scope: Local runtime verification of actor-signing enforcement behavior.

## Environment

- Runtime: local `createApiServer` on `127.0.0.1:3801`
- `ACTOR_SIGNING_SECRET=local-test-secret`
- `ACTOR_SIGNING_ENFORCED=true`
- Command:

```bash
tools/guardrails/actor-signing-smoke.sh http://127.0.0.1:3801 local-test-secret
```

## Results

### Case 1: signed request

- Expected: success (non-authentication failure)
- Actual: `HTTP/1.1 201 Created`
- Evidence:
  - Response body contains `"ok":true`
  - Service request created for actor `cus-smoke-1`

### Case 2: unsigned actor headers

- Expected: `401 AUTHENTICATION_ERROR` with `actor_signature_required`
- Actual: `HTTP/1.1 401 Unauthorized`
- Evidence: `"details":{"code":"actor_signature_required"}`

### Case 3: tampered signature

- Expected: `401 AUTHENTICATION_ERROR` with `invalid_actor_signature`
- Actual: `HTTP/1.1 401 Unauthorized`
- Evidence: `"details":{"code":"invalid_actor_signature"}`

## Raw Output Snapshot

```text
== Case 1: signed request should succeed (201 or business-validation rejection, but not AUTHENTICATION_ERROR) ==
HTTP/1.1 201 Created
...
{"ok":true,...}

== Case 2: unsigned actor headers should fail with actor_signature_required ==
HTTP/1.1 401 Unauthorized
...
{"error":{"code":"AUTHENTICATION_ERROR",...,"details":{"code":"actor_signature_required"}}}

== Case 3: tampered signature should fail with invalid_actor_signature ==
HTTP/1.1 401 Unauthorized
...
{"error":{"code":"AUTHENTICATION_ERROR",...,"details":{"code":"invalid_actor_signature"}}}
```

## Interpretation

- Enforcement path is operational when secret + enforced flag are enabled.
- Signature validation and rejection paths match RAT-134 contract.
- This is local evidence only; staging/production proof and 24h monitoring evidence are still required for RAT-218 closure.

