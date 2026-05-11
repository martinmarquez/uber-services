import http from "node:http";
import { URL } from "node:url";
import { DiscoveryBookingService } from "../domain/discoveryBookingService.js";
import { ReviewService } from "../domain/reviewService.js";
import { routes, validateRouteRequest } from "../api/routes.js";
import { SqliteReviewRepository } from "../db/sqliteReviewRepository.js";
import { runSqliteMigrations } from "../db/runSqliteMigrations.js";
import { resolveActorFromHeaders } from "../security/actorAuth.js";

const DEFAULT_PROVIDERS = [
  {
    userId: "prov-1",
    category: "cleaning",
    city: "Buenos Aires",
    rating: 4.8,
    basePriceArs: 20000,
    distanceKm: 3,
    isActive: true,
  },
];

export function createApiServer(options = {}) {
  const discoveryBookingService = options.discoveryBookingService ?? new DiscoveryBookingService(DEFAULT_PROVIDERS);
  const reviewService = options.reviewService ?? createReviewService(options);
  const actorAuth = resolveActorAuthOptions(options.actorAuth);

  const server = http.createServer(async (req, res) => {
    try {
      await handleRequest(req, res, { discoveryBookingService, reviewService, actorAuth });
    } catch {
      sendJson(res, 500, {
        error: {
          code: "INTERNAL_ERROR",
          message: "Unexpected server error",
          details: {},
        },
      });
    }
  });

  return server;
}

function resolveActorAuthOptions(actorAuth = {}) {
  const secret = actorAuth.secret ?? process.env.ACTOR_SIGNING_SECRET ?? null;
  const enforceSignedActors = actorAuth.enforceSignedActors ?? envFlag(process.env.ACTOR_SIGNING_ENFORCED);

  if (enforceSignedActors && !secret) {
    throw new Error("ACTOR_SIGNING_ENFORCED requires ACTOR_SIGNING_SECRET");
  }

  return {
    ...actorAuth,
    secret,
    enforceSignedActors,
  };
}

