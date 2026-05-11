import test from "node:test";
import assert from "node:assert/strict";
import {
  isTerminalStatus,
  normalizeBlockedByIssueIds,
  shouldAutoResumeFromBlockerResolution,
  shouldAllowScopedResumeGate,
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
    resumeSource: "issue_update",
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
    resumeSource: "issue_patch_resume",
    reason: "need follow-up",
  });

  assert.deepEqual(decision, { allow: false, code: "actor_required_for_terminal_reopen" });
});

test("terminal issue cannot reopen with resume=true but missing reason", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    resumeSource: "human_resume",
    actorId: "agent-1",
  });

  assert.deepEqual(decision, { allow: false, code: "reason_required_for_terminal_reopen" });
});

test("terminal issue can reopen only with explicit resume + actor + reason", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    resumeSource: "issue_comment_resume",
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

test("terminal reopen requires scoped resume source", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    actorId: "agent-1",
    reason: "follow-up needed",
  });

  assert.deepEqual(decision, { allow: false, code: "resume_source_required_for_terminal_reopen" });
});

test("terminal reopen rejects disallowed scoped resume source", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    resumeSource: "system_auto_wake",
    actorId: "agent-1",
    reason: "follow-up needed",
  });

  assert.deepEqual(decision, { allow: false, code: "resume_source_not_allowed_for_terminal_reopen" });
});

test("scoped gate bypasses non-terminal-reopen transitions", () => {
  const decision = shouldAllowScopedResumeGate({
    currentStatus: "in_progress",
    nextStatus: "done",
  });

  assert.deepEqual(decision, { allow: true, code: "ok_not_terminal_reopen_transition" });
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

test("normalizeBlockedByIssueIds normalizes singleton blocker fields", () => {
  const normalized = normalizeBlockedByIssueIds({
    blockedByIssueId: " RAT-730 ",
  });

  assert.deepEqual(normalized, ["RAT-730"]);
});

test("normalizeBlockedByIssueIds merges and dedupes mixed blocker inputs", () => {
  const normalized = normalizeBlockedByIssueIds({
    blockedByIssueIds: ["RAT-730", " RAT-741 "],
    blockedByIssueId: "RAT-741",
    blockedBy: "RAT-594",
  });

  assert.deepEqual(normalized, ["RAT-730", "RAT-741", "RAT-594"]);
});

test("auto-resume requires blocked status", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "in_progress",
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: ["RAT-1"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, { allow: false, code: "auto_resume_requires_blocked_status" });
});

test("auto-resume requires blockedBy issue links", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: [],
    resolvedBlockerIssueIds: ["RAT-1"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, { allow: false, code: "auto_resume_requires_blockedby_links" });
});

test("auto-resume requires resolved blocker delta", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: [],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, { allow: false, code: "auto_resume_requires_resolved_blocker_delta" });
});

test("auto-resume requires resolved blocker to match blockedBy links", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: ["RAT-2"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "auto_resume_requires_matching_blockedby_resolution",
  });
});

test("auto-resume requires issue_blockers_resolved source", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: ["RAT-1"],
    resumeSource: "issue_update",
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "auto_resume_requires_blocker_resolution_source",
  });
});

test("auto-resume allowed when blockedBy link is explicitly resolved", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: ["RAT-1", "RAT-3"],
    resolvedBlockerIssueIds: ["RAT-2", "RAT-3"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_auto_resume_from_blockedby_resolution",
  });
});

test("auto-resume normalizes whitespace around blocker ids", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: [" RAT-1 ", "RAT-3"],
    resolvedBlockerIssueIds: ["RAT-1"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_auto_resume_from_blockedby_resolution",
  });
});

test("auto-resume dedupes blocker ids before matching resolution", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueIds: ["RAT-1", "RAT-1", "RAT-2"],
    resolvedBlockerIssueIds: ["RAT-2", "RAT-2"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_auto_resume_from_blockedby_resolution",
  });
});
