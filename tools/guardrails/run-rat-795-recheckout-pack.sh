#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

STAMP="$(date -u +"%Y-%m-%dT%H%M%SZ")"
OUT_FILE="qa/test-results/rat-795-recheckout-pack-${STAMP}.txt"

mkdir -p "$(dirname "$OUT_FILE")"

{
  echo "RAT-795 re-checkout execution pack"
  echo "date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "reason=state-correction-sweep-rat-556"

  echo "--- step: blocked queue normalization readback ---"
  bash tools/guardrails/check-rat-795-devops-blocked-queue-normalization.sh || true

  echo "--- step: wave1 acceptance ---"
  bash tools/guardrails/check-rat-795-wave1-acceptance.sh

  echo "--- step: blocker-edge apply plan (dry-run) ---"
  DRY_RUN=1 bash tools/guardrails/apply-rat-795-devops-blocker-edges.sh

  echo "NEXT_ACTION=If control-plane credentials become available, run DRY_RUN=0 apply-rat-795-devops-blocker-edges.sh and rerun normalization check"
} | tee "$OUT_FILE"

echo "artifact=$OUT_FILE"
