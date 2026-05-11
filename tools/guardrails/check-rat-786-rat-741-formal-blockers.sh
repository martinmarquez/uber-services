#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANALYSIS_FILE="$ROOT_DIR/docs/analysis/rat-786-rat-741-formal-blocker-normalization-2026-05-11.md"
HANDOFF_FILE="$ROOT_DIR/docs/analysis/rat-743-control-plane-hand-off-2026-05-11.md"
OUT_FILE="$ROOT_DIR/qa/test-results/rat-786-rat-741-formal-blockers-2026-05-11.txt"

pass=true
mkdir -p "$(dirname "$OUT_FILE")"

{
  echo "RAT-786 formal blocker normalization check"
  echo "date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  if [[ ! -f "$ANALYSIS_FILE" ]]; then
    echo "FAIL: missing analysis artifact: $ANALYSIS_FILE"
    pass=false
  else
    echo "PASS: analysis artifact exists"
  fi

  if [[ ! -f "$HANDOFF_FILE" ]]; then
    echo "FAIL: missing handoff artifact: $HANDOFF_FILE"
    pass=false
  else
    echo "PASS: handoff artifact exists"
  fi

  if [[ -f "$ANALYSIS_FILE" ]]; then
    if rg -q "RAT-594.*RAT-568" "$ANALYSIS_FILE"; then
      echo "PASS: RAT-594 -> RAT-568 contract documented"
    else
      echo "FAIL: RAT-594 -> RAT-568 contract missing"
      pass=false
    fi

    if rg -q "RAT-614.*RAT-591" "$ANALYSIS_FILE"; then
      echo "PASS: RAT-614 -> RAT-591 contract documented"
    else
      echo "FAIL: RAT-614 -> RAT-591 contract missing"
      pass=false
    fi
  fi

  if [[ -f "$HANDOFF_FILE" ]]; then
    if rg -q "RAT-614.*RAT-591" "$HANDOFF_FILE"; then
      echo "PASS: control-plane handoff includes RAT-614 -> RAT-591"
    else
      echo "FAIL: control-plane handoff missing RAT-614 -> RAT-591"
      pass=false
    fi
  fi

  if [[ "$pass" == true ]]; then
    echo "RESULT=PASS"
  else
    echo "RESULT=FAIL"
  fi
} | tee "$OUT_FILE"

if [[ "$pass" != true ]]; then
  exit 1
fi
