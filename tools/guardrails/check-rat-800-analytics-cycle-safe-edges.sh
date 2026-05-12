#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_FILE="$ROOT_DIR/qa/test-results/rat-800-analytics-cycle-safe-edges-$(date -u +%Y-%m-%dT%H%M%SZ).txt"

mkdir -p "$(dirname "$OUT_FILE")"

node --input-type=module <<'NODE' > "$OUT_FILE"
import { normalizeBlockerEdgesForAnalyticsChain } from "./tools/guardrails/issueLifecycleGuard.js";

const scopeIssues = [
  { issueId: "RAT-444", blockedByIssueIds: [] },
  { issueId: "RAT-631", blockedByIssueIds: ["RAT-444"] },
  { issueId: "RAT-84", blockedByIssueIds: ["RAT-444"] },
  { issueId: "RAT-122", blockedByIssueIds: ["RAT-84"] },
  { issueId: "RAT-130", blockedByIssueIds: ["RAT-122"] },
  { issueId: "RAT-123", blockedByIssueIds: ["RAT-130"] },
  { issueId: "RAT-142", blockedByIssueIds: ["RAT-130"] },
  { issueId: "RAT-143", blockedByIssueIds: ["RAT-123"] },
  { issueId: "RAT-150", blockedByIssueIds: ["RAT-142"] },
  { issueId: "RAT-316", blockedByIssueIds: ["RAT-142", "RAT-150"] },
  { issueId: "RAT-618", blockedByIssueIds: ["RAT-142", "RAT-143", "RAT-150", "RAT-316", "RAT-631"] },
];

const normalized = normalizeBlockerEdgesForAnalyticsChain(scopeIssues);

console.log("RAT-800 analytics cycle-safe edge normalization check");
console.log(`scope_issue_count=${scopeIssues.length}`);
console.log(`normalized_edge_count=${normalized.edges.length}`);
console.log(`has_cycle=${normalized.hasCycle}`);
console.log(`cycle_issue_ids=${normalized.cycleIssueIds.join(",")}`);
console.log("-- normalized edges --");
for (const edge of normalized.edges) {
  console.log(`${edge.issueId}\t${edge.blockedByIssueId}`);
}

if (normalized.hasCycle) {
  console.log("RESULT=BLOCKED_CYCLE_DETECTED");
  console.log("DETAIL=Proposed RAT-800 normalized edge set still contains cycles");
  process.exit(2);
}

console.log("RESULT=READY_CYCLE_SAFE_EDGES");
console.log("DETAIL=RAT-800 scope edge set is cycle-safe and ready for blockedByIssueIds writeback");
NODE

cat "$OUT_FILE"
