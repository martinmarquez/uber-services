import test from "node:test";
import assert from "node:assert/strict";
import {
  isTerminalStatus,
  shouldAllowStatusMutation,
  shouldEmitStatusChangedWake,
} from "./issueLifecycleGuard.js";

test("isTerminalStatus identifies done/cancelled as terminal", () => {
  assert.equal(isTerminalStatus("done"), true);
  assert.equal(isTerminalStatus("cancelled"), true);
  assert.equal(isTerminalStatus("in_progress"), false);
});

test("terminal issue cannot reopen without resume=true", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: false,
    actorId: "agent-1",
    reason: "need follow-up",
  });

  assert.deepEqual(decision, { allow: false, code: "resume_required_for_terminal_reopen" });
});

test("terminal issue cannot reopen with resume=true but missing actor", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    reason: "need follow-up",
  });

  assert.deepEqual(decision, { allow: false, code: "actor_required_for_terminal_reopen" });
});

test("terminal issue cannot reopen with resume=true but missing reason", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    actorId: "agent-1",
  });

  assert.deepEqual(decision, { allow: false, code: "reason_required_for_terminal_reopen" });
});

test("terminal issue can reopen only with explicit resume + actor + reason", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    actorId: "agent-1",
    reason: "new scope added",
  });

  assert.deepEqual(decision, { allow: true, code: "ok_explicit_resume" });
});

test("non-terminal transitions remain allowed", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "in_review",
    nextStatus: "done",
  });

  assert.deepEqual(decision, { allow: true, code: "ok_non_terminal" });
});

test("terminal-finalization no-delta status wakes are deduped", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    fromStatus: "done",
    toStatus: "done",
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
  });

  assert.deepEqual(decision, { emit: false, code: "dedupe_terminal_no_delta" });
});

test("status change wake emits when delta exists", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    fromStatus: "done",
    toStatus: "done",
    hasCommentDelta: true,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
  });

  assert.deepEqual(decision, { emit: true, code: "emit_status_change_wake" });
});
