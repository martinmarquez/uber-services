#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

SNAPSHOT_PATH="qa/test-results/rat-709-cto-cluster-snapshot-2026-05-11T09:36:13Z.json"
DEVOPS_AGENT_ID="8dd474b9-148d-4918-9f17-34a47b499e08"

if ! command -v jq >/dev/null 2>&1; then
  echo "RESULT=BLOCKED_MISSING_JQ"
  echo "DETAIL=jq is required for snapshot parsing"
  exit 2
fi

if [[ ! -f "$SNAPSHOT_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_CLUSTER_SNAPSHOT"
  echo "DETAIL=Expected snapshot file missing: $SNAPSHOT_PATH"
  exit 3
fi

echo "RAT-713 DevOps blocked needs_attention cluster audit"
echo "snapshot: $SNAPSHOT_PATH"
echo "agent: $DEVOPS_AGENT_ID"

echo "-- blocked needs_attention entries --"
jq -r --arg aid "$DEVOPS_AGENT_ID" '.[] | select(.status=="blocked" and .blockerAttention.state=="needs_attention" and .assigneeAgentId==$aid) | .identifier + "\t" + .title + "\t" + ((.blockedByIssueIds // []) | tostring) + "\t" + .status + "\t" + .updatedAt' "$SNAPSHOT_PATH"

count=$(jq -r --arg aid "$DEVOPS_AGENT_ID" '[.[] | select(.status=="blocked" and .blockerAttention.state=="needs_attention" and .assigneeAgentId==$aid)] | length' "$SNAPSHOT_PATH")
missing_blockers=$(jq -r --arg aid "$DEVOPS_AGENT_ID" '[.[] | select(.status=="blocked" and .blockerAttention.state=="needs_attention" and .assigneeAgentId==$aid and ((.blockedByIssueIds // []) | length == 0))] | length' "$SNAPSHOT_PATH")

echo "blocked_needs_attention_count=$count"
echo "missing_blockers_count=$missing_blockers"

echo "RESULT=READY_FOR_MANUAL_BLOCKER_LINKING"
if [[ "$count" -eq 0 ]]; then
  echo "DETAIL=No blocked needs_attention DevOps-owned issues in snapshot"
  exit 0
fi

if [[ "$missing_blockers" -gt 0 ]]; then
  echo "DETAIL=DevOps blocked needs_attention items are missing explicit blockedByIssueIds"
  exit 5
fi

echo "DETAIL=DevOps blocked needs_attention cluster already has explicit blockers"
