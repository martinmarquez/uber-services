#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-404 lifecycle reopen ownership check"
echo "repo: $ROOT_DIR"

CONTROL_PLANE_PATTERN='(/api/issues|issue_status_changed|issues/.*/checkout|checkout.*issue|heartbeat-runs)'
REOPEN_PATTERN='(done[^\n]{0,120}in_progress|in_progress[^\n]{0,120}done|resume\s*:\s*true|terminal[^\n]{0,120}reopen)'
ACTIONABLE_PATTERN='(new\s+comment|approval\s+stage|blocker\s+resolv|actionable\s+context|scope\s+delta)'

control_hits="$(rg -n "$CONTROL_PLANE_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
reopen_hits="$(rg -n "$REOPEN_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
actionable_hits="$(rg -n "$ACTIONABLE_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -z "$control_hits" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane issue lifecycle runtime signatures found in server/*"
  exit 2
fi

if [[ -z "$reopen_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_REOPEN_GUARD_SURFACE"
  echo "DETAIL=Control-plane runtime signatures found, but no done->in_progress guard signatures"
  printf '%s\n' "$control_hits"
  exit 3
fi

if [[ -z "$actionable_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_ACTIONABLE_TRIGGER_GATING_SURFACE"
  echo "DETAIL=Control-plane runtime signatures found, but no explicit actionable-context trigger signatures"
  printf '%s\n' "$control_hits"
  exit 4
fi

echo "RESULT=HAS_RAT_404_SURFACES"
echo "CONTROL_PLANE_HITS:"
printf '%s\n' "$control_hits"
echo "REOPEN_GUARD_HITS:"
printf '%s\n' "$reopen_hits"
echo "ACTIONABLE_TRIGGER_HITS:"
printf '%s\n' "$actionable_hits"
