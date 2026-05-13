import fs from "node:fs";
import path from "node:path";

const TERMINAL_STATUSES = new Set(["done", "cancelled"]);
const ACTIVE_STATUSES = new Set(["todo", "in_progress", "in_review", "blocked"]);
const DEFAULT_ALLOWED_RESUME_SOURCES = new Set([
  "issue_update",
  "issue_comment",
  "issue_comment_resume",
  "issue_patch",
  "issue_patch_resume",
  "human_resume",
]);
const DEDUPE_RESUME_WAKE_REASONS = new Set(["issue_status_changed", "issue_blockers_resolved"]);
const PRODUCTIVITY_LONG_ACTIVE_WAKE_REASONS = new Set(["long_active_duration", "issue_long_active_duration"]);

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}

export function shouldAllowStatusMutation(input = {}) {
  const currentStatus = input.currentStatus;
  const persistedTerminalStatus = typeof input.persistedTerminalStatus === "string"
    ? input.persistedTerminalStatus
    : "";
  const nextStatus = input.nextStatus;

  if (!currentStatus || !nextStatus) {
    return { allow: false, code: "status_required" };
  }

  const effectiveTerminalStatus = isTerminalStatus(currentStatus)
    ? currentStatus
    : (isTerminalStatus(persistedTerminalStatus) ? persistedTerminalStatus : "");

  if (!effectiveTerminalStatus) {
    return shouldAllowBlockedReopen(input);
  }

  if (!ACTIVE_STATUSES.has(nextStatus)) {
    return { allow: true, code: "ok_terminal_non_reopen" };
  }

  const scopedDecision = shouldAllowScopedResumeGate(input);
  if (!scopedDecision.allow) return scopedDecision;

  if (input.resume !== true) {
    return { allow: false, code: "resume_required_for_terminal_reopen" };
  }

  if (!isNonEmptyString(input.actorId)) {
    return { allow: false, code: "actor_required_for_terminal_reopen" };
  }

  if (!isNonEmptyString(input.reason)) {
    return { allow: false, code: "reason_required_for_terminal_reopen" };
  }

  return { allow: true, code: "ok_explicit_resume" };
}

function shouldAllowBlockedReopen(input = {}) {
  const currentStatus = input.currentStatus;
  const nextStatus = input.nextStatus;
  if (currentStatus !== "blocked" || !ACTIVE_STATUSES.has(nextStatus) || nextStatus === "blocked") {
    return { allow: true, code: "ok_non_terminal" };
  }

  if (input.resume === true) {
    if (!isNonEmptyString(input.actorId)) {
      return { allow: false, code: "actor_required_for_blocked_reopen" };
    }
    if (!isNonEmptyString(input.reason)) {
      return { allow: false, code: "reason_required_for_blocked_reopen" };
    }
    return { allow: true, code: "ok_manual_resume_from_blocked" };
  }

  const hasExplicitSignal = input.hasCommentDelta === true || input.hasEvidenceDelta === true;
  if (hasExplicitSignal) {
    return { allow: true, code: "ok_explicit_signal_from_blocked" };
  }

  const blockerResolutionDecision = shouldAutoResumeFromBlockerResolution({
    status: currentStatus,
    blockedByIssueIds: input.blockedByIssueIds,
    blockedByIssueId: input.blockedByIssueId,
    blockedBy: input.blockedBy,
    resolvedBlockerIssueIds: input.resolvedBlockerIssueIds,
    resolvedBlockerIssueId: input.resolvedBlockerIssueId,
    resolvedBlockerId: input.resolvedBlockerId,
    resolvedBlockerIssue: input.resolvedBlockerIssue,
    resolvedBlocker: input.resolvedBlocker,
    resumeSource: input.resumeSource,
  });

  if (blockerResolutionDecision.allow) {
    return { allow: true, code: "ok_auto_resume_from_blockedby_resolution" };
  }

  return { allow: false, code: "explicit_trigger_required_for_blocked_reopen" };
}

