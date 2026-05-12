#!/usr/bin/env bash
set -euo pipefail

# Deterministic replay for RAT-300:
# proves deps-only flow cannot auto-unblock RAT-290/RAT-191 without READY evidence + READY runtime guard.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
gate="$script_dir/check-rat-41-rat-290-rat-191-auto-unblock.sh"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

missing_evidence="$tmp_dir/evidence-missing.txt"
ready_evidence="$tmp_dir/evidence-ready.txt"

printf 'Auto-unblocked in RAT-41 sweep: deps=0\n' > "$missing_evidence"
printf 'RAT_290_RUNTIME_WAREHOUSE_CREDS_READY\nRAT_191_RUNTIME_WAREHOUSE_CREDS_READY\nRAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:database_url\n' > "$ready_evidence"

set +e
"$gate" "$missing_evidence" >/tmp/rat300_case1.out 2>&1
case1_exit=$?
"$gate" "$ready_evidence" >/tmp/rat300_case2.out 2>&1
case2_exit=$?
set -e

case1_out="$(cat /tmp/rat300_case1.out)"
case2_out="$(cat /tmp/rat300_case2.out)"

printf 'CASE1_DEPS_ONLY_EXIT:%s\nCASE1_DEPS_ONLY_OUT:%s\n' "$case1_exit" "$case1_out"
printf 'CASE2_READY_EVIDENCE_EXIT:%s\nCASE2_READY_EVIDENCE_OUT:%s\n' "$case2_exit" "$case2_out"
