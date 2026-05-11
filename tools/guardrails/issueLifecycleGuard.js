const TERMINAL_STATUSES = new Set(["done", "cancelled"]);
const ACTIVE_STATUSES = new Set(["todo", "in_progress", "in_review", "blocked"]);

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

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
