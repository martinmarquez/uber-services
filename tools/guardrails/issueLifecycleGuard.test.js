import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildWakeDedupeLogPayload,
  isTerminalStatus,
  normalizeBlockerEdgesForAnalyticsChain,
  normalizeBlockedByIssueIds,
  persistTerminalIssueState,
  readPersistedTerminalStatus,
  readTerminalIssueStateLedger,
  shouldPersistTerminalIssueState,
  shouldAutoResumeFromBlockerResolution,
  shouldAllowScopedResumeGate,
  shouldAllowStatusMutation,
  shouldEmitProductivityReviewWake,
  shouldExecuteOpenRoutine,
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

test("done->todo transition is blocked without resume=true", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "todo",
    resume: false,
    resumeSource: "issue_update",
    actorId: "agent-1",
    reason: "need follow-up",
  });

  assert.deepEqual(decision, { allow: false, code: "resume_required_for_terminal_reopen" });
});

test("done->todo transition is allowed with explicit resume+scope", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "todo",
    resume: true,
    resumeSource: "issue_update",
    actorId: "agent-1",
    reason: "priorities changed",
  });

  assert.deepEqual(decision, { allow: true, code: "ok_explicit_resume" });
});

test("checkout automation cannot implicitly reopen terminal issue without resume", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "cancelled",
    nextStatus: "in_progress",
    resume: false,
    resumeSource: "issue_update",
    actorId: "automation-checkout",
    reason: "checkout side effect",
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

test("terminal issue cannot reopen with checkout source even when resume requested", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: true,
    resumeSource: "issue_checkout",
    actorId: "automation-checkout",
    reason: "manual rerun from checkout",
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "resume_source_not_allowed_for_terminal_reopen",
  });
});

test("non-terminal transitions remain allowed", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "in_review",
    nextStatus: "done",
  });

  assert.deepEqual(decision, { allow: true, code: "ok_non_terminal" });
});

test("blocked issue cannot reopen without explicit trigger", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "blocked",
    nextStatus: "in_progress",
    resume: false,
    resumeSource: "issue_status_changed",
    hasCommentDelta: false,
    hasEvidenceDelta: false,
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: [],
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "explicit_trigger_required_for_blocked_reopen",
  });
});

test("blocked issue can reopen on explicit comment delta", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "blocked",
    nextStatus: "in_progress",
    hasCommentDelta: true,
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_explicit_signal_from_blocked",
  });
});

test("blocked issue can reopen via manual resume with actor+reason", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "blocked",
    nextStatus: "in_progress",
    resume: true,
    actorId: "agent-1",
    reason: "new mitigation plan",
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_manual_resume_from_blocked",
  });
});

test("blocked issue can auto-resume only from matching blocker resolution", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "blocked",
    nextStatus: "in_progress",
    resumeSource: "issue_blockers_resolved",
    blockedByIssueIds: ["RAT-1", "RAT-2"],
    resolvedBlockerIssueIds: ["RAT-2"],
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_auto_resume_from_blockedby_resolution",
  });
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

  assert.deepEqual(decision, {
    emit: false,
    code: "dedupe_terminal_resume_wake_without_comment_delta",
  });
});

test("done issues emit status-changed wake when material deltas exist", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    fromStatus: "done",
    toStatus: "in_progress",
    hasCommentDelta: false,
    hasScopeDelta: true,
    hasBlockerDelta: true,
    hasAssignmentDelta: true,
  });

  assert.deepEqual(decision, { emit: true, code: "emit_status_change_wake" });
});

test("done issues emit blocker-resolved wake when blocker delta exists", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_blockers_resolved",
    currentStatus: "done",
    hasCommentDelta: false,
    hasBlockerDelta: true,
  });

  assert.deepEqual(decision, { emit: true, code: "non_status_change_wake" });
});

test("active issues still emit blocker-resolved wake", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_blockers_resolved",
    currentStatus: "blocked",
    hasCommentDelta: false,
    hasBlockerDelta: true,
  });

  assert.deepEqual(decision, { emit: true, code: "non_status_change_wake" });
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

test("deduped wake produces structured dedupe log payload", () => {
  const input = {
    wakeReason: "issue_blockers_resolved",
    currentStatus: "done",
    fromStatus: "done",
    toStatus: "done",
    hasCommentDelta: false,
  };
  const decision = { emit: false, code: "dedupe_terminal_resume_wake_without_comment_delta" };

  const payload = buildWakeDedupeLogPayload(input, decision);

  assert.deepEqual(payload, {
    eventName: "issue_wake_deduped",
    dedupeReasonCode: "dedupe_terminal_resume_wake_without_comment_delta",
    wakeReason: "issue_blockers_resolved",
    currentStatus: "done",
    fromStatus: "done",
    toStatus: "done",
    hasCommentDelta: false,
  });
});

