#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-573 runtime surface check"
echo "repo: $ROOT_DIR"

API_PATTERN='(/api/issues|/api/admin/issues|stale[ _-]?in[ _-]?progress|bulk[ _-]?correction)'
STATE_FIELDS_PATTERN='(activeRunId|executionRunId)'
STATUS_PATTERN='(in_progress|to[_-]?do|todo)'

api_hits="$(rg -n "$API_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
state_hits="$(rg -n "$STATE_FIELDS_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
status_hits="$(rg -n "$STATUS_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -z "$api_hits" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No issue lifecycle admin API signatures found in server/*"
  exit 2
fi

if [[ -z "$state_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_STATE_FIELDS"
  echo "DETAIL=Issue lifecycle API signatures found, but activeRunId/executionRunId not found"
  printf '%s\n' "$api_hits"
  exit 3
fi

if [[ -z "$status_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_STATUS_SURFACE"
  echo "DETAIL=Lifecycle fields found, but no in_progress/todo status transition surface"
  printf '%s\n' "$api_hits"
  printf '%s\n' "$state_hits"
  exit 4
fi

echo "RESULT=HAS_RAT_573_SURFACES"
echo "API_HITS:"
printf '%s\n' "$api_hits"
echo "STATE_FIELD_HITS:"
printf '%s\n' "$state_hits"
echo "STATUS_HITS:"
printf '%s\n' "$status_hits"
