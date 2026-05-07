import crypto from "node:crypto";
import {
  isEligibleForReview,
  isTransitionAllowed,
  validateModerationDecision,
} from "./reviewRules.js";

export class ReviewService {
  constructor() {
    this.reviews = new Map();
    this.reviewByPair = new Map();
    this.events = [];
    this.idempotencyIndex = new Map();
    this.velocityWindowByUser = new Map();
  }

  createReview(input) {
    const correlationId = input.correlationId || randomId("corr");
    const replay = this.idempotencyIndex.get(input.idempotencyKey);
    if (replay) return { replay: true, ...replay };

    const rateLimited = this.hitVelocityWindow(input.reviewerUserId, input.now);
    const eligibility = isEligibleForReview({
      serviceCompletedAt: input.serviceCompletedAt,
      reviewerMatchesParticipant: input.reviewerMatchesParticipant,
      alreadyReviewed: this.reviewByPair.has(pairKey(input.serviceRequestId, input.reviewerUserId)),
      rateLimited,
      now: input.now,
    });

    this.emitEvent({
      reviewId: null,
      eventName: "review_eligibility_checked.v1",
      correlationId,
      idempotencyKey: input.idempotencyKey,
      actorType: "system",
      actorId: "eligibility-service",
      payload: { serviceRequestId: input.serviceRequestId, reviewerUserId: input.reviewerUserId },
    });

    if (!eligibility.eligible) {
      this.emitEvent({
        reviewId: null,
        eventName: "review_eligibility_failed.v1",
        correlationId,
        idempotencyKey: input.idempotencyKey,
        actorType: "system",
        actorId: "eligibility-service",
        payload: { reason: eligibility.reason },
      });
      return this.cacheIdempotent(input.idempotencyKey, {
        ok: false,
        eligibilityReason: eligibility.reason,
        correlationId,
      });
    }

    const review = {
      id: randomId("rev"),
      serviceRequestId: input.serviceRequestId,
      reviewerUserId: input.reviewerUserId,
      providerUserId: input.providerUserId,
      rating: input.rating,
      comment: input.comment ?? null,
      status: "verificada",
      riskScore: Number(input.riskScore ?? 0),
      createdAt: input.now ?? new Date().toISOString(),
      updatedAt: input.now ?? new Date().toISOString(),
    };
    this.reviews.set(review.id, review);
    this.reviewByPair.set(pairKey(input.serviceRequestId, input.reviewerUserId), review.id);

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_created.v1",
      correlationId,
      idempotencyKey: input.idempotencyKey,
      actorType: "user",
      actorId: input.reviewerUserId,
      payload: {
        rating: review.rating,
        status: review.status,
        riskScore: review.riskScore,
      },
    });

    return this.cacheIdempotent(input.idempotencyKey, { ok: true, review, correlationId });
  }

  transitionModeration(input) {
    const review = this.reviews.get(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (!isTransitionAllowed(review.status, input.toStatus)) return { ok: false, code: "forbidden_transition" };

    const decisionError = validateModerationDecision(input.decision);
    if (decisionError) return { ok: false, code: decisionError };

    review.status = input.toStatus;
    review.updatedAt = input.now ?? new Date().toISOString();

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_moderation_decided.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey || randomId("idem"),
      actorType: "moderator",
      actorId: input.decision.moderatorId,
      payload: {
        reasonCode: input.decision.reasonCode,
        severity: input.decision.severity,
        decisionNote: input.decision.decisionNote,
        toStatus: input.toStatus,
      },
    });

    return { ok: true, review };
  }

  getEvents() {
    return this.events.slice();
  }

  cacheIdempotent(key, result) {
    this.idempotencyIndex.set(key, result);
    return result;
  }

  hitVelocityWindow(userId, nowValue) {
    const now = new Date(nowValue ?? Date.now()).getTime();
    const windowMs = 60 * 1000;
    const maxPerMinute = 5;
    const list = this.velocityWindowByUser.get(userId) ?? [];
    const next = list.filter((ts) => now - ts <= windowMs);
    next.push(now);
    this.velocityWindowByUser.set(userId, next);
    return next.length > maxPerMinute;
  }

  emitEvent({ reviewId, eventName, correlationId, idempotencyKey, actorType, actorId, payload }) {
    const envelope = {
      eventId: randomId("evt"),
      reviewId,
      eventName,
      eventVersion: "v1",
      occurredAt: new Date().toISOString(),
      correlationId,
      idempotencyKey,
      actor: { type: actorType, id: actorId },
      payload,
    };
    const integrityHash = crypto.createHash("sha256").update(JSON.stringify(envelope)).digest("hex");
    this.events.push({ ...envelope, integrityHash });
  }
}

function pairKey(serviceRequestId, reviewerUserId) {
  return `${serviceRequestId}:${reviewerUserId}`;
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}