export function shouldAllowScopedResumeGate(input = {}) {
  const currentStatus = input.currentStatus;
  const nextStatus = input.nextStatus;

  if (!isTerminalStatus(currentStatus) || !ACTIVE_STATUSES.has(nextStatus)) {
    return { allow: true, code: "ok_not_terminal_reopen_transition" };
  }

  const resumeSource = typeof input.resumeSource === "string" ? input.resumeSource.trim() : "";
  const allowedResumeSources = input.allowedResumeSources instanceof Set
    ? input.allowedResumeSources
    : DEFAULT_ALLOWED_RESUME_SOURCES;

  if (!resumeSource) {
    return { allow: false, code: "resume_source_required_for_terminal_reopen" };
  }

  if (!allowedResumeSources.has(resumeSource)) {
    return { allow: false, code: "resume_source_not_allowed_for_terminal_reopen" };
  }

  return { allow: true, code: "ok_scoped_resume_source" };
}

export function shouldEmitStatusChangedWake(input = {}) {
  const wakeReason = input.wakeReason;
  const fromStatus = input.fromStatus;
  const toStatus = input.toStatus;
  const currentStatus = typeof input.currentStatus === "string" ? input.currentStatus : "";
  const targetStatus = typeof input.targetStatus === "string" ? input.targetStatus : "";
  const persistedTerminalStatus = typeof input.persistedTerminalStatus === "string"
    ? input.persistedTerminalStatus
    : "";
  const hasMaterialRiskDelta = hasMaterialRiskSignalDelta(input);

  const terminalWakeStatus = [fromStatus, toStatus, currentStatus, targetStatus, persistedTerminalStatus]
    .some((status) => isTerminalStatus(status));

  if (DEDUPE_RESUME_WAKE_REASONS.has(wakeReason) && terminalWakeStatus && !hasMaterialRiskDelta) {
    return { emit: false, code: "dedupe_terminal_resume_wake_without_comment_delta" };
  }

  if (wakeReason !== "issue_status_changed") {
    return { emit: true, code: "non_status_change_wake" };
  }

  const noDelta = !input.hasCommentDelta
    && !input.hasScopeDelta
    && !input.hasBlockerDelta
    && !input.hasAssignmentDelta;

  const terminalFinalization = isTerminalStatus(fromStatus) && isTerminalStatus(toStatus);

  if (noDelta && terminalFinalization) {
    return { emit: false, code: "dedupe_terminal_no_delta" };
  }

  return { emit: true, code: "emit_status_change_wake" };
}

export function shouldEmitProductivityReviewWake(input = {}) {
  const wakeReason = typeof input.wakeReason === "string" ? input.wakeReason.trim() : "";
  if (!PRODUCTIVITY_LONG_ACTIVE_WAKE_REASONS.has(wakeReason)) {
    return { emit: true, code: "non_long_active_wake" };
  }

  if (hasMaterialRiskSignalDelta(input)) {
    return { emit: true, code: "emit_long_active_with_material_delta" };
  }

  const hasNextAction = input.hasNextAction === true
    || (typeof input.nextAction === "string" && input.nextAction.trim().length > 0);
  if (hasNextAction) {
    return { emit: true, code: "emit_long_active_with_next_action" };
  }

  if (input.hasOpenProductivityReview === true) {
    return { emit: false, code: "dedupe_long_active_without_next_action_open_review" };
  }

  return { emit: true, code: "emit_long_active_first_signal_without_next_action" };
}

export function isEngineeringAssignmentDelta(input = {}) {
  if (input.isEngineeringAssignmentDelta === true) return true;
  if (input.isEngineeringAssignmentDelta === false) return false;
  if (input.hasAssignmentDelta !== true) return false;

  const engineeringTags = [
    input.assigneeTeam,
    input.assigneeDepartment,
    input.assigneeFunction,
    input.assigneeRole,
    input.assigneeAgentName,
  ]
    .filter((value) => typeof value === "string")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  if (engineeringTags.length < 1) return true;

  return engineeringTags.some((value) =>
    value.includes("engineer")
      || value.includes("engineering")
      || value.includes("developer")
      || value.includes("devops")
      || value.includes("sre")
      || value.includes("qa")
      || value.includes("security"),
  );
}

export function shouldPersistTerminalIssueState(input = {}) {
  const issueType = typeof input.issueType === "string" ? input.issueType.trim().toLowerCase() : "";
  if (issueType === "productivity_review") return true;

  const title = typeof input.title === "string" ? input.title.trim().toLowerCase() : "";
  return title.includes("productivity review");
}

