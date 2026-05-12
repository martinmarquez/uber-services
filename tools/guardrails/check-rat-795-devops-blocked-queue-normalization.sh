#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

DEVOPS_AGENT_ID="8dd474b9-148d-4918-9f17-34a47b499e08"
PRODUCT_BRIEF_PATH="PRODUCT_BRIEF.md"
DEPLOY_CONFIG_PATH="DEPLOY_CONFIG.md"

resolve_snapshot() {
  if [[ -n "${RAT_ISSUE_SOURCE_FILE:-}" ]]; then
    printf '%s\n' "$RAT_ISSUE_SOURCE_FILE"
    return 0
  fi

  ls -1t qa/test-results/rat-*-issues-export-*.json qa/test-results/rat-709-cto-cluster-snapshot-*.json 2>/dev/null | head -n1 || true
}

if ! command -v jq >/dev/null 2>&1; then
  echo "RESULT=BLOCKED_MISSING_JQ"
  echo "DETAIL=jq is required for snapshot parsing"
  exit 2
fi

if [[ ! -f "$PRODUCT_BRIEF_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_PRODUCT_BRIEF"
  echo "DETAIL=Product brief is required before infrastructure resource allocation"
  exit 3
fi

if [[ ! -f "$DEPLOY_CONFIG_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_DEPLOY_CONFIG"
  echo "DETAIL=DEPLOY_CONFIG.md is required for deployment strategy and infra state"
  exit 4
fi

SNAPSHOT_PATH="$(resolve_snapshot)"
if [[ -z "$SNAPSHOT_PATH" || ! -f "$SNAPSHOT_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_CLUSTER_SNAPSHOT"
  echo "DETAIL=No issue export snapshot found under qa/test-results"
  exit 5
fi

echo "RAT-795 DevOps blocked queue unblock normalization check"
echo "snapshot: $SNAPSHOT_PATH"
echo "agent: $DEVOPS_AGENT_ID"

echo "-- blocked needs_attention entries --"
jq -r --arg aid "$DEVOPS_AGENT_ID" '.[] | select(.status=="blocked" and .blockerAttention.state=="needs_attention" and .assigneeAgentId==$aid) | .identifier + "\t" + .title + "\t" + ((.blockedByIssueIds // []) | tostring) + "\t" + .updatedAt' "$SNAPSHOT_PATH"

count=$(jq -r --arg aid "$DEVOPS_AGENT_ID" '[.[] | select(.status=="blocked" and .blockerAttention.state=="needs_attention" and .assigneeAgentId==$aid)] | length' "$SNAPSHOT_PATH")
missing_blockers=$(jq -r --arg aid "$DEVOPS_AGENT_ID" '[.[] | select(.status=="blocked" and .blockerAttention.state=="needs_attention" and .assigneeAgentId==$aid and ((.blockedByIssueIds // []) | length == 0))] | length' "$SNAPSHOT_PATH")

echo "blocked_needs_attention_count=$count"
echo "missing_blockers_count=$missing_blockers"

# Expected blocker edges from RAT-713 proposal, used as deterministic target contract for this shard.
expected_pairs=(
  "RAT-691:RAT-554"
  "RAT-388:RAT-721"
  "RAT-392:RAT-747"
  "RAT-659:RAT-579"
  "RAT-632:RAT-292"
  "RAT-568:RAT-428"
  "RAT-646:RAT-639"
  "RAT-573:RAT-582"
  "RAT-428:RAT-568"
  "RAT-346:RAT-347"
)

missing_expected=0
for pair in "${expected_pairs[@]}"; do
  issue="${pair%%:*}"
  blocker="${pair##*:}"
  has_edge=$(jq -r --arg issue "$issue" --arg blocker "$blocker" '
    [.[] | select(.identifier==$issue) | ((.blockedByIssueIds // []) | index($blocker))] | any(. != null)
  ' "$SNAPSHOT_PATH")

  if [[ "$has_edge" == "true" ]]; then
    echo "PASS: $issue includes blocker $blocker"
  else
    echo "MISS: $issue missing blocker $blocker"
    missing_expected=$((missing_expected + 1))
  fi
done

echo "missing_expected_blocker_edges=$missing_expected"

if [[ "$count" -eq 0 ]]; then
  echo "RESULT=READY_DEVOPS_SLICE_EMPTY"
  echo "DETAIL=No blocked+needs_attention DevOps-owned issues in this snapshot"
  exit 0
fi

if [[ "$missing_expected" -gt 0 ]]; then
  echo "RESULT=BLOCKED_EXPECTED_EDGES_NOT_PERSISTED"
  echo "DETAIL=Control-plane blocker-edge persistence/readback still missing for one or more DevOps slice issues"
  exit 6
fi

echo "RESULT=READY_EXPECTED_BLOCKER_EDGES_PRESENT"
echo "DETAIL=DevOps blocked queue slice has expected blocker-edge normalization"
