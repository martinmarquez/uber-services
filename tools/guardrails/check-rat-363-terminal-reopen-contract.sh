#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-363 terminal reopen contract check"
echo "repo: $ROOT_DIR"

node --input-type=module <<'NODE'
import {
  shouldAllowStatusMutation,
  shouldEmitStatusChangedWake,
  shouldAutoResumeFromBlockerResolution,
} from "./tools/guardrails/issueLifecycleGuard.js";

const assertions = [];

const reopenWithoutResume = shouldAllowStatusMutation({
  currentStatus: "done",
  nextStatus: "in_progress",
  resume: false,
  resumeSource: "issue_update",
  actorId: "automation",
  reason: "status sync",
});
assertions.push({
  name: "terminal reopen blocked without resume",
  pass: reopenWithoutResume.allow === false && reopenWithoutResume.code === "resume_required_for_terminal_reopen",
  actual: reopenWithoutResume,
});

const reopenWithResume = shouldAllowStatusMutation({
  currentStatus: "done",
  nextStatus: "in_progress",
  resume: true,
  resumeSource: "issue_comment_resume",
  actorId: "agent-1",
  reason: "new scoped work",
});
assertions.push({
  name: "terminal reopen allowed with explicit scoped resume",
  pass: reopenWithResume.allow === true && reopenWithResume.code === "ok_explicit_resume",
  actual: reopenWithResume,
});

const noDeltaWake = shouldEmitStatusChangedWake({
  wakeReason: "issue_status_changed",
  fromStatus: "done",
  toStatus: "in_progress",
  hasCommentDelta: false,
  hasScopeDelta: false,
  hasBlockerDelta: false,
  hasAssignmentDelta: false,
});
assertions.push({
  name: "no-delta status wake deduped for terminal issue",
  pass: noDeltaWake.emit === false && noDeltaWake.code === "dedupe_terminal_resume_wake_without_comment_delta",
  actual: noDeltaWake,
});

const terminalAutoResume = shouldAutoResumeFromBlockerResolution({
  status: "done",
  persistedTerminalStatus: "done",
  blockedByIssueIds: ["RAT-10"],
  resolvedBlockerIssueIds: ["RAT-10"],
  resumeSource: "issue_blockers_resolved",
});
assertions.push({
  name: "terminal issue cannot auto-resume from blocker resolution",
  pass: terminalAutoResume.allow === false && terminalAutoResume.code === "auto_resume_blocked_for_terminal_issue",
  actual: terminalAutoResume,
});

let failed = 0;
for (const item of assertions) {
  const mark = item.pass ? "PASS" : "FAIL";
  console.log(`${mark}: ${item.name} -> ${JSON.stringify(item.actual)}`);
  if (!item.pass) failed += 1;
}

if (failed > 0) {
  console.log(`RESULT=FAIL failed_assertions=${failed}`);
  process.exit(1);
}

console.log("RESULT=PASS");
NODE
