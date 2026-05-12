#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-435 terminal silent-run reopen surface check"
echo "repo: $ROOT_DIR"

# Control-plane lifecycle ownership signatures required for this fix.
PATTERN='(/api/issues|issue_status_changed|heartbeat-runs|checkout.*issue|issues/.*/checkout)'
HITS="$(rg -n "$PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -z "$HITS" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane lifecycle reopen signatures found in server/*"
  exit 2
fi

echo "RESULT=HAS_RUNTIME_SURFACE"
printf '%s\n' "$HITS"
