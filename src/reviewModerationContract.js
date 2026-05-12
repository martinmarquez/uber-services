export const REVIEW_MODERATION_STATUS = {
  VERIFIED: "verificada",
  UNDER_REVIEW: "en_revision",
  NOT_RECOMMENDED: "no_recomendada",
  REMOVED: "removida",
};

const STATUS_ALIASES = {
  verified: REVIEW_MODERATION_STATUS.VERIFIED,
  under_review: REVIEW_MODERATION_STATUS.UNDER_REVIEW,
  not_recommended: REVIEW_MODERATION_STATUS.NOT_RECOMMENDED,
  removed: REVIEW_MODERATION_STATUS.REMOVED,
};

export const MODERATION_STATUS_UI = {
  [REVIEW_MODERATION_STATUS.VERIFIED]: { label: "Verificada", tone: "ok" },
  [REVIEW_MODERATION_STATUS.UNDER_REVIEW]: { label: "En revision", tone: "warn" },
  [REVIEW_MODERATION_STATUS.NOT_RECOMMENDED]: { label: "No recomendada", tone: "danger" },
  [REVIEW_MODERATION_STATUS.REMOVED]: { label: "Removida", tone: "danger" },
};

export const LOW_CONFIDENCE_RISK_BANDS = {
  publish_with_reduced_weight: { min: 40, max: 69, status: REVIEW_MODERATION_STATUS.VERIFIED },
  hold_for_moderation: { min: 70, max: 84, status: REVIEW_MODERATION_STATUS.NOT_RECOMMENDED },
  quarantine: { min: 85, max: 100, status: REVIEW_MODERATION_STATUS.UNDER_REVIEW },
};

export function statusBadgeFromContract(status) {
  return MODERATION_STATUS_UI[normalizeModerationStatus(status)] ?? { label: "Estado desconocido", tone: "warn" };
}

export function normalizeModerationStatus(status) {
  if (typeof status !== "string") return status;
  return STATUS_ALIASES[status] ?? status;
}

export function deriveModerationStatus({ riskScore }) {
  if (riskScore >= LOW_CONFIDENCE_RISK_BANDS.quarantine.min) return REVIEW_MODERATION_STATUS.UNDER_REVIEW;
  if (riskScore >= LOW_CONFIDENCE_RISK_BANDS.hold_for_moderation.min) return REVIEW_MODERATION_STATUS.NOT_RECOMMENDED;
  return REVIEW_MODERATION_STATUS.VERIFIED;
}

export function isLowConfidenceReview({ riskScore }) {
  return riskScore >= LOW_CONFIDENCE_RISK_BANDS.hold_for_moderation.min;
}
