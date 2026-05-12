#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <staging|production|custom-env> [monitor_ndjson_file]"
  exit 1
fi

ENV_NAME="$1"
MONITOR_FILE="${2:-}"

BASE_URL="${RAT218_BASE_URL:-}"
SECRET="${RAT218_ACTOR_SIGNING_SECRET:-}"
OUT_DIR="${RAT218_OUT_DIR:-qa/test-results}"
DATE_TAG="$(date +%F)"

if [[ -z "$BASE_URL" ]]; then
  echo "Missing RAT218_BASE_URL"
  exit 1
fi

if [[ -z "$SECRET" ]]; then
  echo "Missing RAT218_ACTOR_SIGNING_SECRET"
  exit 1
fi

mkdir -p "$OUT_DIR"
OUT_FILE="$OUT_DIR/rat-218-${ENV_NAME}-enforcement-evidence-${DATE_TAG}.md"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ -n "$MONITOR_FILE" ]]; then
  "$SCRIPT_DIR/collect-rat-218-env-evidence.sh" "$ENV_NAME" "$BASE_URL" "$SECRET" "$OUT_FILE" "$MONITOR_FILE"
else
  "$SCRIPT_DIR/collect-rat-218-env-evidence.sh" "$ENV_NAME" "$BASE_URL" "$SECRET" "$OUT_FILE"
fi

echo "RAT-218 evidence written to: $OUT_FILE"