test("non-deduped wake does not produce dedupe log payload", () => {
  const payload = buildWakeDedupeLogPayload(
    { wakeReason: "issue_status_changed", currentStatus: "blocked", hasCommentDelta: true },
    { emit: true, code: "emit_status_change_wake" },
  );

  assert.equal(payload, null);
});

test("consecutive terminal no-delta heartbeats are both deduped", () => {
  const firstWakeDecision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    fromStatus: "done",
    toStatus: "done",
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
  });

  const secondWakeDecision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    fromStatus: "done",
    toStatus: "done",
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
  });

  const secondMutationDecision = shouldAllowStatusMutation({
    currentStatus: "done",
    nextStatus: "in_progress",
    resume: false,
    resumeSource: "issue_update",
    actorId: "heartbeat-run",
    reason: "no delta rerun",
  });

  assert.deepEqual(firstWakeDecision, {
    emit: false,
    code: "dedupe_terminal_resume_wake_without_comment_delta",
  });
  assert.deepEqual(secondWakeDecision, {
    emit: false,
    code: "dedupe_terminal_resume_wake_without_comment_delta",
  });
  assert.deepEqual(secondMutationDecision, {
    allow: false,
    code: "resume_required_for_terminal_reopen",
  });
});

test("persisted terminal status blocks reopen even when current status drifts active", () => {
  const decision = shouldAllowStatusMutation({
    currentStatus: "in_progress",
    persistedTerminalStatus: "done",
    nextStatus: "in_progress",
    resume: false,
    resumeSource: "issue_update",
    actorId: "heartbeat-run",
    reason: "status drift replay",
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "resume_required_for_terminal_reopen",
  });
});

test("persisted terminal status dedupes no-comment status wake", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    currentStatus: "in_progress",
    persistedTerminalStatus: "done",
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
  });

  assert.deepEqual(decision, {
    emit: false,
    code: "dedupe_terminal_resume_wake_without_comment_delta",
  });
});

test("persisted terminal status emits wake on no-movement window breach", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    currentStatus: "in_progress",
    persistedTerminalStatus: "done",
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
    hasNoMovementWindowBreach: true,
  });

  assert.deepEqual(decision, { emit: true, code: "emit_status_change_wake" });
});

test("persisted terminal status emits wake on churn threshold breach", () => {
  const decision = shouldEmitStatusChangedWake({
    wakeReason: "issue_status_changed",
    currentStatus: "in_progress",
    persistedTerminalStatus: "done",
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
    hasChurnThresholdBreach: true,
  });

  assert.deepEqual(decision, { emit: true, code: "emit_status_change_wake" });
});

test("long-active wake without next action dedupes when productivity review is already open", () => {
  const decision = shouldEmitProductivityReviewWake({
    wakeReason: "long_active_duration",
    hasOpenProductivityReview: true,
    hasNextAction: false,
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
    hasNoMovementWindowBreach: false,
    hasChurnThresholdBreach: false,
  });

  assert.deepEqual(decision, {
    emit: false,
    code: "dedupe_long_active_without_next_action_open_review",
  });
});

test("long-active wake emits first signal when no open productivity review exists", () => {
  const decision = shouldEmitProductivityReviewWake({
    wakeReason: "long_active_duration",
    hasOpenProductivityReview: false,
    hasNextAction: false,
    hasCommentDelta: false,
    hasScopeDelta: false,
    hasBlockerDelta: false,
    hasAssignmentDelta: false,
  });

  assert.deepEqual(decision, {
    emit: true,
    code: "emit_long_active_first_signal_without_next_action",
  });
});

test("long-active wake still emits when material delta exists", () => {
  const decision = shouldEmitProductivityReviewWake({
    wakeReason: "long_active_duration",
    hasOpenProductivityReview: true,
    hasNextAction: false,
    hasCommentDelta: false,
    hasScopeDelta: true,
  });

  assert.deepEqual(decision, {
    emit: true,
    code: "emit_long_active_with_material_delta",
  });
});

test("terminal state ledger persists and reads back issue terminal status", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "issue-guard-ledger-"));
  const ledgerPath = path.join(tempDir, "terminal-issues.json");

  const writeResult = persistTerminalIssueState({
    ledgerPath,
    issueId: "RAT-349",
    status: "done",
    updatedAt: "2026-05-11T00:00:00.000Z",
  });
  assert.deepEqual(writeResult, { ok: true, code: "ok_persist_terminal_state" });

  const status = readPersistedTerminalStatus({
    ledgerPath,
    issueId: "RAT-349",
  });
  assert.equal(status, "done");

  const ledger = readTerminalIssueStateLedger(ledgerPath);
  assert.deepEqual(ledger["RAT-349"], {
    status: "done",
    updatedAt: "2026-05-11T00:00:00.000Z",
  });
});

