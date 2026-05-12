#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-1007 long-active productivity-review churn guard check"
echo "repo: $ROOT_DIR"

node --input-type=module <<'EOF'
import { shouldEmitProductivityReviewWake } from "./tools/guardrails/issueLifecycleGuard.js";

const deduped = shouldEmitProductivityReviewWake({
  wakeReason: "long_active_duration",
  hasOpenProductivityReview: true,
  hasNextAction: false,
  hasCommentDelta: false,
  hasScopeDelta: false,
  hasBlockerDelta: false,
  hasAssignmentDelta: false,
});

const firstSignal = shouldEmitProductivityReviewWake({
  wakeReason: "long_active_duration",
  hasOpenProductivityReview: false,
  hasNextAction: false,
  hasCommentDelta: false,
  hasScopeDelta: false,
  hasBlockerDelta: false,
  hasAssignmentDelta: false,
});

const withNextAction = shouldEmitProductivityReviewWake({
  wakeReason: "long_active_duration",
  hasOpenProductivityReview: true,
  hasNextAction: true,
  hasCommentDelta: false,
  hasScopeDelta: false,
  hasBlockerDelta: false,
  hasAssignmentDelta: false,
});

const pass = deduped.emit === false
  && deduped.code === "dedupe_long_active_without_next_action_open_review"
  && firstSignal.emit === true
  && firstSignal.code === "emit_long_active_first_signal_without_next_action"
  && withNextAction.emit === true
  && withNextAction.code === "emit_long_active_with_next_action";

console.log(`deduped_emit=${deduped.emit ? "yes" : "no"}`);
console.log(`deduped_code=${deduped.code}`);
console.log(`first_signal_emit=${firstSignal.emit ? "yes" : "no"}`);
console.log(`first_signal_code=${firstSignal.code}`);
console.log(`with_next_action_emit=${withNextAction.emit ? "yes" : "no"}`);
console.log(`with_next_action_code=${withNextAction.code}`);
console.log(`RESULT=${pass ? "PASS_LONG_ACTIVE_NEXT_ACTION_DEDUPE" : "FAIL_LONG_ACTIVE_NEXT_ACTION_DEDUPE"}`);

if (!pass) process.exit(1);
EOF
