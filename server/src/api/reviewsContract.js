const { validateEligibilityReason } = require("../domain/reviewRules");

function validateCreateReviewPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (!payload.serviceRequestId) return "service_request_id_required";
  if (!payload.providerUserId) return "provider_user_id_required";
  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) return "rating_out_of_range";
  if (payload.comment && String(payload.comment).length > 2000) return "comment_too_long";
  return null;
}

function validatePatchReviewPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (payload.rating !== undefined) {
    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      return "rating_out_of_range";
    }
  }
  if (payload.comment !== undefined && String(payload.comment).length > 2000) return "comment_too_long";
  return null;
}

function businessError(code, message, details = {}) {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

function eligibilityError(eligibilityReason, correlationId) {
  const reason = validateEligibilityReason(eligibilityReason) ? eligibilityReason : "other_policy_violation";
  return businessError("ELIGIBILITY_FAILED", "Review is not eligible for creation", {
    eligibilityReason: reason,
    correlationId,
  });
}

module.exports = {
  validateCreateReviewPayload,
  validatePatchReviewPayload,
  businessError,
  eligibilityError,
};
