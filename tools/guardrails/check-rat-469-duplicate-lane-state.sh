#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-469 duplicate lane state check"
echo "repo: $ROOT_DIR"

RAT469_DOC="docs/analysis/rat-469-investigate-rat-99-status-flapping-after-done-2026-05-11.md"
RAT469_RECEIPT="docs/analysis/rat-469-wave1-duplicate-closure-receipt-2026-05-11.md"
RAT469_SNAPSHOT="docs/analysis/rat-469-state-snapshot-2026-05-11T0829Z.json"
RAT568_DOC="docs/analysis/rat-568-control-plane-done-in-progress-reopen-guard-scoped-input-gate-2026-05-11.md"
RAT591_DOC="docs/analysis/rat-591-stale-sweep-remediation-track-2026-05-11.md"

MISSING=0
for file in "$RAT469_DOC" "$RAT469_RECEIPT" "$RAT469_SNAPSHOT" "$RAT568_DOC" "$RAT591_DOC"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING_FILE=$file"
    MISSING=1
  fi
done

if [[ $MISSING -ne 0 ]]; then
  echo "RESULT=BLOCKED_MISSING_ARTIFACTS"
  exit 2
fi

if ! rg -q "RAT-568" "$RAT469_DOC" || ! rg -q "RAT-594" "$RAT469_DOC" || ! rg -q "RAT-383" "$RAT469_DOC"; then
  echo "RESULT=BLOCKED_CANONICAL_ROUTING_MISSING"
  echo "DETAIL=RAT-469 analysis document missing required canonical routing markers"
  exit 2
fi

if ! rg -q '"statusPolicy": "non_executing_duplicate_lane"' "$RAT469_SNAPSHOT"; then
  echo "RESULT=BLOCKED_SNAPSHOT_POLICY_MISSING"
  echo "DETAIL=RAT-469 state snapshot does not contain non_executing_duplicate_lane policy"
  exit 2
fi

# Reuse strict runtime ownership signal from RAT-413 probe.
RUNTIME_HITS="$(rg -n '(/api/issues|issue_status_changed|heartbeat-runs|checkout.*issue|issues/.*/checkout)' server/src server/tests server/scripts 2>/dev/null || true)"
if [[ -n "$RUNTIME_HITS" ]]; then
  echo "RESULT=UNEXPECTED_RUNTIME_SURFACE_PRESENT"
  echo "$RUNTIME_HITS"
  exit 2
fi

echo "RESULT=RAT469_DUPLICATE_LANE_CONFIRMED"
echo "DETAIL=Canonical routing and artifacts are present; runtime ownership remains upstream control-plane lane"