function envFlag(value) {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function createReviewService(options) {
  if (options.sqliteDbPath) {
    runSqliteMigrations({ dbPath: options.sqliteDbPath });
    const repository = new SqliteReviewRepository({ filename: options.sqliteDbPath });
    return new ReviewService({ repository });
  }
  return new ReviewService();
}

async function handleRequest(req, res, deps) {
  if (!req.url || !req.method) {
    return sendJson(res, 400, errorPayload("VALIDATION_ERROR", "Malformed request", { code: "invalid_request" }));
  }

  const method = req.method.toUpperCase();
  const url = new URL(req.url, "http://localhost");
  const { actor, errorCode: actorErrorCode } = resolveActorFromHeaders(req.headers, deps.actorAuth);
  if (actorErrorCode) {
    return sendJson(res, 401, errorPayload("AUTHENTICATION_ERROR", "Actor authentication failed", { code: actorErrorCode }));
  }
  const body = await readJsonBody(req);

  const route = findRoute(method, url.pathname);
  if (!route) {
    return sendJson(res, 404, errorPayload("NOT_FOUND", "Route not found", { code: "route_not_found" }));
  }

  const bodyForValidation = normalizeBodyForValidation(route.definition.path, body, route.params);

  const validationError = validateRouteRequest(route.definition, {
    body: bodyForValidation,
    query: Object.fromEntries(url.searchParams.entries()),
    params: route.params,
    actor,
  });

  if (validationError) {
    const status = statusForValidationError(validationError);
    return sendJson(res, status, validationError);
  }

  if (route.definition.path === "/api/v1/providers/discovery") {
    return sendJson(res, 200, deps.discoveryBookingService.discoverProviders(Object.fromEntries(url.searchParams.entries())));
  }

  if (route.definition.path === "/api/v1/service-requests") {
    const result = deps.discoveryBookingService.createServiceRequest({ ...body, actor });
    if (!result.ok) {
      const status = result.code === "rate_limited" ? 429 : 409;
      return sendJson(res, status, errorPayload("BUSINESS_RULE_VIOLATION", "Service request rejected", { code: result.code }));
    }
    return sendJson(res, 201, result);
  }

  if (route.definition.path === "/api/v1/service-requests/:serviceRequestId") {
    const result = deps.discoveryBookingService.getServiceRequestStatus({
      serviceRequestId: route.params.serviceRequestId,
      actor,
    });
    if (!result.ok) {
      const status = result.code === "not_found" ? 404 : 403;
      return sendJson(res, status, errorPayload("BUSINESS_RULE_VIOLATION", "Service request access rejected", { code: result.code }));
    }
    return sendJson(res, 200, result);
  }

  if (route.definition.path === "/api/v1/service-requests/:serviceRequestId/reviews") {
    const ownershipCheck = assertReviewOwnership({
      discoveryBookingService: deps.discoveryBookingService,
      actor,
      serviceRequestId: route.params.serviceRequestId,
      providerUserId: body.providerUserId,
    });

    if (ownershipCheck.error) {
      return sendJson(res, ownershipCheck.status, ownershipCheck.error);
    }

    const result = deps.reviewService.createReview({
      idempotencyKey: body.idempotencyKey,
      serviceRequestId: route.params.serviceRequestId,
      reviewerUserId: actor?.id,
      reviewerMatchesParticipant: ownershipCheck.request.customerUserId === actor?.id,
      providerUserId: ownershipCheck.request.providerUserId,
      rating: body.rating,
      comment: body.comment,
      serviceCompletedAt: ownershipCheck.request.completedAt,
      now: body.now,
      correlationId: body.correlationId,
    });

    if (!result.ok) {
      return sendJson(res, 409, errorPayload("BUSINESS_RULE_VIOLATION", "Review could not be created", {
        code: result.eligibilityReason || result.code,
        correlationId: result.correlationId,
      }));
    }

    return sendJson(res, 201, result);
  }

  if (route.definition.path === "/api/reviews") {
    const serviceRequestId = body.serviceRequestId ?? body.serviceId;
    const providerUserId = body.providerUserId ?? body.providerId;
    const ownershipCheck = assertReviewOwnership({
      discoveryBookingService: deps.discoveryBookingService,
      actor,
      serviceRequestId,
      providerUserId,
    });

    if (ownershipCheck.error) {
      return sendJson(res, ownershipCheck.status, ownershipCheck.error);
    }

    const result = deps.reviewService.createReview({
      idempotencyKey: body.idempotencyKey,
      serviceRequestId,
      reviewerUserId: actor?.id,
      reviewerMatchesParticipant: ownershipCheck.request.customerUserId === actor?.id,
      providerUserId: ownershipCheck.request.providerUserId,
      rating: body.rating,
      comment: body.comment,
      serviceCompletedAt: ownershipCheck.request.completedAt,
      now: body.now,
      correlationId: body.correlationId,
    });

    if (!result.ok) {
      return sendJson(res, 409, errorPayload("BUSINESS_RULE_VIOLATION", "Review could not be created", {
        code: result.eligibilityReason || result.code,
        correlationId: result.correlationId,
      }));
    }

    return sendJson(res, 201, result);
  }

  if (route.definition.path === "/api/v1/providers/:providerId/reviews") {
    const list = deps.reviewService.listProviderReviews({
      providerUserId: route.params.providerId,
      limit: url.searchParams.get("limit") ?? 20,
    });
    return sendJson(res, 200, list);
  }

  if (route.definition.path === "/api/v1/reviews/:reviewId") {
    const result = deps.reviewService.editReview({
      reviewId: route.params.reviewId,
      actor,
      rating: body.rating,
      comment: body.comment,
      now: body.now,
      correlationId: body.correlationId,
    });

    if (!result.ok) {
      return sendJson(res, result.code === "not_found" ? 404 : 409, errorPayload("BUSINESS_RULE_VIOLATION", "Review edit rejected", { code: result.code }));
    }

    return sendJson(res, 200, result);
  }

  if (route.definition.path === "/api/v1/reviews/:reviewId/reports") {
    const result = deps.reviewService.reportReview({
      idempotencyKey: body.idempotencyKey,
      reviewId: route.params.reviewId,
      reasonCode: body.reasonCode,
      description: body.description,
      actor,
      now: body.now,
      correlationId: body.correlationId,
    });
    if (!result.ok) {
      const status = statusForReportFailure(result.code);
      const code = result.code === "idempotency_key_conflict" ? "CONFLICT" : "BUSINESS_RULE_VIOLATION";
      return sendJson(res, status, errorPayload(code, "Review report rejected", { code: result.code }));
    }
    return sendJson(res, 202, { ok: true, report: result.report, status: result.review.status });
  }

  if (route.definition.path === "/api/v1/reviews/:reviewId/response") {
    const result = deps.reviewService.respondToReview({
      reviewId: route.params.reviewId,
      actor,
      message: body.message,
      idempotencyKey: body.idempotencyKey,
      correlationId: body.correlationId,
      now: body.now,
    });
    if (!result.ok) {
      const status = statusForResponseFailure(result.code);
      return sendJson(res, status, errorPayload("BUSINESS_RULE_VIOLATION", "Review response rejected", { code: result.code }));
    }
    return sendJson(res, 202, result);
  }

  if (route.definition.path === "/api/v1/reviews/:reviewId/appeals") {
    const result = deps.reviewService.openAppeal({
      reviewId: route.params.reviewId,
      actor,
      note: body.note,
      resume: body.resume,
      idempotencyKey: body.idempotencyKey,
      correlationId: body.correlationId,
      now: body.now,
    });
    if (!result.ok) {
      const status = statusForAppealFailure(result.code);
      return sendJson(res, status, errorPayload("BUSINESS_RULE_VIOLATION", "Review appeal rejected", { code: result.code }));
    }
    return sendJson(res, 202, result);
  }

  if (route.definition.path === "/api/v1/reviews/:reviewId/moderation") {
    const result = deps.reviewService.transitionModeration({
      idempotencyKey: body.idempotencyKey,
      reviewId: route.params.reviewId,
      toStatus: body.toStatus,
      decision: body.decision,
      actor,
      now: body.now,
      correlationId: body.correlationId,
    });

    if (!result.ok) {
      if (result.code === "forbidden_transition") {
        return sendJson(res, 409, errorPayload("INVALID_STATE_TRANSITION", "Review moderation rejected", { code: result.code }));
      }
      return sendJson(res, result.code === "not_found" ? 404 : 409, errorPayload("BUSINESS_RULE_VIOLATION", "Review moderation rejected", { code: result.code }));
    }

    return sendJson(res, 200, result);
  }

  return sendJson(res, 404, errorPayload("NOT_FOUND", "Route not found", { code: "route_not_found" }));
}

function findRoute(method, path) {
  const aliases = normalizePath(path);
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = matchPath(route.path, aliases);
    if (match) return { definition: route, params: match };
  }
  return null;
}

