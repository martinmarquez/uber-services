#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-803 replay evidence gate"
echo "repo: $ROOT_DIR"

required_local=(
  "docs/analysis/rat-803-rat-403-unblock-control-plane-lifecycle-replay-spec-2026-05-11.md"
  "docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md"
  "qa/test-results/rat-803-rat-403-lifecycle-replay-evidence-2026-05-11.md"
)

missing_local=0
for file in "${required_local[@]}"; do
  if [[ -f "$file" ]]; then
    echo "local_present=$file"
  else
    echo "local_missing=$file"
    missing_local=1
  fi
done

# Control-plane runtime evidence is expected outside this repository.
control_plane_hits="$(rg -n '/api/issues|issue_status_changed|heartbeat-runs|issues/.*/checkout|/api/issues/.*/checkout' server/src server/tests server/scripts 2>/dev/null || true)"

if [[ -n "$control_plane_hits" ]]; then
  echo "control_plane_surface=present_in_repo"
  echo "control_plane_hits_begin"
  printf '%s\n' "$control_plane_hits"
  echo "control_plane_hits_end"
else
  echo "control_plane_surface=not_found_in_repo"
fi

if [[ "$missing_local" -ne 0 ]]; then
  echo "RESULT=BLOCKED_MISSING_LOCAL_EVIDENCE"
  echo "UNBLOCK_OWNER=backend"
  echo "UNBLOCK_ACTION=add missing local replay/spec/evidence files"
  exit 2
fi

if [[ -z "$control_plane_hits" ]]; then
  echo "RESULT=BLOCKED_EXTERNAL_CONTROL_PLANE_EVIDENCE"
  echo "UNBLOCK_OWNER=cto_control_plane_lifecycle_maintainer"
  echo "UNBLOCK_ACTION=attach Case A-E replay logs (terminal checkout guard, no-delta dedupe, blocked-state suppression, explicit resume control)"
  exit 3
fi

echo "RESULT=READY_FOR_QA_REPLAY_VERIFICATION"
