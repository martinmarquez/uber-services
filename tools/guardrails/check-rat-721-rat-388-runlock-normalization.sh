#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-721 RAT-388 run-lock and ownership normalization check"
echo "repo: $ROOT_DIR"

PRODUCT_BRIEF_PATH="PRODUCT_BRIEF.md"
DEPLOY_CONFIG_PATH="DEPLOY_CONFIG.md"
DEVOPS_AGENT_ID="8dd474b9-148d-4918-9f17-34a47b499e08"

if [[ ! -f "$PRODUCT_BRIEF_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_PRODUCT_BRIEF"
  echo "DETAIL=Product brief is required before infrastructure resource allocation"
  exit 2
fi

if [[ ! -f "$DEPLOY_CONFIG_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_DEPLOY_CONFIG"
  echo "DETAIL=DEPLOY_CONFIG.md is required for deployment strategy and infra state"
  exit 3
fi

resolve_issue_source_file() {
  if [[ -n "${RAT_ISSUE_SOURCE_FILE:-}" ]]; then
    printf '%s\n' "$RAT_ISSUE_SOURCE_FILE"
    return 0
  fi

  local candidates=()

  # Canonical input should be a live issue export from the platform runtime.
  while IFS= read -r file; do
    candidates+=("$file")
  done < <(ls -1t qa/test-results/rat-*-issues-export-*.json 2>/dev/null || true)

  # Backward-compatible fallback to legacy cluster snapshots when no export exists.
  while IFS= read -r file; do
    candidates+=("$file")
  done < <(ls -1t qa/test-results/rat-709-cto-cluster-snapshot-*.json 2>/dev/null || true)

  if [[ "${#candidates[@]}" -lt 1 ]]; then
    return 1
  fi

  printf '%s\n' "${candidates[0]}"
}

source_file="$(resolve_issue_source_file || true)"
if [[ -z "$source_file" ]]; then
  echo "RESULT=BLOCKED_MISSING_SOURCE_FILE"
  echo "DETAIL=No canonical issue export or legacy cluster snapshot was found under qa/test-results"
  exit 4
fi

echo "issue_source_file=$source_file"

rat388_json="$(jq -c '.[] | select(.identifier=="RAT-388")' "$source_file" | head -n1 || true)"
if [[ -z "$rat388_json" ]]; then
  echo "RESULT=BLOCKED_RAT388_NOT_FOUND"
  echo "DETAIL=RAT-388 was not present in the selected issue source file"
  exit 5
fi

status="$(printf '%s' "$rat388_json" | jq -r '.status // ""')"
assignee="$(printf '%s' "$rat388_json" | jq -r '.assigneeAgentId // ""')"
checkout_run="$(printf '%s' "$rat388_json" | jq -r '.checkoutRunId // ""')"
execution_run="$(printf '%s' "$rat388_json" | jq -r '.executionRunId // ""')"
execution_locked_at="$(printf '%s' "$rat388_json" | jq -r '.executionLockedAt // ""')"
active_run_status="$(printf '%s' "$rat388_json" | jq -r '.activeRun.status // ""')"
updated_at="$(printf '%s' "$rat388_json" | jq -r '.updatedAt // ""')"

printf 'rat388_status=%s\n' "$status"
printf 'rat388_assignee=%s\n' "$assignee"
printf 'rat388_checkoutRunId=%s\n' "$checkout_run"
printf 'rat388_executionRunId=%s\n' "$execution_run"
printf 'rat388_executionLockedAt=%s\n' "$execution_locked_at"
printf 'rat388_activeRunStatus=%s\n' "$active_run_status"
printf 'rat388_updatedAt=%s\n' "$updated_at"

if [[ "$assignee" != "$DEVOPS_AGENT_ID" ]]; then
  echo "RESULT=BLOCKED_ASSIGNEE_MISMATCH"
  echo "DETAIL=RAT-388 is not assigned to DevOps"
  exit 6
fi

if [[ "$status" != "blocked" ]]; then
  echo "RESULT=BLOCKED_STATUS_NOT_BLOCKED"
  echo "DETAIL=RAT-388 status drifted from blocked"
  exit 7
fi

if [[ -n "$checkout_run" || -n "$execution_run" || -n "$execution_locked_at" || -n "$active_run_status" ]]; then
  echo "RESULT=BLOCKED_RUN_LOCK_PRESENT"
  echo "DETAIL=RAT-388 still has active run-lock fields"
  exit 8
fi

echo "RESULT=READY_RAT388_RUNLOCK_CLEARED"
echo "DETAIL=RAT-388 is blocked under DevOps with no run-lock fields"
