#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <env_name> <base_url> <actor_signing_secret> <output_md_file>"
  exit 1
fi

ENV_NAME="$1"
BASE_URL="$2"
SECRET="$3"
OUT_FILE="$4"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
TMP_OUT="$(mktemp)"

"$(dirname "$0")/actor-signing-smoke.sh" "$BASE_URL" "$SECRET" > "$TMP_OUT" 2>&1

CASE1_STATUS="$(awk '/Case 1/{flag=1;next} flag && /^HTTP\//{print $2; exit}' "$TMP_OUT")"
CASE2_STATUS="$(awk '/Case 2/{flag=1;next} flag && /^HTTP\//{print $2; exit}' "$TMP_OUT")"
CASE3_STATUS="$(awk '/Case 3/{flag=1;next} flag && /^HTTP\//{print $2; exit}' "$TMP_OUT")"

CASE2_CODE="$(rg -o 'actor_signature_required' "$TMP_OUT" -m 1 || true)"
CASE3_CODE="$(rg -o 'invalid_actor_signature' "$TMP_OUT" -m 1 || true)"

cat > "$OUT_FILE" <<REPORT
# RAT-218 ${ENV_NAME} Actor Signing Evidence

Generated at (UTC): ${TS_UTC}
Base URL: ${BASE_URL}

## Smoke Summary

- Case 1 (signed): HTTP ${CASE1_STATUS}
- Case 2 (unsigned): HTTP ${CASE2_STATUS} (${CASE2_CODE:-not found})
- Case 3 (tampered): HTTP ${CASE3_STATUS} (${CASE3_CODE:-not found})

## Raw Output

\`\`\`text
$(cat "$TMP_OUT")
\`\`\`
REPORT

rm -f "$TMP_OUT"
echo "Wrote evidence: $OUT_FILE"
