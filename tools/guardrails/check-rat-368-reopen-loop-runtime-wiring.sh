#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-368 runtime wiring acceptance check"
echo "repo: $ROOT_DIR"

CONTROL_PLANE_PATTERN='(/api/issues|issue_status_changed|issues/.*/checkout|checkout.*issue|heartbeat-runs)'
control_hits="$(rg -n "$CONTROL_PLANE_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -z "$control_hits" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane lifecycle runtime signatures found in server/*"
  exit 2
fi

# Wiring must happen outside guardrail utility definitions/tests.
wiring_hits="$(
  rg -n 'shouldEmitStatusChangedWake|shouldAllowStatusMutation|readPersistedTerminalStatus|persistTerminalIssueState' \
    server/src server/tests server/scripts tools 2>/dev/null \
    | rg -v 'tools/guardrails/issueLifecycleGuard(\\.test)?\\.js' \
    || true
)"

if [[ -z "$wiring_hits" ]]; then
  echo "RESULT=BLOCKED_RUNTIME_NOT_WIRED"
  echo "DETAIL=Control-plane runtime signatures exist, but RAT-368 guardrail calls are not wired outside utility definitions/tests"
  echo "CONTROL_PLANE_HITS:"
  printf '%s\n' "$control_hits"
  exit 3
fi

echo "RESULT=PASS_RUNTIME_WIRED"
echo "CONTROL_PLANE_HITS:"
printf '%s\n' "$control_hits"
echo "WIRING_HITS:"
printf '%s\n' "$wiring_hits"