export function readTerminalIssueStateLedger(ledgerPath) {
  if (!isNonEmptyString(ledgerPath)) return {};
  if (!fs.existsSync(ledgerPath)) return {};
  try {
    const raw = fs.readFileSync(ledgerPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function persistTerminalIssueState(input = {}) {
  const ledgerPath = typeof input.ledgerPath === "string" ? input.ledgerPath.trim() : "";
  const issueId = typeof input.issueId === "string" ? input.issueId.trim() : "";
  const status = typeof input.status === "string" ? input.status.trim() : "";
  const updatedAt = typeof input.updatedAt === "string" && input.updatedAt.trim().length > 0
    ? input.updatedAt.trim()
    : new Date().toISOString();

  if (!ledgerPath || !issueId || !isTerminalStatus(status)) {
    return { ok: false, code: "persist_terminal_state_invalid_input" };
  }

  const ledger = readTerminalIssueStateLedger(ledgerPath);
  ledger[issueId] = { status, updatedAt };

  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  return { ok: true, code: "ok_persist_terminal_state" };
}

export function readPersistedTerminalStatus(input = {}) {
  const ledgerPath = typeof input.ledgerPath === "string" ? input.ledgerPath.trim() : "";
  const issueId = typeof input.issueId === "string" ? input.issueId.trim() : "";
  if (!ledgerPath || !issueId) return "";

  const ledger = readTerminalIssueStateLedger(ledgerPath);
  const entry = ledger?.[issueId];
  if (!entry || typeof entry !== "object") return "";
  const status = typeof entry.status === "string" ? entry.status.trim() : "";
  return isTerminalStatus(status) ? status : "";
}

export function buildWakeDedupeLogPayload(input = {}, decision = {}) {
  if (decision?.emit !== false) return null;
  if (typeof decision?.code !== "string" || decision.code.trim().length < 1) return null;

  return {
    eventName: "issue_wake_deduped",
    dedupeReasonCode: decision.code,
    wakeReason: typeof input.wakeReason === "string" ? input.wakeReason : null,
    currentStatus: typeof input.currentStatus === "string" ? input.currentStatus : null,
    fromStatus: typeof input.fromStatus === "string" ? input.fromStatus : null,
    toStatus: typeof input.toStatus === "string" ? input.toStatus : null,
    hasCommentDelta: input.hasCommentDelta === true,
  };
}

export function shouldAutoResumeFromBlockerResolution(input = {}) {
  const status = typeof input.status === "string" ? input.status.trim() : "";
  const persistedTerminalStatus = typeof input.persistedTerminalStatus === "string"
    ? input.persistedTerminalStatus.trim()
    : "";
  const blockedByIssueIds = normalizeBlockerIdSet(
    input.blockedByIssueIds,
    input.blockedByIssueId,
    input.blockedBy,
  );
  const resolvedBlockerIssueIds = normalizeBlockerIdSet(
    input.resolvedBlockerIssueIds,
    input.resolvedBlockerIssueId,
    input.resolvedBlockerId,
    input.resolvedBlockerIssue,
    input.resolvedBlocker,
  );
  const candidateResumeSource = typeof input.resumeSource === "string" ? input.resumeSource.trim() : "";
  const effectiveTerminalStatus = isTerminalStatus(status)
    ? status
    : (isTerminalStatus(persistedTerminalStatus) ? persistedTerminalStatus : "");

  if (effectiveTerminalStatus) {
    return { allow: false, code: "auto_resume_blocked_for_terminal_issue" };
  }

  if (status !== "blocked") {
    return { allow: false, code: "auto_resume_requires_blocked_status" };
  }

  if (blockedByIssueIds.length < 1) {
    return { allow: false, code: "auto_resume_requires_blockedby_links" };
  }

  if (resolvedBlockerIssueIds.length < 1) {
    return { allow: false, code: "auto_resume_requires_resolved_blocker_delta" };
  }

  const resolvedSet = new Set(resolvedBlockerIssueIds);
  const hasResolvedLinkedBlocker = blockedByIssueIds.some((issueId) => resolvedSet.has(issueId));
  if (!hasResolvedLinkedBlocker) {
    return { allow: false, code: "auto_resume_requires_matching_blockedby_resolution" };
  }

  if (candidateResumeSource !== "issue_blockers_resolved") {
    return { allow: false, code: "auto_resume_requires_blocker_resolution_source" };
  }

  return { allow: true, code: "ok_auto_resume_from_blockedby_resolution" };
}

export function shouldExecuteOpenRoutine(input = {}) {
  const issueId = typeof input.issueId === "string" ? input.issueId.trim() : "";
  if (!issueId) {
    return { allow: false, code: "open_routine_issue_id_required" };
  }

  const executionCount = Number.isInteger(input.executionCount) ? input.executionCount : 0;
  if (executionCount < 0) {
    return { allow: false, code: "open_routine_execution_count_invalid" };
  }

  const maxExecutions = Number.isInteger(input.maxExecutions) ? input.maxExecutions : 1;
  if (maxExecutions < 1) {
    return { allow: false, code: "open_routine_max_executions_invalid" };
  }

  if (executionCount >= maxExecutions) {
    return { allow: false, code: "open_routine_duplicate_execution_blocked" };
  }

  return { allow: true, code: "ok_open_routine_execution_allowed" };
}

export function normalizeBlockedByIssueIds(input = {}) {
  const normalized = [
    ...toStringArray(input.blockedByIssueIds),
    ...toStringArray(input.blockedByIssueId),
    ...toStringArray(input.blockedBy),
  ];
  const issueId = typeof input.issueId === "string" ? input.issueId.trim() : "";

  const deduped = [];
  const seen = new Set();
  for (const value of normalized) {
    if (issueId && value === issueId) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    deduped.push(value);
  }

  return deduped;
}

export function normalizeBlockerEdgesForAnalyticsChain(issues = []) {
  const adjacency = new Map();
  const edgeKeys = new Set();
  const edges = [];

  for (const issue of issues) {
    if (!issue || typeof issue !== "object") continue;
    const issueId = typeof issue.issueId === "string" ? issue.issueId.trim() : "";
    if (!issueId) continue;

    const blockedByIssueIds = normalizeBlockedByIssueIds({
      issueId,
      blockedByIssueIds: issue.blockedByIssueIds,
      blockedByIssueId: issue.blockedByIssueId,
      blockedBy: issue.blockedBy,
    });

    adjacency.set(issueId, blockedByIssueIds);
    for (const blockedByIssueId of blockedByIssueIds) {
      const edgeKey = `${issueId}->${blockedByIssueId}`;
      if (edgeKeys.has(edgeKey)) continue;
      edgeKeys.add(edgeKey);
      edges.push({ issueId, blockedByIssueId });
    }
  }

  const cycleIssueIds = detectCycleIssueIds(adjacency);
  return {
    edges,
    hasCycle: cycleIssueIds.length > 0,
    cycleIssueIds,
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMaterialRiskSignalDelta(input = {}) {
  const materialAssignmentDelta = isEngineeringAssignmentDelta(input);
  return input.hasCommentDelta === true
    || input.hasScopeDelta === true
    || input.hasBlockerDelta === true
    || materialAssignmentDelta
    || input.hasNoMovementWindowBreach === true
    || input.hasChurnThresholdBreach === true;
}

function normalizeIssueIds(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const normalized = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const issueId = raw.trim();
    if (issueId.length < 1 || seen.has(issueId)) continue;
    seen.add(issueId);
    normalized.push(issueId);
  }
  return normalized;
}

function normalizeBlockerIdSet(...values) {
  const merged = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      merged.push(...value);
      continue;
    }
    merged.push(value);
  }
  return normalizeIssueIds(merged);
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractIssueIdsFromValue(item));
  }

  return extractIssueIdsFromValue(value);
}

function extractIssueIdsFromValue(value) {
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  const matches = trimmed.match(/\bRAT-\d+\b/gi);
  if (!matches || matches.length < 1) return [trimmed];
  return matches.map((item) => item.toUpperCase());
}

function detectCycleIssueIds(adjacency) {
  const visiting = new Set();
  const visited = new Set();
  const cycleNodes = new Set();
  const path = [];

  function visit(issueId) {
    if (visited.has(issueId)) return;
    if (visiting.has(issueId)) return;

    visiting.add(issueId);
    path.push(issueId);

    const neighbors = adjacency.get(issueId) ?? [];
    for (const neighbor of neighbors) {
      if (visiting.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart >= 0) {
          for (let i = cycleStart; i < path.length; i += 1) {
            cycleNodes.add(path[i]);
          }
          cycleNodes.add(neighbor);
        }
        continue;
      }
      if (adjacency.has(neighbor)) {
        visit(neighbor);
      }
    }

    path.pop();
    visiting.delete(issueId);
    visited.add(issueId);
  }

  for (const issueId of adjacency.keys()) {
    visit(issueId);
  }

  return [...cycleNodes];
}
