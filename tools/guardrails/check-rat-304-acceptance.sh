#!/usr/bin/env bash
set -euo pipefail

# RAT-304 acceptance gate for RAT-41/RAT-235 unblock hardening.
# Validates:
# 1) Missing same-thread evidence -> blocked (exit 2)
# 2) READY marker only but runtime guard non-ready -> blocked (exit 2)
# 3) READY marker + runtime guard ready (stubbed) -> ready (exit 0)
#
# Exit contract:
# - 0: RAT_304_ACCEPTANCE_PASS
# - 2: RAT_304_ACCEPTANCE_FAIL:<reason>

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GATE="$SCRIPT_DIR/check-rat-41-rat-235-auto-unblock.sh"
MARKER="RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY"

if [[ ! -x "$GATE" ]]; then
  echo "RAT_304_ACCEPTANCE_FAIL:gate_missing"
  exit 2
fi

# Case 1: missing evidence file
set +e
out1="$($GATE /tmp/rat304-no-such-file 2>&1)"
code1=$?
set -e
if [[ $code1 -ne 2 ]] || [[ "$out1" != *"RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"* ]]; then
  echo "RAT_304_ACCEPTANCE_FAIL:case1_missing_evidence"
  exit 2
fi

# Case 2: marker present but runtime guard not ready
case2_file="$(mktemp)"
trap 'rm -f "$case2_file"' EXIT
printf '%s\n' "$MARKER" > "$case2_file"

set +e
out2="$($GATE "$case2_file" 2>&1)"
code2=$?
set -e
if [[ $code2 -ne 2 ]] || [[ "$out2" != *"RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface"* ]]; then
  echo "RAT_304_ACCEPTANCE_FAIL:case2_marker_without_runtime_ready"
  exit 2
fi

# Case 3: marker present and runtime guard ready (stubbed in isolated tmp dir)
stub_dir="$(mktemp -d)"
trap 'rm -f "$case2_file"; rm -rf "$stub_dir"' EXIT
cp "$GATE" "$stub_dir/check-rat-41-rat-235-auto-unblock.sh"
cat > "$stub_dir/check-rat-157-warehouse-sql-runtime-path.sh" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY"
exit 0
STUB
chmod +x "$stub_dir/check-rat-41-rat-235-auto-unblock.sh" "$stub_dir/check-rat-157-warehouse-sql-runtime-path.sh"

case3_file="$(mktemp)"
printf '%s\n' "$MARKER" > "$case3_file"

set +e
out3="$($stub_dir/check-rat-41-rat-235-auto-unblock.sh "$case3_file" 2>&1)"
code3=$?
set -e
rm -f "$case3_file"

if [[ $code3 -ne 0 ]] || [[ "$out3" != *"RAT_41_RAT_235_AUTO_UNBLOCK_READY"* ]]; then
  echo "RAT_304_ACCEPTANCE_FAIL:case3_stubbed_ready_path"
  exit 2
fi

echo "RAT_304_ACCEPTANCE_PASS"
exit 0
