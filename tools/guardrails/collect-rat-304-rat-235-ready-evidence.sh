#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <output_md_file> [same_thread_evidence_file]"
  exit 1
fi

OUT_FILE="$1"
EVIDENCE_FILE="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RAT157_GUARD="$SCRIPT_DIR/check-rat-157-warehouse-sql-runtime-path.sh"
RAT41_GUARD="$SCRIPT_DIR/check-rat-41-rat-235-auto-unblock.sh"
READY_MARKER="RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if [[ ! -x "$RAT157_GUARD" ]]; then
  echo "Missing executable: $RAT157_GUARD"
  exit 1
fi

if [[ ! -x "$RAT41_GUARD" ]]; then
  echo "Missing executable: $RAT41_GUARD"
  exit 1
fi

cleanup_file=""
display_evidence_file=""
if [[ -z "$EVIDENCE_FILE" ]]; then
  EVIDENCE_FILE="$(mktemp)"
  cleanup_file="$EVIDENCE_FILE"
  display_evidence_file="(auto-generated ephemeral file)"
else
  display_evidence_file="$EVIDENCE_FILE"
fi

set +e
rat157_out="$($RAT157_GUARD 2>&1)"
rat157_code=$?
set -e

if [[ $rat157_code -eq 0 ]] && [[ "$rat157_out" == *"$READY_MARKER"* ]]; then
  printf '%s\n' "$READY_MARKER" > "$EVIDENCE_FILE"
fi

set +e
rat41_out="$($RAT41_GUARD "$EVIDENCE_FILE" 2>&1)"
rat41_code=$?
set -e

mkdir -p "$(dirname "$OUT_FILE")"

cat > "$OUT_FILE" <<REPORT
# RAT-304 READY Evidence Bundle

Generated at (UTC): $TS

## Inputs

- RAT-157 guard: \`$RAT157_GUARD\`
- RAT-41/RAT-235 gate: \`$RAT41_GUARD\`
- Same-thread evidence file used: \`$display_evidence_file\`

## RAT-157 Runtime Guard

- Exit code: \`$rat157_code\`

\`\`\`text
$rat157_out
\`\`\`

## RAT-41 RAT-235 Auto-Unblock Gate

- Exit code: \`$rat41_code\`

\`\`\`text
$rat41_out
\`\`\`

## Decision

REPORT

if [[ $rat157_code -eq 0 ]] && [[ "$rat157_out" == *"$READY_MARKER"* ]] && [[ $rat41_code -eq 0 ]] && [[ "$rat41_out" == *"RAT_41_RAT_235_AUTO_UNBLOCK_READY"* ]]; then
  cat >> "$OUT_FILE" <<'REPORT'
READY. Attach this file in RAT-235/RAT-41 thread and proceed with unblock.
REPORT
else
  cat >> "$OUT_FILE" <<'REPORT'
NOT READY. Keep RAT-235 blocked with reason `rat39_source_surface`.
REPORT
fi

if [[ -n "$cleanup_file" ]]; then
  rm -f "$cleanup_file"
fi

echo "Wrote RAT-304 evidence: $OUT_FILE"
