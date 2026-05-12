#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-304:
# RAT-41 must not auto-unblock RAT-235 on deps=0 alone.
# Required gate:
# 1) same-thread evidence contains RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY
# 2) fresh runtime guard execution returns exit 0 + same READY marker
#
# Usage:
#   check-rat-41-rat-235-auto-unblock.sh <same_thread_evidence_file>
#
# Decision contract:
# - exit 0 + RAT_41_RAT_235_AUTO_UNBLOCK_READY
# - exit 2 + RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface

if [[ $# -lt 1 ]]; then
  echo "RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"
  exit 2
fi

evidence_file="$1"
if [[ ! -f "$evidence_file" ]]; then
  echo "RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"
  exit 2
fi

ready_marker="RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY"
if ! rg -q "$ready_marker" "$evidence_file"; then
  echo "RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rat157_guard="$script_dir/check-rat-157-warehouse-sql-runtime-path.sh"

if [[ ! -x "$rat157_guard" ]]; then
  echo "RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"
  exit 2
fi

set +e
rat157_output="$($rat157_guard 2>&1)"
rat157_exit=$?
set -e

if [[ $rat157_exit -eq 0 ]] && [[ "$rat157_output" == *"$ready_marker"* ]]; then
  echo "RAT_41_RAT_235_AUTO_UNBLOCK_READY"
  exit 0
fi

echo "RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"
exit 2
