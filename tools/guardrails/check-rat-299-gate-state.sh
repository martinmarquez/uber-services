#!/usr/bin/env bash
set -euo pipefail

: "${PAPERCLIP_API_URL:?missing PAPERCLIP_API_URL}"
: "${PAPERCLIP_API_KEY:?missing PAPERCLIP_API_KEY}"

issue_json="$(curl -sS -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" "${PAPERCLIP_API_URL}/api/issues/RAT-299")"
status="$(printf '%s' "$issue_json" | jq -r '.status')"
updated_at="$(printf '%s' "$issue_json" | jq -r '.updatedAt')"

if [[ "$status" != "blocked" ]]; then
  echo "FAIL: RAT-299 gate drift detected (status=${status}, updatedAt=${updated_at}). Expected blocked." >&2
  exit 1
fi

echo "PASS: RAT-299 gate is blocked (updatedAt=${updated_at})."
