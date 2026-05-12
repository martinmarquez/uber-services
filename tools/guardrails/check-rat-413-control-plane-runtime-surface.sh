#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-413 runtime surface check"
echo "repo: $ROOT_DIR"

# Strict control-plane lifecycle signatures only (not product-domain review appeals).
PATTERN='(/api/issues|issue_status_changed|heartbeat-runs|checkout.*issue|issues/.*/checkout)'
HITS="$(rg -n "$PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -z "$HITS" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane issue lifecycle runtime signatures found in server/*"
  exit 2
fi

echo "RESULT=HAS_RUNTIME_SURFACE"
printf '%s\n' "$HITS"
