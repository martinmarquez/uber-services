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
    method: "GET",
    path: "/api/v1/service-requests/:serviceRequestId",
  },
  {
    method: "GET",
    path: "/api/v1/providers/:providerId/reviews",
  },
  {
    method: "POST",
    path: "/api/v1/service-requests/:serviceRequestId/reviews",
    validateBody: validateCreateReviewPayload,
  },
  {
    method: "POST",
    path: "/api/reviews",
    validateBody: validateCreateReviewPayload,
  },
  {
    method: "PATCH",
    path: "/api/v1/reviews/:reviewId",
    validateBody: validatePatchReviewPayload,
  },
  {
    method: "POST",
    path: "/api/v1/reviews/:reviewId/moderation",
    validateBody: (body) => {
      const allowedStatuses = new Set(["en_revision", "no_recomendada", "removida", "verificada"]);
      return allowedStatuses.has(body?.toStatus) ? null : "invalid_to_status";
    },
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
];

export function validateRouteRequest(route, payloadOrReq = {}, maybeCtx = {}) {
  const normalized = normalizeRequest(payloadOrReq, maybeCtx);
  const { body, query, params, actor } = normalized;

  if (route.path.includes(":reviewId")) {
    if (!isValidReviewId(params?.reviewId)) {
      return reviewBusinessError("VALIDATION_ERROR", "Route params are invalid", { code: "invalid_review_id" });
    }
  }

  if (route.path.includes(":serviceRequestId")) {
    if (!isValidServiceRequestId(params?.serviceRequestId)) {
      return marketplaceBusinessError("VALIDATION_ERROR", "Route params are invalid", { code: "invalid_service_request_id" });
    }
  }

  if (route.path === "/api/v1/service-requests" && !isCustomer(actor)) {
    return marketplaceBusinessError("AUTHORIZATION_ERROR", "Actor is not allowed to perform this action", {
      code: "forbidden_actor",
    });
  }

  if (
    (route.path === "/api/v1/service-requests/:serviceRequestId/reviews" || route.path === "/api/reviews")
    && !isCustomer(actor)
  ) {
    return reviewBusinessError("AUTHORIZATION_ERROR", "Actor is not allowed to perform this action", {
      code: "forbidden_actor",
    });
  }

  if ((route.path.endsWith("/appeals") || route.path.endsWith("/moderation")) && !canModerate(actor)) {
    return reviewBusinessError("AUTHORIZATION_ERROR", "Actor is not allowed to perform this action", {
      code: "forbidden_actor",
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

function isValidServiceRequestId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{6,64}$/.test(value);
}

function canModerate(actor) {
  if (!actor || typeof actor !== "object") return false;
  if (!actor.id || !Array.isArray(actor.roles)) return false;
  return actor.roles.includes("moderator");
}

function isCustomer(actor) {
  if (!actor || typeof actor !== "object") return false;
  if (!actor.id || !Array.isArray(actor.roles)) return false;
  return actor.roles.includes("customer");
}
