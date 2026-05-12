#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-713 blocked needs_attention cluster sweep"
echo "repo: $ROOT_DIR"

PRODUCT_BRIEF_PATH="PRODUCT_BRIEF.md"
DEPLOY_CONFIG_PATH="DEPLOY_CONFIG.md"
CLUSTER_FILE="qa/test-results/rat-608-qa-evidence-chain-unblock-status-2026-05-11.md"

has_product_brief="no"
has_deploy_config="no"

[[ -f "$PRODUCT_BRIEF_PATH" ]] && has_product_brief="yes"
[[ -f "$DEPLOY_CONFIG_PATH" ]] && has_deploy_config="yes"

printf 'gate_product_brief=%s\n' "$has_product_brief"
printf 'gate_deploy_config=%s\n' "$has_deploy_config"
printf 'cluster_file=%s\n' "$CLUSTER_FILE"

if [[ "$has_product_brief" != "yes" ]]; then
  echo "RESULT=BLOCKED_MISSING_PRODUCT_BRIEF"
  echo "DETAIL=Product brief is required before infrastructure resource allocation"
  exit 2
fi

if [[ "$has_deploy_config" != "yes" ]]; then
  echo "RESULT=BLOCKED_MISSING_DEPLOY_CONFIG"
  echo "DETAIL=DEPLOY_CONFIG.md not found in current workspace"
  exit 3
fi

if [[ ! -f "$CLUSTER_FILE" ]]; then
  echo "RESULT=BLOCKED_MISSING_CLUSTER_EVIDENCE"
  echo "DETAIL=Expected QA cluster evidence file was not found"
  exit 4
fi

blocked_rows="$(awk -F'|' '
  /^\| RAT-[0-9]+ / {
    status=$3
    gsub(/^ +| +$/, "", status)
    if (status == "blocked") {
      blocked++
      blockedBy=$4
      owner=$5
      action=$6
      gsub(/^ +| +$/, "", blockedBy)
      gsub(/^ +| +$/, "", owner)
      gsub(/^ +| +$/, "", action)
      if (blockedBy == "" || owner == "" || action == "") {
        incomplete++
      }
    }
  }
  END {
    if (blocked == "") blocked=0
    if (incomplete == "") incomplete=0
    printf "blocked_rows=%d\nincomplete_blocked_rows=%d\n", blocked, incomplete
  }
' "$CLUSTER_FILE")"

printf '%s\n' "$blocked_rows"

blocked_count="$(printf '%s\n' "$blocked_rows" | awk -F= '/^blocked_rows=/{print $2}')"
incomplete_count="$(printf '%s\n' "$blocked_rows" | awk -F= '/^incomplete_blocked_rows=/{print $2}')"

if [[ "${blocked_count:-0}" -lt 1 ]]; then
  echo "RESULT=BLOCKED_NO_BLOCKED_CLUSTER_ROWS"
  echo "DETAIL=No blocked rows were found in the cluster evidence table"
  exit 5
fi

if [[ "${incomplete_count:-0}" -gt 0 ]]; then
  echo "RESULT=BLOCKED_INCOMPLETE_BLOCKER_METADATA"
  echo "DETAIL=One or more blocked rows are missing blocker owner/action metadata"
  exit 6
fi

echo "RESULT=READY_CLUSTER_NORMALIZED"
echo "DETAIL=Blocked cluster rows contain explicit blockedBy and unblock owner/action"
