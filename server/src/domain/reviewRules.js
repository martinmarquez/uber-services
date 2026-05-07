export const REVIEW_STATUS = {
  VERIFICADA: "verificada",
  EN_REVISION: "en_revision",
  NO_RECOMENDADA: "no_recomendada",
  REMOVIDA: "removida",
};

const ELIGIBILITY_REASONS = new Set([
  "service_not_completed",
  "outside_14_day_window",
  "identity_mismatch",
  "duplicate_review",
  "rate_limited",
  "other_policy_violation",
]);

const ALLOWED_TRANSITIONS = new Set([
  "verificada->en_revision",
  "en_revision->verificada",
  "en_revision->no_recomendada",
  "en_revision->removida",
  "no_recomendada->en_revision",
  "removida->en_revision",
]);

export function isEligibleForReview(ctx) {
  if (!ctx?.serviceCompletedAt) return fail("service_not_completed");
  if (!ctx?.reviewerMatchesParticipant) return fail("identity_mismatch");
  if (ctx?.alreadyReviewed) return fail("duplicate_review");
  if (ctx?.rateLimited) return fail("rate_limited");

  const completedAt = new Date(ctx.serviceCompletedAt);
  const now = new Date(ctx.now ?? Date.now());
  const days = (now - completedAt) / (1000 * 60 * 60 * 24);
  if (Number.isNaN(days) || days > 14) return fail("outside_14_day_window");
  if (days < 0) return fail("other_policy_violation");

  return { eligible: true, reason: null };
}

export function isTransitionAllowed(fromStatus, toStatus) {
  return ALLOWED_TRANSITIONS.has(`${fromStatus}->${toStatus}`);
}

export function validateModerationDecision(decision) {
  if (!decision?.reasonCode) return "reason_code_required";
  if (!decision?.decisionNote) return "decision_note_required";
  if (!decision?.moderatorId) return "moderator_id_required";
  if (!/^SEV-[0-3]$/.test(String(decision?.severity ?? ""))) return "severity_invalid";
  return null;
}

export function validateEligibilityReason(reason) {
  return ELIGIBILITY_REASONS.has(reason);
}

function fail(reason) {
  return { eligible: false, reason };
}
