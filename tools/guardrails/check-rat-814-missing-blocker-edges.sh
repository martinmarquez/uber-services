#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

CTO_AGENT_ID="73aae037-dfd9-4fbe-9f29-661086bc2b71"
PRODUCT_BRIEF_PATH="PRODUCT_BRIEF.md"
OUT_FILE="qa/test-results/rat-814-missing-blocker-edges-$(date -u +"%Y-%m-%dT%H%M%SZ").txt"

resolve_snapshot() {
  if [[ -n "${RAT_ISSUE_SOURCE_FILE:-}" ]]; then
    printf '%s\n' "$RAT_ISSUE_SOURCE_FILE"
    return 0
  fi

  find qa/test-results -maxdepth 1 -type f \
    \( -name 'rat-*-issues-export-*.json' -o -name 'rat-709-cto-cluster-snapshot-*.json' \) \
    -print0 | xargs -0 ls -1t | head -n1 || true
}

if ! command -v jq >/dev/null 2>&1; then
  echo "RESULT=BLOCKED_MISSING_JQ"
  echo "DETAIL=jq is required for snapshot parsing"
  exit 2
fi

if [[ ! -f "$PRODUCT_BRIEF_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_PRODUCT_BRIEF"
  echo "DETAIL=Product brief is required before queue-hygiene actions"
  exit 3
fi

SNAPSHOT_PATH="$(resolve_snapshot)"
if [[ -z "$SNAPSHOT_PATH" || ! -f "$SNAPSHOT_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_CLUSTER_SNAPSHOT"
  echo "DETAIL=No issue export snapshot found under qa/test-results"
  exit 4
fi

mkdir -p "$(dirname "$OUT_FILE")"
{
  echo "RAT-814 blocked queue hygiene check"
  echo "date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "snapshot=$SNAPSHOT_PATH"

  total_blocked=$(jq -r '[.[] | select(.status=="blocked")] | length' "$SNAPSHOT_PATH")
  total_missing=$(jq -r '[.[] | select(.status=="blocked" and ((.blockedByIssueIds // []) | length == 0))] | length' "$SNAPSHOT_PATH")
  cto_missing=$(jq -r --arg aid "$CTO_AGENT_ID" '[.[] | select(.status=="blocked" and .assigneeAgentId==$aid and ((.blockedByIssueIds // []) | length == 0))] | length' "$SNAPSHOT_PATH")

  echo "blocked_total=$total_blocked"
  echo "blocked_missing_blocker_edges=$total_missing"
  echo "cto_blocked_missing_blocker_edges=$cto_missing"
  echo "-- cto missing-edge issues --"
  jq -r --arg aid "$CTO_AGENT_ID" '.[] | select(.status=="blocked" and .assigneeAgentId==$aid and ((.blockedByIssueIds // []) | length == 0)) | .identifier + "\t" + .title + "\t" + .updatedAt' "$SNAPSHOT_PATH"

  if [[ "$total_missing" -gt 0 ]]; then
    echo "RESULT=BLOCKED_MISSING_BLOCKER_EDGES"
    echo "DETAIL=Blocked issues exist without explicit blockedByIssueIds; apply control-plane edge normalization"
    exit 5
  fi

  echo "RESULT=PASS_ALL_BLOCKED_HAVE_EDGES"
  echo "DETAIL=Every blocked issue in snapshot has explicit blockedByIssueIds"
} | tee "$OUT_FILE"

echo "artifact=$OUT_FILE"
