#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LEDGER_PATH="server/.data/rat-774-terminal-ledger.json"
ISSUE_ID="${1:-RAT-349}"

echo "RAT-774 productivity-review terminal persistence replay"
echo "repo: $ROOT_DIR"
echo "issue_id: $ISSUE_ID"
echo "ledger_path: $LEDGER_PATH"

node --input-type=module <<'EOF'
import {
  persistTerminalIssueState,
  readPersistedTerminalStatus,
  shouldAllowStatusMutation,
  shouldEmitStatusChangedWake,
} from "./tools/guardrails/issueLifecycleGuard.js";

const ledgerPath = "server/.data/rat-774-terminal-ledger.json";
const issueId = process.env.RAT_774_ISSUE_ID || "RAT-349";

const persist = persistTerminalIssueState({
  ledgerPath,
  issueId,
  status: "done",
  updatedAt: "2026-05-11T16:00:00.000Z",
});

const persistedTerminalStatus = readPersistedTerminalStatus({ ledgerPath, issueId });

const wakeDecision = shouldEmitStatusChangedWake({
  wakeReason: "issue_status_changed",
  currentStatus: "in_progress",
  persistedTerminalStatus,
  hasCommentDelta: false,
  hasScopeDelta: false,
  hasBlockerDelta: false,
  hasAssignmentDelta: false,
});

const mutationDecision = shouldAllowStatusMutation({
  currentStatus: "in_progress",
  persistedTerminalStatus,
  nextStatus: "in_progress",
  resume: false,
  resumeSource: "issue_update",
  actorId: "automation-checkout",
  reason: "status drift replay",
});

const replayPassed = persist.ok === true
  && persistedTerminalStatus === "done"
  && wakeDecision.emit === false
  && mutationDecision.allow === false;

console.log(`persist_ok=${persist.ok === true ? "yes" : "no"}`);
console.log(`persisted_terminal_status=${persistedTerminalStatus || "none"}`);
console.log(`wake_emit=${wakeDecision.emit === true ? "yes" : "no"}`);
console.log(`wake_code=${wakeDecision.code}`);
console.log(`mutation_allow=${mutationDecision.allow === true ? "yes" : "no"}`);
console.log(`mutation_code=${mutationDecision.code}`);
console.log(`RESULT=${replayPassed ? "PASS_TERMINAL_PERSISTENCE_GUARD" : "FAIL_TERMINAL_PERSISTENCE_GUARD"}`);

if (!replayPassed) process.exit(1);
EOF