function normalizePath(path) {
  if (path.startsWith("/api/reviews/") && path.endsWith("/reports")) {
    return `/api/v1/reviews/${path.split("/")[3]}/reports`;
  }
  return path;
}

function normalizeBodyForValidation(path, body, params) {
  if (path === "/api/v1/service-requests/:serviceRequestId/reviews") {
    return { ...body, serviceRequestId: params.serviceRequestId };
  }

  if (path === "/api/reviews") {
    return {
      ...body,
      serviceRequestId: body.serviceRequestId ?? body.serviceId,
      providerUserId: body.providerUserId ?? body.providerId,
    };
  }

  return body;
}

function statusForValidationError(validationError) {
  if (validationError?.error?.code !== "AUTHORIZATION_ERROR") return 400;
  const detailCode = validationError.error?.details?.code;
  if (detailCode === "unauthenticated") return 401;
  return 403;
}

function statusForReportFailure(code) {
  if (code === "not_found") return 404;
  if (code === "unauthenticated") return 401;
  if (code === "idempotency_key_required" || code === "reason_code_required") return 400;
  return 409;
}

function statusForResponseFailure(code) {
  if (code === "not_found") return 404;
  if (code === "invalid_response_message") return 400;
  if (code === "not_review_target" || code === "review_not_respondable") return 403;
  return 409;
}

function statusForAppealFailure(code) {
  if (code === "not_found") return 404;
  if (code === "unauthenticated") return 401;
  if (code === "forbidden_actor") return 403;
  if (code === "idempotency_key_required" || code === "appeal_note_too_short" || code === "invalid_resume_flag") return 400;
  return 409;
}

function assertReviewOwnership({ discoveryBookingService, actor, serviceRequestId, providerUserId }) {
  const request = discoveryBookingService.getServiceRequestById(serviceRequestId);
  if (!request) {
    return {
      status: 404,
      error: errorPayload("BUSINESS_RULE_VIOLATION", "Review ownership check failed", { code: "not_found" }),
    };
  }

  if (!actor?.id || request.customerUserId !== actor.id) {
    return {
      status: 403,
      error: errorPayload("AUTHORIZATION_ERROR", "Actor is not allowed to perform this action", { code: "forbidden_actor" }),
    };
  }

  if (request.status !== "completed" || !request.completedAt) {
    return {
      status: 409,
      error: errorPayload("BUSINESS_RULE_VIOLATION", "Review ownership check failed", { code: "service_not_completed" }),
    };
  }

  if (providerUserId && request.providerUserId !== providerUserId) {
    return {
      status: 409,
      error: errorPayload("BUSINESS_RULE_VIOLATION", "Review ownership check failed", { code: "provider_mismatch" }),
    };
  }

  return { status: 200, error: null, request };
}

function matchPath(pattern, actual) {
  const patternSegments = pattern.split("/").filter(Boolean);
  const actualSegments = actual.split("/").filter(Boolean);
  if (patternSegments.length !== actualSegments.length) return null;
  const params = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    const expected = patternSegments[i];
    const received = actualSegments[i];
    if (expected.startsWith(":")) {
      params[expected.slice(1)] = decodeURIComponent(received);
      continue;
    }
    if (expected !== received) return null;
  }
  return params;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("content-length", Buffer.byteLength(body));
  res.end(body);
}

function errorPayload(code, message, details) {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}
