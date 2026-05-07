import {
  validateCreateReviewPayload,
  validatePatchReviewPayload,
  businessError as reviewBusinessError,
} from "./reviewsContract.js";
import {
  validateDiscoveryQuery,
  validateCreateServiceRequestPayload,
  businessError as marketplaceBusinessError,
} from "./discoveryBookingContract.js";

export const routes = [
  {
    method: "GET",
    path: "/api/v1/providers/discovery",
    validateQuery: validateDiscoveryQuery,
  },
  {
    method: "POST",
    path: "/api/v1/service-requests",
    validateBody: validateCreateServiceRequestPayload,
  },
  {
    method: "POST",
    path: "/api/v1/service-requests/:serviceRequestId/reviews",
    validateBody: validateCreateReviewPayload,
  },
  {
    method: "GET",
    path: "/api/v1/providers/:providerId/reviews",
  },
  {
    method: "PATCH",
    path: "/api/v1/reviews/:reviewId",
    validateBody: validatePatchReviewPayload,
  },
  {
    method: "POST",
    path: "/api/v1/reviews/:reviewId/reports",
    validateBody: (body) => (!body?.reasonCode ? "reason_code_required" : null),
  },
  {
    method: "POST",
    path: "/api/v1/reviews/:reviewId/appeals",
    validateBody: (body) => (!body?.note ? "appeal_note_required" : null),
  },
  {
    method: "POST",
    path: "/api/v1/reviews/:reviewId/moderation",
    validateBody: (body) => (!body?.toStatus ? "to_status_required" : null),
  },
];

export function validateRouteRequest(route, payloadOrReq = {}, maybeCtx = {}) {
  const normalized = normalizeRequest(payloadOrReq, maybeCtx);
  const { body, query, params, actor } = normalized;

  if (route.path.includes(":reviewId")) {
    if (!isValidReviewId(params?.reviewId)) {
      return reviewBusinessError("VALIDATION_ERROR", "Route params are invalid", { code: "invalid_review_id" });
    }
  }

  if (route.path.endsWith("/moderation") && !canModerate(actor)) {
    return reviewBusinessError("AUTHORIZATION_ERROR", "Actor is not allowed to perform this action", {
      code: "forbidden_actor",
    });
  }

  if (route.path.endsWith("/appeals") && !isAuthenticated(actor)) {
    return reviewBusinessError("AUTHORIZATION_ERROR", "Actor is not allowed to perform this action", {
      code: "unauthenticated",
    });
  }

  if (route.validateBody) {
    const code = route.validateBody(body);
    if (code) {
      const errFactory = route.path.includes("/reviews") ? reviewBusinessError : marketplaceBusinessError;
      return errFactory("VALIDATION_ERROR", "Request payload is invalid", { code });
    }
  }

  if (route.validateQuery) {
    const code = route.validateQuery(query);
    if (code) {
      return marketplaceBusinessError("VALIDATION_ERROR", "Request query is invalid", { code });
    }
  }

  return null;
}

function normalizeRequest(payloadOrReq, maybeCtx) {
  if (
    payloadOrReq
    && typeof payloadOrReq === "object"
    && (Object.hasOwn(payloadOrReq, "body")
      || Object.hasOwn(payloadOrReq, "query")
      || Object.hasOwn(payloadOrReq, "params")
      || Object.hasOwn(payloadOrReq, "actor"))
  ) {
    return {
      body: payloadOrReq.body,
      query: payloadOrReq.query,
      params: payloadOrReq.params,
      actor: payloadOrReq.actor,
    };
  }

  return {
    body: payloadOrReq,
    query: maybeCtx.query,
    params: maybeCtx.params,
    actor: maybeCtx.actor,
  };
}

function isValidReviewId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{6,64}$/.test(value);
}

function canModerate(actor) {
  if (!actor || typeof actor !== "object") return false;
  if (!actor.id || !Array.isArray(actor.roles)) return false;
  return actor.roles.includes("moderator");
}

function isAuthenticated(actor) {
  return Boolean(actor && typeof actor === "object" && actor.id);
}
