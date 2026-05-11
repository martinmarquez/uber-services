#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

PATTERN='(/api/issues|issues/.*/checkout|issue_status_changed|issue_blockers_resolved|heartbeat-runs|open_routine_duplicate_execution_blocked)'

hits="$(rg -n "$PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -n "$hits" ]]; then
  echo "STATUS=present"
  echo "DETAIL=Potential control-plane lifecycle surfaces found"
  echo "${hits}"
else
  echo "STATUS=absent"
  echo "DETAIL=No control-plane /api/issues lifecycle runtime signatures found in server/*"
  echo "UNBLOCK_OWNER=Control-plane lifecycle runtime maintainer"
  echo "UNBLOCK_ACTION=Implement scoped resume gate in owning /api/issues transition + checkout/wake handlers and attach replay evidence"
fi
