import { validateEligibilityReason } from "../domain/reviewRules.js";
const ID_REGEX = /^[a-zA-Z0-9_-]{3,80}$/;

export function validateCreateReviewPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (!payload.idempotencyKey || typeof payload.idempotencyKey !== "string") return "idempotency_key_required";
  if (!payload.serviceRequestId) return "service_request_id_required";
  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) return "rating_out_of_range";
  if (payload.comment && String(payload.comment).length > 2000) return "comment_too_long";
  return null;
}

export function validatePatchReviewPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (payload.rating !== undefined) {
    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      return "rating_out_of_range";
    }
  }
  if (payload.comment !== undefined && String(payload.comment).length > 2000) return "comment_too_long";
  return null;
}

export function validateReportPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (typeof payload.reasonCode !== "string" || payload.reasonCode.trim().length < 3) return "reason_code_required";
  return null;
}

export function validateAppealPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (typeof payload.note !== "string" || payload.note.trim().length < 10) return "appeal_note_too_short";
  return null;
}

export function validateRouteParams(params) {
  if (!params || typeof params !== "object") return "invalid_params";
  if (params.reviewId !== undefined && !ID_REGEX.test(String(params.reviewId))) return "invalid_review_id";
  if (params.serviceRequestId !== undefined && !ID_REGEX.test(String(params.serviceRequestId))) {
    return "invalid_service_request_id";
  }
  return null;
}

export function validateActorAccess(actor, requiredRoles = []) {
  if (!actor || typeof actor !== "object") return "auth_required";
  if (typeof actor.id !== "string" || !ID_REGEX.test(actor.id)) return "invalid_actor_id";
  if (!Array.isArray(actor.roles)) return "invalid_actor_roles";
  if (requiredRoles.length && !requiredRoles.some((role) => actor.roles.includes(role))) return "forbidden_actor";
  return null;
}

export function businessError(code, message, details = {}) {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

export function eligibilityError(eligibilityReason, correlationId) {
  const reason = validateEligibilityReason(eligibilityReason) ? eligibilityReason : "other_policy_violation";
  return businessError("ELIGIBILITY_FAILED", "Review is not eligible for creation", {
    eligibilityReason: reason,
    correlationId,
  });
}
