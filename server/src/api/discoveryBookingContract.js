const ALLOWED_CATEGORIES = new Set([
  "cleaning",
  "plumbing",
  "electrician",
  "moving",
  "mechanic",
]);

const ALLOWED_SORT = new Set(["rating_desc", "distance_asc", "price_asc"]);

export function validateDiscoveryQuery(query) {
  if (!query || typeof query !== "object") return "invalid_query";

  if (!query.category || !ALLOWED_CATEGORIES.has(query.category)) {
    return "invalid_category";
  }

  if (!query.city || typeof query.city !== "string" || query.city.trim().length < 2) {
    return "invalid_city";
  }

  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) return "invalid_limit";
  }

  if (query.sort !== undefined && !ALLOWED_SORT.has(query.sort)) return "invalid_sort";

  return null;
}

export function validateCreateServiceRequestPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (!payload.idempotencyKey || typeof payload.idempotencyKey !== "string") return "idempotency_key_required";
  if (!payload.providerUserId || typeof payload.providerUserId !== "string") return "provider_user_id_required";
  if (!payload.category || !ALLOWED_CATEGORIES.has(payload.category)) return "invalid_category";
  if (!payload.city || typeof payload.city !== "string" || payload.city.trim().length < 2) return "invalid_city";
  if (!payload.scheduledAt || Number.isNaN(new Date(payload.scheduledAt).getTime())) return "invalid_scheduled_at";
  if (!payload.notes || typeof payload.notes !== "string" || payload.notes.trim().length < 8) return "invalid_notes";
  if (payload.notes.length > 1000) return "notes_too_long";
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
