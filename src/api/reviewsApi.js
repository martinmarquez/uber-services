const DEFAULT_API_BASE = "/api";
const REQUEST_TIMEOUT_MS = 8000;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVIEW_ID_REGEX = /^(rev|review)_[a-z0-9_-]{6,64}$/i;
const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 50;

function resolveApiBaseUrl() {
  if (typeof window !== "undefined" && window.__RATINGS_API_BASE_URL__) {
    return window.__RATINGS_API_BASE_URL__;
  }

  const envBase = typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_RATINGS_API_BASE_URL ?? import.meta.env?.VITE_API_BASE_URL
    : undefined;
  return envBase || DEFAULT_API_BASE;
}

function resolveActorHeaders() {
  const actorId = typeof import.meta !== "undefined" ? import.meta.env?.VITE_RATINGS_ACTOR_ID : undefined;
  const actorRoles = typeof import.meta !== "undefined" ? import.meta.env?.VITE_RATINGS_ACTOR_ROLES : undefined;

  return {
    "X-Actor-Id": actorId || "cus-1",
    "X-Actor-Roles": actorRoles || "customer",
  };
}

function generateRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  throw new Error("crypto_unavailable_for_request_id");
}

function assertApiPath(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.includes("..")) {
    throw new Error("invalid_api_path");
  }
}

function normalizeLimit(limit) {
  if (limit == null || limit === "") return DEFAULT_LIST_LIMIT;
  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIST_LIMIT) {
    throw new Error("invalid_reviews_limit");
  }
  return parsed;
}

function buildListQuery({ limit } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(normalizeLimit(limit)));
  return params.toString();
}

class ReviewsApiError extends Error {
  constructor(status, envelope) {
    const topCode = envelope?.error?.code ?? `reviews_api_error:${status}`;
    super(topCode);
    this.name = "ReviewsApiError";
    this.status = status;
    this.errorCode = envelope?.error?.code ?? null;
    this.detailsCode = envelope?.error?.details?.code ?? null;
    this.envelope = envelope ?? null;
  }
}

function sanitizeAndValidatePayload(body) {
  if (body == null) return undefined;
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new Error("invalid_payload_type");
  }

  const clean = {};
  for (const [key, value] of Object.entries(body)) {
    if (value == null) continue;
    if (typeof value === "string") {
      clean[key] = value.trim();
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
      continue;
    }
    throw new Error(`invalid_payload_field:${key}`);
  }

  return clean;
}

function assertReviewId(reviewId) {
  if (typeof reviewId !== "string") {
    throw new Error("invalid_review_id_type");
  }

  const candidate = reviewId.trim();
  if (!(UUID_V4_REGEX.test(candidate) || REVIEW_ID_REGEX.test(candidate))) {
    throw new Error("invalid_review_id_format");
  }

  return candidate;
}

async function requestJson(path, { method = "GET", body } = {}) {
  assertApiPath(path);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const baseUrl = resolveApiBaseUrl().replace(/\/$/, "");

  try {
    const sanitizedBody = sanitizeAndValidatePayload(body);
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": generateRequestId(),
        ...resolveActorHeaders(),
      },
      body: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined,
      signal: controller.signal,
    });

    let parsedJson = null;
    const isNoContent = response.status === 204;
    if (!isNoContent) {
      try {
        parsedJson = await response.json();
      } catch (_error) {
        parsedJson = null;
      }
    }

    if (!response.ok) {
      throw new ReviewsApiError(response.status, parsedJson);
    }

    if (isNoContent) return null;
    return parsedJson;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchReviews({ providerId, serviceId, limit } = {}) {
  const resolvedProviderId = String(providerId ?? serviceId ?? "").trim();
  if (!resolvedProviderId) {
    return { ok: true, items: [] };
  }
  const query = buildListQuery({ limit });
  return requestJson(`/v1/providers/${encodeURIComponent(resolvedProviderId)}/reviews?${query}`);
}

export async function createReview(payload) {
  const resolvedServiceRequestId = String(payload?.serviceRequestId ?? payload?.serviceId ?? "").trim();
  if (!resolvedServiceRequestId) {
    throw new Error("service_request_id_required");
  }

  const canonicalPayload = {
    providerUserId: payload?.providerUserId ?? payload?.providerId,
    rating: payload?.rating,
    comment: payload?.comment,
    idempotencyKey: payload?.idempotencyKey,
    serviceCompletedAt: payload?.serviceCompletedAt,
    now: payload?.now,
    correlationId: payload?.correlationId,
  };
  return requestJson(`/v1/service-requests/${encodeURIComponent(resolvedServiceRequestId)}/reviews`, {
    method: "POST",
    body: canonicalPayload,
  });
}

export async function reportReview(reviewId, payload) {
  const safeReviewId = encodeURIComponent(assertReviewId(reviewId));
  return requestJson(`/v1/reviews/${safeReviewId}/reports`, { method: "POST", body: payload });
}

export async function respondToReview(reviewId, payload) {
  const safeReviewId = encodeURIComponent(assertReviewId(reviewId));
  return requestJson(`/v1/reviews/${safeReviewId}/response`, { method: "POST", body: payload });
}

export async function editReview(reviewId, payload) {
  const safeReviewId = encodeURIComponent(assertReviewId(reviewId));
  return requestJson(`/v1/reviews/${safeReviewId}`, { method: "PATCH", body: payload });
}

export async function appealReview(reviewId, payload) {
  const safeReviewId = encodeURIComponent(assertReviewId(reviewId));
  return requestJson(`/v1/reviews/${safeReviewId}/appeals`, { method: "POST", body: payload });
}
