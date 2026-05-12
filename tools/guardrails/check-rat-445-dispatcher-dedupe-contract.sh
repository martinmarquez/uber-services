#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-445 dispatcher dedupe contract check"
echo "repo: $ROOT_DIR"

GUARD_FILE="tools/guardrails/issueLifecycleGuard.js"
CONTROL_PLANE_PATTERN='(/api/issues|issue_status_changed|issues/.*/checkout|checkout.*issue|heartbeat-runs)'

if [[ ! -f "$GUARD_FILE" ]]; then
  echo "RESULT=BLOCKED_MISSING_GUARD_MODULE"
  echo "DETAIL=Expected guard module not found: $GUARD_FILE"
  exit 2
fi

payload_helper_hits="$(rg -n "export function buildWakeDedupeLogPayload" "$GUARD_FILE" || true)"
dedupe_reason_hits="$(rg -n "dedupe_terminal_resume_wake_without_comment_delta" "$GUARD_FILE" || true)"

if [[ -z "$payload_helper_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_DEDUPE_LOG_PAYLOAD_HELPER"
  echo "DETAIL=Missing buildWakeDedupeLogPayload helper in $GUARD_FILE"
  exit 3
fi

if [[ -z "$dedupe_reason_hits" ]]; then
  echo "RESULT=BLOCKED_MISSING_DEDUPE_REASON_CODE"
  echo "DETAIL=Missing dedupe reason code in $GUARD_FILE"
  exit 4
fi

control_hits="$(rg -n "$CONTROL_PLANE_PATTERN" server/src server/tests server/scripts 2>/dev/null || true)"
if [[ -z "$control_hits" ]]; then
  echo "RESULT=READY_FOR_EXTERNAL_DISPATCHER_INTEGRATION"
  echo "DETAIL=Guard contract is present locally; control-plane dispatcher surface is external to this repository"
  echo "GUARD_HELPER_HITS:"
  printf '%s\n' "$payload_helper_hits"
  echo "DEDUPE_REASON_HITS:"
  printf '%s\n' "$dedupe_reason_hits"
  exit 0
fi

echo "RESULT=READY_FOR_LOCAL_DISPATCHER_WIRING"
echo "DETAIL=Control-plane signatures exist in this repository; wire dispatcher to call buildWakeDedupeLogPayload"
echo "CONTROL_PLANE_HITS:"
printf '%s\n' "$control_hits"
echo "GUARD_HELPER_HITS:"
printf '%s\n' "$payload_helper_hits"
echo "DEDUPE_REASON_HITS:"
printf '%s\n' "$dedupe_reason_hits"
