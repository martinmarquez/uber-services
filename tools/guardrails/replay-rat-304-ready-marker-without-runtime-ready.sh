#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GATE="$SCRIPT_DIR/check-rat-41-rat-235-auto-unblock.sh"
MARKER="RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY"

tmp_evidence="$(mktemp)"
trap 'rm -f "$tmp_evidence"' EXIT

printf '%s\n' "$MARKER" > "$tmp_evidence"

set +e
out="$($GATE "$tmp_evidence" 2>&1)"
code=$?
set -e

printf 'exit=%s\n%s\n' "$code" "$out"

if [[ $code -eq 2 ]] && [[ "$out" == *"RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"* ]]; then
  echo "RAT_304_REPLAY_OK"
  exit 0
fi

echo "RAT_304_REPLAY_UNEXPECTED"
exit 1
