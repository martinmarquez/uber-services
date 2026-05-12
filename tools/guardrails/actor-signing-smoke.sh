#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <base_url> <actor_signing_secret> [actor_id] [roles]"
  echo "Example: $0 https://staging.api.example.com supersecret cus-smoke-1 customer"
  exit 1
fi

BASE_URL="$1"
SECRET="$2"
ACTOR_ID="${3:-cus-smoke-1}"
ROLES="${4:-customer}"
TS="$(date +%s)"

make_sig() {
  local actor_id="$1"
  local roles="$2"
  local ts="$3"
  node -e 'const crypto=require("crypto");const [id,roles,ts,secret]=process.argv.slice(1);process.stdout.write(crypto.createHmac("sha256", secret).update(`${id}|${roles}|${ts}`).digest("hex"));' "$actor_id" "$roles" "$ts" "$SECRET"
}

SIGNED_SIG="$(make_sig "$ACTOR_ID" "$ROLES" "$TS")"
TAMPERED_SIG="${SIGNED_SIG%?}0"

BODY='{"idempotencyKey":"rat-218-smoke-'"$TS"'","providerUserId":"prov-1","category":"cleaning","city":"Buenos Aires","notes":"RAT-218 actor signing smoke request body","scheduledAt":"2026-05-11T10:00:00.000Z"}'

echo "== Case 1: signed request should succeed (201 or business-validation rejection, but not AUTHENTICATION_ERROR) =="
curl -sS -i -X POST "$BASE_URL/api/v1/service-requests" \
  -H "content-type: application/json" \
  -H "x-actor-id: $ACTOR_ID" \
  -H "x-actor-roles: $ROLES" \
  -H "x-actor-ts: $TS" \
  -H "x-actor-sig: $SIGNED_SIG" \
  --data "$BODY"

echo "\n== Case 2: unsigned actor headers should fail with actor_signature_required =="
curl -sS -i -X POST "$BASE_URL/api/v1/service-requests" \
  -H "content-type: application/json" \
  -H "x-actor-id: $ACTOR_ID" \
  -H "x-actor-roles: $ROLES" \
  --data "$BODY"

echo "\n== Case 3: tampered signature should fail with invalid_actor_signature =="
curl -sS -i -X POST "$BASE_URL/api/v1/service-requests" \
  -H "content-type: application/json" \
  -H "x-actor-id: $ACTOR_ID" \
  -H "x-actor-roles: $ROLES" \
  -H "x-actor-ts: $TS" \
  -H "x-actor-sig: $TAMPERED_SIG" \
  --data "$BODY"

