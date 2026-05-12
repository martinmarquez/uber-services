#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LEDGER_PATH="analysis/rat-351-reprocessed-by-day.tsv"
TARGET_ISSUE="${1:-RAT-285}"

echo "RAT-448 productivity-review reopen ledger check"
echo "repo: $ROOT_DIR"
echo "ledger: $LEDGER_PATH"
echo "target_issue: $TARGET_ISSUE"

if [[ ! -f "$LEDGER_PATH" ]]; then
  echo "RESULT=BLOCKED_MISSING_LEDGER"
  echo "DETAIL=Expected ledger not found at $LEDGER_PATH"
  exit 2
fi

if ! command -v awk >/dev/null 2>&1; then
  echo "RESULT=BLOCKED_MISSING_AWK"
  echo "DETAIL=awk not available in runtime"
  exit 2
fi

SUMMARY="$(awk -F '\t' -v target="$TARGET_ISSUE" '
  $3 ~ /^RAT-/ && $4=="done" && $5=="to_todo" {done_to_todo++}
  $3 ~ /^RAT-/ && $4=="blocked" && $5=="to_todo" {blocked_to_todo++}
  $3 == target && $4=="done" && $5=="to_todo" {target_hit=1; target_line=$0}
  END {
    print "done_to_todo_count=" (done_to_todo + 0)
    print "blocked_to_todo_count=" (blocked_to_todo + 0)
    print "target_done_to_todo=" (target_hit ? "yes" : "no")
    if (target_hit) print "target_line=" target_line
  }
' "$LEDGER_PATH")"

printf '%s\n' "$SUMMARY"

if printf '%s\n' "$SUMMARY" | rg -q '^target_done_to_todo=yes$'; then
  echo "RESULT=REOPEN_PATTERN_CONFIRMED"
  exit 0
fi

echo "RESULT=TARGET_NOT_FOUND"
exit 1
