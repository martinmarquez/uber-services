#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-300:
# RAT-41 must not auto-unblock RAT-290/RAT-191 on deps=0 alone.
# Required gate:
# 1) same-thread evidence includes READY markers for RAT-290 and RAT-191 runtime guards
# 2) fresh runtime guard execution returns READY for both guards
#
# Usage:
#   check-rat-41-rat-290-rat-191-auto-unblock.sh <same_thread_evidence_file>
#
# Decision contract:
# - exit 0 + RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_READY
# - exit 2 + RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready

if [[ $# -lt 1 ]]; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
  exit 2
fi

evidence_file="$1"
if [[ ! -f "$evidence_file" ]]; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
  exit 2
fi

rat290_marker="RAT_290_RUNTIME_WAREHOUSE_CREDS_READY"
rat191_marker="RAT_191_RUNTIME_WAREHOUSE_CREDS_READY"
rat191_evidence_marker_prefix="RAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:"

if ! rg -q "$rat290_marker" "$evidence_file"; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
  exit 2
fi

if ! rg -q "$rat191_marker" "$evidence_file"; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
  exit 2
fi

if ! rg -q "$rat191_evidence_marker_prefix" "$evidence_file"; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rat290_guard="$script_dir/check-rat-290-runtime-warehouse-credentials.sh"
rat191_guard="$script_dir/check-rat-191-runtime-warehouse-credentials.sh"

if [[ ! -x "$rat290_guard" ]] || [[ ! -x "$rat191_guard" ]]; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
  exit 2
fi

set +e
rat290_output="$($rat290_guard 2>&1)"
rat290_exit=$?
rat191_output="$($rat191_guard 2>&1)"
rat191_exit=$?
set -e

if [[ $rat290_exit -eq 0 ]] && [[ "$rat290_output" == *"$rat290_marker"* ]] && [[ $rat191_exit -eq 0 ]] && [[ "$rat191_output" == *"$rat191_marker"* ]] && [[ "$rat191_output" == *"$rat191_evidence_marker_prefix"* ]]; then
  echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_READY"
  exit 0
fi

echo "RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready"
exit 2
