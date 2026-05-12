#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-394 regression readiness check"
echo "repo: $ROOT_DIR"

control_plane_hits="$(rg -n '/api/issues|issues/.*/checkout|issue_status_changed|heartbeat-runs' server/src server/tests server/scripts 2>/dev/null || true)"
guard_hits="$(rg -n 'resume\\s*:\\s*true|terminal|reopen|dedupe_terminal' tools/guardrails/issueLifecycleGuard.js 2>/dev/null || true)"

if [[ -z "$control_plane_hits" ]]; then
  echo "STATUS=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane lifecycle runtime signatures found in server/*"
  echo "UNBLOCK_OWNER=@board"
  echo "UNBLOCK_ACTION=Attach/reroute to control-plane runtime workspace owning /api/issues transition + checkout/wake handlers"
  exit 0
fi

if [[ -z "$guard_hits" ]]; then
  echo "STATUS=READY_RUNTIME_PRESENT_GUARD_MISSING"
  echo "DETAIL=Control-plane lifecycle surface present but terminal reopen guard signatures missing in tools/guardrails/issueLifecycleGuard.js"
  echo "NEXT_ACTION=Implement resume-only terminal reopen guard + no-delta dedupe and publish replay evidence"
  exit 0
fi

echo "STATUS=READY_RUNTIME_PRESENT_GUARD_PRESENT"
echo "DETAIL=Control-plane lifecycle surface and guard signatures detected"
echo "NEXT_ACTION=Run replay suite and attach before/after run IDs for RAT-133 equivalent sequence"
