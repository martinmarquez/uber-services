#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-303: do not auto-unblock while RAT-191 warehouse credential guard is failing.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rat191_guard="$script_dir/check-rat-191-runtime-warehouse-credentials.sh"

if [[ ! -x "$rat191_guard" ]]; then
  echo "RAT_303_RUNTIME_WAREHOUSE_CREDS_MISSING"
  exit 2
fi

set +e
rat191_output="$($rat191_guard 2>&1)"
rat191_exit=$?
set -e

if [[ $rat191_exit -eq 0 ]] && [[ "$rat191_output" == *"RAT_191_RUNTIME_WAREHOUSE_CREDS_READY"* ]]; then
  echo "RAT_303_RUNTIME_WAREHOUSE_CREDS_READY"
  exit 0
fi

echo "RAT_303_RUNTIME_WAREHOUSE_CREDS_MISSING"
exit 2