test("terminal persistence applies only to productivity-review issues", () => {
  assert.equal(shouldPersistTerminalIssueState({ issueType: "productivity_review" }), true);
  assert.equal(shouldPersistTerminalIssueState({ title: "CTO Productivity Review for RAT-349" }), true);
  assert.equal(shouldPersistTerminalIssueState({ title: "Implement auth middleware" }), false);
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

test("normalizeBlockedByIssueIds drops self-referential blocker ids", () => {
  const normalized = normalizeBlockedByIssueIds({
    issueId: "RAT-741",
    blockedByIssueIds: ["RAT-730", "RAT-741", "RAT-730"],
    blockedByIssueId: "RAT-741",
  });

  assert.deepEqual(normalized, ["RAT-730"]);
});

test("normalizeBlockedByIssueIds extracts blocker from arrow expression", () => {
  const normalized = normalizeBlockedByIssueIds({
    issueId: "RAT-808",
    blockedBy: "RAT-808 <- RAT-807",
  });

  assert.deepEqual(normalized, ["RAT-807"]);
});

test("normalizeBlockerEdgesForAnalyticsChain normalizes mixed edge inputs", () => {
  const normalized = normalizeBlockerEdgesForAnalyticsChain([
    {
      issueId: "RAT-150",
      blockedByIssueIds: ["RAT-157", " RAT-471 ", "RAT-150"],
      blockedByIssueId: "RAT-471",
    },
    {
      issueId: "RAT-157",
      blockedBy: "RAT-301",
    },
  ]);

  assert.deepEqual(normalized.edges, [
    { issueId: "RAT-150", blockedByIssueId: "RAT-157" },
    { issueId: "RAT-150", blockedByIssueId: "RAT-471" },
    { issueId: "RAT-157", blockedByIssueId: "RAT-301" },
  ]);
  assert.equal(normalized.hasCycle, false);
  assert.deepEqual(normalized.cycleIssueIds, []);
});

test("normalizeBlockerEdgesForAnalyticsChain applies arrow blocker normalization", () => {
  const normalized = normalizeBlockerEdgesForAnalyticsChain([
    { issueId: "RAT-808", blockedBy: "RAT-808 <- RAT-807" },
  ]);

  assert.deepEqual(normalized.edges, [
    { issueId: "RAT-808", blockedByIssueId: "RAT-807" },
  ]);
  assert.equal(normalized.hasCycle, false);
});

test("normalizeBlockerEdgesForAnalyticsChain flags two-node cycles", () => {
  const normalized = normalizeBlockerEdgesForAnalyticsChain([
    { issueId: "RAT-428", blockedByIssueIds: ["RAT-568"] },
    { issueId: "RAT-568", blockedByIssueIds: ["RAT-428"] },
  ]);

  assert.equal(normalized.hasCycle, true);
  assert.deepEqual(new Set(normalized.cycleIssueIds), new Set(["RAT-428", "RAT-568"]));
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

test("auto-resume is blocked for terminal issues even with matching blocker resolution", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "done",
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: ["RAT-1"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, { allow: false, code: "auto_resume_blocked_for_terminal_issue" });
});

test("auto-resume is blocked when persisted terminal status exists despite active status drift", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    persistedTerminalStatus: "done",
    blockedByIssueIds: ["RAT-1"],
    resolvedBlockerIssueIds: ["RAT-1"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, { allow: false, code: "auto_resume_blocked_for_terminal_issue" });
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

test("auto-resume accepts singleton blockedBy/resolved blocker fields", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedByIssueId: " RAT-671 ",
    resolvedBlockerIssueId: "RAT-671",
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_auto_resume_from_blockedby_resolution",
  });
});

test("auto-resume merges blockedBy aliases and resolved blocker aliases", () => {
  const decision = shouldAutoResumeFromBlockerResolution({
    status: "blocked",
    blockedBy: "RAT-671",
    blockedByIssueIds: ["RAT-778"],
    resolvedBlocker: " RAT-671 ",
    resolvedBlockerIssueIds: ["RAT-900"],
    resumeSource: "issue_blockers_resolved",
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_auto_resume_from_blockedby_resolution",
  });
});

test("open routine requires issue id", () => {
  const decision = shouldExecuteOpenRoutine({
    executionCount: 0,
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "open_routine_issue_id_required",
  });
});

test("open routine blocks duplicate execution when constraint reached", () => {
  const decision = shouldExecuteOpenRoutine({
    issueId: "RAT-780",
    executionCount: 1,
    maxExecutions: 1,
  });

  assert.deepEqual(decision, {
    allow: false,
    code: "open_routine_duplicate_execution_blocked",
  });
});

test("open routine allows first execution by default", () => {
  const decision = shouldExecuteOpenRoutine({
    issueId: "RAT-780",
    executionCount: 0,
  });

  assert.deepEqual(decision, {
    allow: true,
    code: "ok_open_routine_execution_allowed",
  });
});
