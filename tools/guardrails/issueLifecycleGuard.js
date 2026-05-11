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

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}

export function shouldAllowStatusMutation(input = {}) {
  const currentStatus = input.currentStatus;
  const nextStatus = input.nextStatus;

  if (!currentStatus || !nextStatus) {
    return { allow: false, code: "status_required" };
  }

  if (!isTerminalStatus(currentStatus)) {
    return { allow: true, code: "ok_non_terminal" };
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

export function shouldAutoResumeFromBlockerResolution(input = {}) {
  const status = input.status;
  const blockedByIssueIds = normalizeIssueIds(input.blockedByIssueIds);
  const resolvedBlockerIssueIds = normalizeIssueIds(input.resolvedBlockerIssueIds);
  const candidateResumeSource = typeof input.resumeSource === "string" ? input.resumeSource.trim() : "";

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

export function normalizeBlockedByIssueIds(input = {}) {
  const normalized = [
    ...toStringArray(input.blockedByIssueIds),
    ...toStringArray(input.blockedByIssueId),
    ...toStringArray(input.blockedBy),
  ];

  const deduped = [];
  const seen = new Set();
  for (const value of normalized) {
    if (seen.has(value)) continue;
    seen.add(value);
    deduped.push(value);
  }

  return deduped;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
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

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return [trimmed];
  }

  return [];
}
