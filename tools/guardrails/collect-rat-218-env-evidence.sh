#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <env_name> <base_url> <actor_signing_secret> <output_md_file> [auth_24h_ndjson]"
  exit 1
fi

ENV_NAME="$1"
BASE_URL="$2"
SECRET="$3"
OUT_FILE="$4"
LOG_FILE="${5:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

"$SCRIPT_DIR/generate-rat-218-evidence.sh" "$ENV_NAME" "$BASE_URL" "$SECRET" "$OUT_FILE"

if [[ -n "$LOG_FILE" ]]; then
  SUMMARY="$(node "$SCRIPT_DIR/actor-signing-monitoring-summary.js" "$LOG_FILE")"
  {
    echo
    echo "## 24h AUTHENTICATION_ERROR Summary"
    echo
    echo '```json'
    echo "$SUMMARY"
    echo '```'
  } >> "$OUT_FILE"
fi

echo "Collected evidence for $ENV_NAME into $OUT_FILE"
