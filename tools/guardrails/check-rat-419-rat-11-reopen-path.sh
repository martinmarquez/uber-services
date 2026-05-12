#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-419 RAT-11 reopen/status-drift runtime-surface check"
echo "repo: $ROOT_DIR"

control_hits="$(rg -n '(/api/issues|issue_status_changed|issues/.*/checkout|heartbeat-runs)' server/src server/tests server/scripts 2>/dev/null || true)"
policy_hits="$(rg -n '(done[^\n]{0,120}in_progress|in_progress[^\n]{0,120}done|resume\s*:\s*true|terminal[^\n]{0,120}reopen|no-delta)' server/src server/tests server/scripts 2>/dev/null || true)"
rat11_hits="$(rg -n 'RAT-11|rat-11' docs server tools 2>/dev/null || true)"

if [[ -z "$control_hits" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane issue lifecycle runtime signatures found in server/*"
  if [[ -n "$rat11_hits" ]]; then
    echo "RAT11_CONTEXT_HITS:"
    printf '%s\n' "$rat11_hits"
  fi
  exit 2
fi

if [[ -z "$policy_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_POLICY_SURFACE"
  echo "DETAIL=Control-plane signatures found but no explicit reopen-policy guard patterns"
  printf '%s\n' "$control_hits"
  exit 3
fi

echo "RESULT=HAS_RAT_419_SURFACES"
echo "CONTROL_PLANE_HITS:"
printf '%s\n' "$control_hits"
echo "POLICY_HITS:"
printf '%s\n' "$policy_hits"
if [[ -n "$rat11_hits" ]]; then
  echo "RAT11_CONTEXT_HITS:"
  printf '%s\n' "$rat11_hits"
fi
