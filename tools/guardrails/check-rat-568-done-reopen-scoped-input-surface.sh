#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-568 runtime surface check"
echo "repo: $ROOT_DIR"

# Required ownership surfaces for this fix in the control-plane runtime.
CONTROL_PLANE_PATTERN='(/api/issues|issue_status_changed|issues/.*/checkout|checkout.*issue|heartbeat-runs)'
REOPEN_GUARD_PATTERN='(done[^\n]{0,80}in_progress|in_progress[^\n]{0,80}done|resume\s*:\s*true|terminal[^\n]{0,80}reopen)'
SCOPED_INPUT_PATTERN='(scoped[_-]?input|scope[d]?\s*input|input\s*gate|gate[^\n]{0,80}input)'

control_hits="$(rg -n "$CONTROL_PLANE_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
reopen_hits="$(rg -n "$REOPEN_GUARD_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
scoped_hits="$(rg -n "$SCOPED_INPUT_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -z "$control_hits" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane lifecycle runtime signatures found in server/*"
  exit 2
fi

if [[ -z "$reopen_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_REOPEN_GUARD_SURFACE"
  echo "DETAIL=Control-plane runtime found, but no done<->in_progress reopen guard signatures"
  printf '%s\n' "$control_hits"
  exit 3
fi

if [[ -z "$scoped_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_SCOPED_INPUT_GATE"
  echo "DETAIL=Control-plane runtime found, but no scoped-input gate signatures"
  printf '%s\n' "$control_hits"
  exit 4
fi

echo "RESULT=HAS_RAT_568_SURFACES"
echo "CONTROL_PLANE_HITS:"
printf '%s\n' "$control_hits"
echo "REOPEN_GUARD_HITS:"
printf '%s\n' "$reopen_hits"
echo "SCOPED_INPUT_GATE_HITS:"
printf '%s\n' "$scoped_hits"
