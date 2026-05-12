#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Required env:
#   PAPERCLIP_BASE_URL  e.g. https://paperclip.example.com
#   PAPERCLIP_API_TOKEN bearer token with issue read/write scope
# Optional:
#   DRY_RUN=1 (default)  set DRY_RUN=0 to execute PATCH calls
#   COMPANY_ID override, if not extracted from snapshot

DRY_RUN="${DRY_RUN:-1}"
SNAPSHOT_PATH="$(ls -1t qa/test-results/rat-*-issues-export-*.json qa/test-results/rat-709-cto-cluster-snapshot-*.json 2>/dev/null | head -n1 || true)"
OUT_FILE="qa/test-results/rat-795-devops-blockedby-apply-attempt-$(date -u +"%Y-%m-%dT%H%M%SZ").txt"

if [[ -z "$SNAPSHOT_PATH" || ! -f "$SNAPSHOT_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_SNAPSHOT"
  echo "DETAIL=No issue snapshot available under qa/test-results"
  exit 2
fi

COMPANY_ID="${COMPANY_ID:-$(jq -r '.[0].companyId // empty' "$SNAPSHOT_PATH")}"
if [[ -z "$COMPANY_ID" ]]; then
  echo "RESULT=BLOCKED_MISSING_COMPANY_ID"
  echo "DETAIL=Could not resolve companyId from snapshot and COMPANY_ID not provided"
  exit 3
fi

pairs=(
  "RAT-691:RAT-554"
  "RAT-388:RAT-721"
  "RAT-392:RAT-747"
  "RAT-659:RAT-579"
  "RAT-632:RAT-292"
  "RAT-568:RAT-428"
  "RAT-646:RAT-639"
  "RAT-573:RAT-582"
  "RAT-428:RAT-568"
  "RAT-346:RAT-347"
)

mkdir -p "$(dirname "$OUT_FILE")"
{
  echo "RAT-795 blocker-edge apply attempt"
  echo "date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "snapshot=$SNAPSHOT_PATH"
  echo "company_id=$COMPANY_ID"
  echo "dry_run=$DRY_RUN"

  if [[ "$DRY_RUN" != "0" ]]; then
    echo "MODE=DRY_RUN"
  elif [[ -z "${PAPERCLIP_BASE_URL:-}" || -z "${PAPERCLIP_API_TOKEN:-}" ]]; then
    echo "RESULT=BLOCKED_MISSING_CONTROL_PLANE_CREDS"
    echo "DETAIL=PAPERCLIP_BASE_URL and PAPERCLIP_API_TOKEN are required for live mutation mode"
    exit 4
  fi

  missing=0
  applied=0
  verified=0

  for pair in "${pairs[@]}"; do
    issue_identifier="${pair%%:*}"
    blocker_identifier="${pair##*:}"

    issue_id="$(jq -r --arg id "$issue_identifier" '.[] | select(.identifier==$id) | .id' "$SNAPSHOT_PATH" | head -n1)"
    blocker_id="$(jq -r --arg id "$blocker_identifier" '.[] | select(.identifier==$id) | .id' "$SNAPSHOT_PATH" | head -n1)"

    if [[ -z "$issue_id" || -z "$blocker_id" || "$issue_id" == "null" || "$blocker_id" == "null" ]]; then
      echo "MISS: could not resolve ids for $issue_identifier -> $blocker_identifier"
      missing=$((missing + 1))
      continue
    fi

    echo "TARGET: $issue_identifier($issue_id) -> $blocker_identifier($blocker_id)"

    if [[ "$DRY_RUN" != "0" ]]; then
      echo "DRY: PATCH /api/issues/$issue_id {blockedByIssueIds:[\"$blocker_id\"]}"
      continue
    fi

    patch_status="$(curl -sS -o /tmp/rat795_patch.json -w '%{http_code}' \
      -X PATCH "$PAPERCLIP_BASE_URL/api/issues/$issue_id" \
      -H "Authorization: Bearer $PAPERCLIP_API_TOKEN" \
      -H 'Content-Type: application/json' \
      --data "{\"blockedByIssueIds\":[\"$blocker_id\"]}")"

    if [[ "$patch_status" != "200" ]]; then
      echo "FAIL: PATCH $issue_identifier http=$patch_status"
      continue
    fi
    applied=$((applied + 1))

    readback="$(curl -sS -X GET "$PAPERCLIP_BASE_URL/api/companies/$COMPANY_ID/issues?limit=500" -H "Authorization: Bearer $PAPERCLIP_API_TOKEN")"
    has_edge="$(printf '%s' "$readback" | jq -r --arg issue "$issue_identifier" --arg bid "$blocker_id" '[.issues[]? // .[]? | select(.identifier==$issue) | ((.blockedByIssueIds // []) | index($bid))] | any(. != null)')"

    if [[ "$has_edge" == "true" ]]; then
      echo "PASS: readback confirms $issue_identifier -> $blocker_identifier"
      verified=$((verified + 1))
    else
      echo "FAIL: readback missing $issue_identifier -> $blocker_identifier"
    fi
  done

  echo "summary_missing_id_resolution=$missing"
  echo "summary_applied=$applied"
  echo "summary_verified=$verified"

  if [[ "$DRY_RUN" != "0" ]]; then
    echo "RESULT=READY_TO_APPLY"
    echo "DETAIL=Dry-run generated exact API mutation plan for 10 DevOps blocker edges"
  elif [[ "$verified" -eq 10 ]]; then
    echo "RESULT=PASS_ALL_EDGES_VERIFIED"
    echo "DETAIL=All 10 blocker edges persisted and verified in readback"
  else
    echo "RESULT=PARTIAL_OR_FAILED"
    echo "DETAIL=One or more blocker edges failed to apply/verify"
    exit 5
  fi
} | tee "$OUT_FILE"

echo "artifact=$OUT_FILE"
