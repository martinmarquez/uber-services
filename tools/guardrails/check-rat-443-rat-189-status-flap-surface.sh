#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-443 RAT-189 status flap ownership surface check"
echo "repo: $ROOT_DIR"

# Control-plane lifecycle ownership signatures required for issue-status flap fixes.
# Scope to runtime server surfaces only; exclude local guardrail artifacts.
PATTERN='(/api/issues|issue_status_changed|heartbeat-runs|checkout.*issue|issues/.*/checkout)'
HITS="$(
  rg -n "$PATTERN" \
    server/src server/tests server/scripts \
    -g '!**/*.md' \
    -g '!**/*.txt' \
    2>/dev/null || true
)"

if [[ -z "$HITS" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane issue lifecycle runtime signatures found in server/*"
  exit 2
fi

echo "RESULT=HAS_RUNTIME_SURFACE"
printf '%s\n' "$HITS"
