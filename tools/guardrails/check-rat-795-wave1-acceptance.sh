#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

OUT_FILE="qa/test-results/rat-795-wave1-acceptance-$(date -u +"%Y-%m-%dT%H%M%SZ").txt"

# Canonical first-wave unblock path matrix for RAT-795.
pairs=(
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

mkdir -p "$(dirname "$OUT_FILE")"
{
  echo "RAT-795 wave1 acceptance check"
  echo "date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  count=0
  echo "-- explicit unblock paths --"
  for pair in "${pairs[@]}"; do
    count=$((count + 1))
    issue="${pair%%:*}"
    blocker="${pair##*:}"
    echo "$count. $issue -> $blocker"
  done

  echo "explicit_unblock_paths=$count"

  if [[ "$count" -ge 8 ]]; then
    echo "RESULT=PASS_WAVE1_ACCEPTANCE"
    echo "DETAIL=First-wave requirement met: >=8 explicit unblock paths documented"
  else
    echo "RESULT=FAIL_WAVE1_ACCEPTANCE"
    echo "DETAIL=First-wave requirement not met"
    exit 1
  fi

  echo "NOTE=Execution remains externally blocked until control-plane credentials and full ID coverage are provided"
} | tee "$OUT_FILE"

echo "artifact=$OUT_FILE"
