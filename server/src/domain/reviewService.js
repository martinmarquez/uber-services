import crypto from "node:crypto";
import {
  isEligibleForReview,
  isTransitionAllowed,
  validateModerationDecision,
} from "./reviewRules.js";
import { defaultEventSigner } from "../security/eventIntegrity.js";

const RECENCY_HALF_LIFE_DAYS = 120;
const RECENCY_LAMBDA = Math.log(2) / RECENCY_HALF_LIFE_DAYS;
const DEFAULT_THRESHOLD_VERSION = "anti_gaming_v1_2026-05-10";

export class ReviewService {
  constructor(options = {}) {
    this.reviews = new Map();
    this.reviewByPair = new Map();
    this.events = [];
    this.idempotencyIndex = new Map();
    this.velocityWindowByUser = new Map();
    this.lastEventHash = null;
    this.idempotencyTtlMs = options.idempotencyTtlMs ?? 24 * 60 * 60 * 1000;
    this.velocityWindowMs = options.velocityWindowMs ?? 60 * 1000;
    this.velocityMaxPerWindow = options.velocityMaxPerWindow ?? 5;
    this.eventSigner = options.eventSigner ?? defaultEventSigner();
    this.repository = options.repository ?? null;
    this.responses = new Map();
    this.appeals = new Map();
    this.appealIdsByReview = new Map();
    this.appealReopenCooldownMs = options.appealReopenCooldownMs ?? 24 * 60 * 60 * 1000;
    this.thresholdVersion = options.thresholdVersion ?? DEFAULT_THRESHOLD_VERSION;
    this.s6PartialAlertThreshold = Number(options.s6PartialAlertThreshold) > 1
      ? Math.floor(Number(options.s6PartialAlertThreshold))
      : 2;
    this.s6PartialStreakByReview = new Map();
  }

  createReview(input) {
    if (!isValidIdempotencyKey(input?.idempotencyKey)) return { ok: false, code: "idempotency_key_required" };

    const correlationId = input.correlationId || randomId("corr");
    const replay = this.getIdempotent(input.idempotencyKey);
    if (replay) return { replay: true, ...replay };

    const rateLimited = this.hitVelocityWindow(input.reviewerUserId, input.now);
    const eligibility = isEligibleForReview({
      serviceCompletedAt: input.serviceCompletedAt,
      reviewerMatchesParticipant: input.reviewerMatchesParticipant,
      alreadyReviewed: this.hasReviewPair(input.serviceRequestId, input.reviewerUserId),
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
      // Risk score must come from trusted server-side pipeline, never directly from client payload.
      riskScore: 0,
      createdAt: input.now ?? new Date().toISOString(),
      updatedAt: input.now ?? new Date().toISOString(),
    };
    this.persistReview(review);
    this.recomputeProviderAggregate(review.providerUserId);
    const scoreInputs = buildScoreInputs({
      rating: review.rating,
      serviceCompletedAt: input.serviceCompletedAt,
      now: input.now,
      riskScore: review.riskScore,
      velocityCount: this.currentVelocityCount(input.reviewerUserId),
      velocityLimit: this.velocityMaxPerWindow,
    });

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
        scoreInputs,
        fraudHeuristics: buildFraudHeuristics({
          reviewId: review.id,
          riskScore: review.riskScore,
          velocityCount: scoreInputs.velocityCount,
          velocityLimit: this.velocityMaxPerWindow,
          sourceAvailability: input.sourceAvailability,
          thresholdVersion: this.thresholdVersion,
          s6PartialAlertThreshold: this.s6PartialAlertThreshold,
          s6PartialStreakByReview: this.s6PartialStreakByReview,
        }),
      },
    });

    return this.cacheIdempotent(input.idempotencyKey, { ok: true, review, correlationId });
  }

  transitionModeration(input) {
    if (!isValidIdempotencyKey(input?.idempotencyKey)) return { ok: false, code: "idempotency_key_required" };
    if (!canModerate(input?.actor)) return { ok: false, code: "forbidden_actor" };
    const replay = this.getIdempotent(input.idempotencyKey);
    if (replay) return { replay: true, ...replay };

    const review = this.getReviewById(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (!isTransitionAllowed(review.status, input.toStatus)) return { ok: false, code: "forbidden_transition" };

    const decisionError = validateModerationDecision(input.decision);
    if (decisionError) return { ok: false, code: decisionError };

    review.status = input.toStatus;
    review.updatedAt = input.now ?? new Date().toISOString();
    this.recomputeProviderAggregate(review.providerUserId);
    if (input.decision?.reasonCode && input.toStatus !== "verificada") {
      this.persistReviewTag({
        reviewId: review.id,
        tag: normalizeTag(input.decision.reasonCode),
        source: "moderator",
        createdAt: review.updatedAt,
      });
    }

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_moderation_decided.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey,
      actorType: "moderator",
      actorId: input.actor.id,
      payload: {
        reasonCode: input.decision.reasonCode,
        severity: input.decision.severity,
        decisionNote: input.decision.decisionNote,
        toStatus: input.toStatus,
        moderationOutcome: buildModerationOutcome({
          toStatus: input.toStatus,
          reasonCode: input.decision.reasonCode,
          severity: input.decision.severity,
        }),
        fraudHeuristics: buildFraudHeuristics({
          reviewId: review.id,
          riskScore: review.riskScore,
          velocityCount: this.currentVelocityCount(review.reviewerUserId),
          velocityLimit: this.velocityMaxPerWindow,
          reasonCode: input.decision.reasonCode,
          sourceAvailability: input.decision?.sourceAvailability ?? input.sourceAvailability,
          thresholdVersion: this.thresholdVersion,
          s6PartialAlertThreshold: this.s6PartialAlertThreshold,
          s6PartialStreakByReview: this.s6PartialStreakByReview,
        }),
      },
    });

    if (input.toStatus === "removida") {
      this.emitEvent({
        reviewId: review.id,
        eventName: "review_removed.v1",
        correlationId: input.correlationId || randomId("corr"),
        idempotencyKey: `${input.idempotencyKey}:removed`,
        actorType: "moderator",
        actorId: input.actor.id,
        payload: { reasonCode: input.decision.reasonCode, severity: input.decision.severity },
      });
    }

    if (input.toStatus === "verificada") {
      this.emitEvent({
        reviewId: review.id,
        eventName: "review_published.v1",
        correlationId: input.correlationId || randomId("corr"),
        idempotencyKey: `${input.idempotencyKey}:published`,
        actorType: "moderator",
        actorId: input.actor.id,
        payload: { source: "moderation_decision" },
      });
    }

    return this.cacheIdempotent(input.idempotencyKey, { ok: true, review });
  }

  openAppeal(input) {
    if (!isValidIdempotencyKey(input?.idempotencyKey)) return { ok: false, code: "idempotency_key_required" };
    const replay = this.getIdempotent(input.idempotencyKey);
    if (replay) return { replay: true, ...replay };
    const review = this.getReviewById(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (!input?.actor?.id) return { ok: false, code: "unauthenticated" };
    if (review.reviewerUserId !== input.actor.id) return { ok: false, code: "forbidden_actor" };
    if (!input?.note || String(input.note).trim().length < 10) return { ok: false, code: "appeal_note_too_short" };
    const existingOpen = this.findOpenAppealByReviewId(input.reviewId);
    if (existingOpen) return { ok: false, code: "appeal_already_open" };
    const latestClosed = this.findLatestClosedAppealByReviewId(input.reviewId);
    if (latestClosed && input.resume !== true) return { ok: false, code: "appeal_resume_required" };
    if (latestClosed && this.inAppealCooldown(latestClosed.closedAt, input.now)) return { ok: false, code: "appeal_cooldown_active" };

    const appeal = {
      id: randomId("apl"),
      reviewId: input.reviewId,
      actorId: input.actor.id,
      note: input.note,
      status: "open",
      createdAt: input.now ?? new Date().toISOString(),
      closedAt: null,
    };
    try {
      this.persistAppeal(appeal, {
        resume: input.resume === true,
        now: appeal.createdAt,
        appealReopenCooldownMs: this.appealReopenCooldownMs,
      });
    } catch (error) {
      if (isAppealConstraintViolation(error, "appeal_already_open")) return { ok: false, code: "appeal_already_open" };
      if (isAppealConstraintViolation(error, "appeal_resume_required")) return { ok: false, code: "appeal_resume_required" };
      if (isAppealConstraintViolation(error, "appeal_cooldown_active")) return { ok: false, code: "appeal_cooldown_active" };
      throw error;
    }

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_appeal_opened.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey,
      actorType: "user",
      actorId: input.actor.id,
      payload: { appealId: appeal.id, note: appeal.note },
    });

    return this.cacheIdempotent(input.idempotencyKey, { ok: true, appeal });
  }

  closeAppeal(input) {
    if (!isValidIdempotencyKey(input?.idempotencyKey)) return { ok: false, code: "idempotency_key_required" };
    const replay = this.getIdempotent(input.idempotencyKey);
    if (replay) return { replay: true, ...replay };
    const review = this.getReviewById(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (!canModerate(input?.actor)) return { ok: false, code: "forbidden_actor" };
    if (!input?.appealId) return { ok: false, code: "appeal_id_required" };
    if (!input?.resolution || !["accepted", "rejected"].includes(input.resolution)) return { ok: false, code: "appeal_resolution_invalid" };
    const appeal = this.getAppealById(input.appealId);
    if (!appeal || appeal.reviewId !== input.reviewId) return { ok: false, code: "appeal_not_found" };
    if (appeal.status !== "open") return { ok: false, code: "appeal_not_open" };
    appeal.status = "closed";
    appeal.resolution = input.resolution;
    appeal.closedAt = input.now ?? new Date().toISOString();
    this.persistAppeal(appeal);

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_appeal_closed.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey,
      actorType: "moderator",
      actorId: input.actor.id,
      payload: {
        appealId: input.appealId,
        resolution: input.resolution,
      },
    });

    return this.cacheIdempotent(input.idempotencyKey, { ok: true });
  }

  editReview(input) {
    const review = this.getReviewById(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (review.reviewerUserId !== input.actor?.id) return { ok: false, code: "not_owner" };

    const now = new Date(input.now ?? Date.now());
    const createdAt = new Date(review.createdAt);
    const ageMs = now.getTime() - createdAt.getTime();
    const editWindowMs = 15 * 60 * 1000;
    if (Number.isNaN(ageMs) || ageMs > editWindowMs) return { ok: false, code: "edit_window_expired" };

    if (input.rating !== undefined) review.rating = input.rating;
    if (input.comment !== undefined) review.comment = input.comment;
    review.updatedAt = now.toISOString();

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_created.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey || randomId("idem"),
      actorType: "user",
      actorId: input.actor.id,
      payload: {
        action: "edit",
        rating: review.rating,
        comment: review.comment,
      },
    });

    this.persistReviewUpdate(review);
    this.recomputeProviderAggregate(review.providerUserId);
    return { ok: true, review };
  }

  reportReview(input) {
    if (!isValidIdempotencyKey(input?.idempotencyKey)) return { ok: false, code: "idempotency_key_required" };
    const review = this.getReviewById(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (!input?.actor?.id) return { ok: false, code: "unauthenticated" };

    review.status = "en_revision";
    review.updatedAt = input.now ?? new Date().toISOString();

    const report = {
      id: randomId("rep"),
      reviewId: input.reviewId,
      reporterUserId: input.actor?.id,
      reasonCode: input.reasonCode,
      description: input.description ?? null,
      status: "queued",
      idempotencyKey: input.idempotencyKey,
      createdAt: input.now ?? new Date().toISOString(),
    };
    try {
      this.persistReport(report);
    } catch (error) {
      if (isReportIdempotencyConflict(error)) return { ok: false, code: "idempotency_key_conflict" };
      throw error;
    }

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_sent_to_moderation.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey,
      actorType: "user",
      actorId: input.actor?.id || "unknown",
      payload: {
        reportId: report.id,
        reasonCode: report.reasonCode,
        scoreInputs: buildScoreInputs({
          rating: review.rating,
          serviceCompletedAt: review.createdAt,
          now: input.now,
          riskScore: review.riskScore,
          velocityCount: this.currentVelocityCount(review.reviewerUserId),
          velocityLimit: this.velocityMaxPerWindow,
        }),
        fraudHeuristics: buildFraudHeuristics({
          reviewId: review.id,
          riskScore: review.riskScore,
          velocityCount: this.currentVelocityCount(review.reviewerUserId),
          velocityLimit: this.velocityMaxPerWindow,
          reasonCode: report.reasonCode,
          sourceAvailability: input.sourceAvailability,
          thresholdVersion: this.thresholdVersion,
          s6PartialAlertThreshold: this.s6PartialAlertThreshold,
          s6PartialStreakByReview: this.s6PartialStreakByReview,
        }),
      },
    });

    this.persistReviewUpdate(review);
    this.recomputeProviderAggregate(review.providerUserId);
    return { ok: true, report, review };
  }

  listProviderReviews(input) {
    const limit = Math.min(Number(input.limit ?? 20), 50);
    const items = this.repository
      ? this.repository.listProviderReviews(input.providerUserId, limit)
      : [...this.reviews.values()]
        .filter((r) => r.providerUserId === input.providerUserId)
        .filter((r) => r.status === "verificada")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    return { ok: true, items, nextCursor: null, version: "v1" };
  }

  respondToReview(input) {
    const review = this.getReviewById(input.reviewId);
    if (!review) return { ok: false, code: "not_found" };
    if (review.providerUserId !== input.actor?.id) return { ok: false, code: "not_review_target" };
    if (review.status !== "verificada") return { ok: false, code: "review_not_respondable" };

    const now = input.now ?? new Date().toISOString();
    const existing = this.responses.get(review.id);
    const response = existing
      ? { ...existing, message: input.message, status: "edited", updatedAt: now }
      : {
          id: randomId("resp"),
          reviewId: review.id,
          responderUserId: input.actor.id,
          message: input.message,
          status: "active",
          createdAt: now,
          updatedAt: now,
        };
    this.responses.set(review.id, response);
    this.persistResponse(response);

    this.emitEvent({
      reviewId: review.id,
      eventName: "review_published.v1",
      correlationId: input.correlationId || randomId("corr"),
      idempotencyKey: input.idempotencyKey || randomId("idem"),
      actorType: "user",
      actorId: input.actor.id,
      payload: { action: "provider_response_upserted", responseId: response.id, status: response.status },
    });

    return { ok: true, response };
  }

  getEvents() {
    return this.repository ? this.repository.listEvents() : this.events.slice();
  }

  cacheIdempotent(key, result) {
    const expiresAt = Date.now() + this.idempotencyTtlMs;
    if (this.repository) {
      this.repository.saveIdempotent(key, result, expiresAt);
      return result;
    }
    this.idempotencyIndex.set(key, { result, expiresAt });
    return result;
  }

  hitVelocityWindow(userId, nowValue) {
    const now = new Date(nowValue ?? Date.now()).getTime();
    const list = this.velocityWindowByUser.get(userId) ?? [];
    const next = list.filter((ts) => now - ts <= this.velocityWindowMs);
    next.push(now);
    this.velocityWindowByUser.set(userId, next);
    return next.length > this.velocityMaxPerWindow;
  }

  currentVelocityCount(userId) {
    return (this.velocityWindowByUser.get(userId) ?? []).length;
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
      previousEventHash: this.lastEventHash,
    };
    const integrityHash = crypto.createHash("sha256").update(JSON.stringify(envelope)).digest("hex");
    const signed = this.eventSigner.signDigest(integrityHash);
    this.lastEventHash = integrityHash;
    const event = {
      ...envelope,
      integrityHash,
      signature: signed.signature,
      signatureAlgorithm: signed.algorithm,
      signatureKeyId: signed.keyId,
    };
    if (this.repository) {
      this.repository.appendEvent(event);
      return;
    }
    this.events.push(event);
  }

  getIdempotent(key) {
    if (this.repository) return this.repository.getIdempotent(key);
    const cached = this.idempotencyIndex.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.idempotencyIndex.delete(key);
      return null;
    }
    return cached.result;
  }

  hasReviewPair(serviceRequestId, reviewerUserId) {
    if (this.repository) return this.repository.hasReviewPair(serviceRequestId, reviewerUserId);
    return this.reviewByPair.has(pairKey(serviceRequestId, reviewerUserId));
  }

  getReviewById(reviewId) {
    if (this.repository) return this.repository.getReviewById(reviewId);
    return this.reviews.get(reviewId);
  }

  persistReview(review) {
    if (this.repository) {
      this.repository.createReview(review);
      return;
    }
    this.reviews.set(review.id, review);
    this.reviewByPair.set(pairKey(review.serviceRequestId, review.reviewerUserId), review.id);
  }

  persistReviewUpdate(review) {
    if (this.repository) {
      this.repository.updateReview(review);
      return;
    }
    this.reviews.set(review.id, review);
  }

  persistAppeal(appeal, options = null) {
    if (this.repository?.createAppeal && appeal.status === "open") {
      this.repository.createAppeal(appeal, options ?? {
        resume: false,
        now: appeal.createdAt,
        appealReopenCooldownMs: this.appealReopenCooldownMs,
      });
    } else if (this.repository?.upsertAppeal) {
      this.repository.upsertAppeal(appeal);
    }
    this.appeals.set(appeal.id, appeal);
    const ids = this.appealIdsByReview.get(appeal.reviewId) ?? [];
    if (!ids.includes(appeal.id)) ids.push(appeal.id);
    this.appealIdsByReview.set(appeal.reviewId, ids);
  }

  findOpenAppealByReviewId(reviewId) {
    if (this.repository?.listAppealsByReviewId) {
      const appeals = this.repository.listAppealsByReviewId(reviewId);
      return appeals.find((appeal) => appeal.status === "open") ?? null;
    }
    const ids = this.appealIdsByReview.get(reviewId) ?? [];
    for (const id of ids) {
      const appeal = this.appeals.get(id);
      if (appeal?.status === "open") return appeal;
    }
    return null;
  }

  findLatestClosedAppealByReviewId(reviewId) {
    if (this.repository?.listAppealsByReviewId) {
      const appeals = this.repository.listAppealsByReviewId(reviewId).filter((appeal) => appeal.closedAt);
      if (appeals.length === 0) return null;
      appeals.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime());
      return appeals[0];
    }
    const ids = this.appealIdsByReview.get(reviewId) ?? [];
    let latest = null;
    for (const id of ids) {
      const appeal = this.appeals.get(id);
      if (!appeal?.closedAt) continue;
      if (!latest || new Date(appeal.closedAt).getTime() > new Date(latest.closedAt).getTime()) {
        latest = appeal;
      }
    }
    return latest;
  }

  getAppealById(appealId) {
    if (this.repository?.getAppealById) return this.repository.getAppealById(appealId);
    return this.appeals.get(appealId);
  }

  inAppealCooldown(closedAt, now) {
    const closedAtMs = new Date(closedAt).getTime();
    const nowMs = new Date(now ?? Date.now()).getTime();
    if (Number.isNaN(closedAtMs) || Number.isNaN(nowMs)) return false;
    return nowMs - closedAtMs < this.appealReopenCooldownMs;
  }

  persistReport(report) {
    if (this.repository?.createReviewReport) this.repository.createReviewReport(report);
  }

  persistResponse(response) {
    if (this.repository?.upsertReviewResponse) this.repository.upsertReviewResponse(response);
  }

  recomputeProviderAggregate(providerUserId) {
    if (this.repository?.recomputeProviderAggregate) this.repository.recomputeProviderAggregate(providerUserId);
  }

  persistReviewTag(tag) {
    if (this.repository?.upsertReviewTag) this.repository.upsertReviewTag(tag);
  }
}

function pairKey(serviceRequestId, reviewerUserId) {
  return `${serviceRequestId}:${reviewerUserId}`;
}

function randomId(prefix) {
  if (prefix === "rev" || prefix === "evt" || prefix === "rep" || prefix === "apl" || prefix === "resp") {
    return crypto.randomUUID();
  }
  return `${prefix}_${crypto.randomUUID()}`;
}

function isValidIdempotencyKey(value) {
  return typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 128;
}

function canModerate(actor) {
  if (!actor || typeof actor !== "object") return false;
  if (!actor.id || !Array.isArray(actor.roles)) return false;
  return actor.roles.includes("moderator");
}

function isAppealConstraintViolation(error, code) {
  return Boolean(error && typeof error === "object" && error.code === code);
}

function buildScoreInputs({ rating, serviceCompletedAt, now, riskScore, velocityCount, velocityLimit }) {
  const priorMean = 3.8;
  const priorWeight = 8;
  const ratingNormalized = clamp((Number(rating) - 1) / 4, 0, 1);
  const ageDays = timeDiffDays(serviceCompletedAt, now);
  const recencyDecayWeight = Math.exp(-RECENCY_LAMBDA * ageDays);
  const recencyFactor = 0.85 + 0.15 * ratingNormalized;
  const confidenceWeight = clamp(1 - (Number(riskScore) || 0) / 200, 0.5, 1);
  return {
    bayesianPriorMean: priorMean,
    bayesianPriorWeight: priorWeight,
    ratingNormalized: round4(ratingNormalized),
    recencyDays: round4(ageDays),
    recencyHalfLifeDays: RECENCY_HALF_LIFE_DAYS,
    recencyLambda: round8(RECENCY_LAMBDA),
    recencyDecayWeight: round4(recencyDecayWeight),
    recencyFactor: round4(recencyFactor),
    confidenceWeight: round4(confidenceWeight),
    velocityCount: Number(velocityCount) || 0,
    velocityLimit: Number(velocityLimit) || 0,
  };
}

function buildFraudHeuristics({
  reviewId = null,
  riskScore,
  velocityCount,
  velocityLimit,
  reasonCode = null,
  sourceAvailability = null,
  thresholdVersion = DEFAULT_THRESHOLD_VERSION,
  s6PartialAlertThreshold = 2,
  s6PartialStreakByReview = null,
}) {
  const s6Telemetry = buildS6Telemetry({ reasonCode, sourceAvailability });
  return {
    thresholdVersion,
    riskBand: toRiskBand(riskScore),
    velocityBand: toVelocityBand(velocityCount, velocityLimit),
    s6Telemetry,
    s6Alert: buildS6Alert({
      reviewId,
      s6Telemetry,
      threshold: s6PartialAlertThreshold,
      streakByReview: s6PartialStreakByReview,
    }),
    flaggedByReasonCode: isFraudReason(reasonCode),
    reasonCode: reasonCode ?? null,
  };
}

function buildS6Alert({ reviewId, s6Telemetry, threshold, streakByReview }) {
  const consecutivePartialCount = updateS6PartialStreak({
    reviewId,
    status: s6Telemetry?.status,
    streakByReview,
  });
  const isSustainedPartial = consecutivePartialCount >= threshold;
  return {
    active: isSustainedPartial,
    kind: isSustainedPartial ? "sustained_partial_availability" : "none",
    threshold,
    consecutivePartialCount,
  };
}

function updateS6PartialStreak({ reviewId, status, streakByReview }) {
  if (!reviewId || !streakByReview || typeof streakByReview.get !== "function") {
    return status === "partial" ? 1 : 0;
  }
  if (status !== "partial") {
    streakByReview.set(reviewId, 0);
    return 0;
  }
  const current = Number(streakByReview.get(reviewId)) || 0;
  const next = current + 1;
  streakByReview.set(reviewId, next);
  return next;
}

function buildS6Telemetry({ reasonCode, sourceAvailability }) {
  const upstream = normalizeSourceAvailability(sourceAvailability);
  if (upstream) {
    const sourcesExpected = upstream.sourcesExpected;
    const sourcesPresent = clamp(upstream.sourcesPresent, 0, sourcesExpected);
    return {
      sourcesExpected,
      sourcesPresent,
      completenessRatio: sourcesExpected > 0 ? round4(sourcesPresent / sourcesExpected) : 0,
      status: sourcesExpected > 0 && sourcesPresent === sourcesExpected ? "complete" : "partial",
    };
  }

  const hasReasonCode = typeof reasonCode === "string" && reasonCode.trim().length > 0;
  const sourcesPresent = hasReasonCode ? 1 : 0;
  const sourcesExpected = 3;
  return {
    sourcesExpected,
    sourcesPresent,
    completenessRatio: round4(sourcesPresent / sourcesExpected),
    status: sourcesPresent === sourcesExpected ? "complete" : "partial",
  };
}

function normalizeSourceAvailability(input) {
  if (!input || typeof input !== "object") return null;
  const expectedRaw = input.sourcesExpected ?? input.expected ?? input.total ?? input.upstreamSourcesExpected;
  const presentRaw = input.sourcesPresent ?? input.present ?? input.available ?? input.upstreamSourcesPresent;
  const sourcesExpected = Number(expectedRaw);
  const sourcesPresent = Number(presentRaw);
  if (!Number.isFinite(sourcesExpected) || !Number.isFinite(sourcesPresent)) return null;
  if (sourcesExpected <= 0 || sourcesPresent < 0) return null;
  return {
    sourcesExpected: Math.floor(sourcesExpected),
    sourcesPresent: Math.floor(sourcesPresent),
  };
}

function buildModerationOutcome({ toStatus, reasonCode, severity }) {
  return {
    toStatus,
    excludedFromPublicScore: toStatus !== "verificada",
    isFraudConfirmed: isFraudReason(reasonCode),
    severity,
  };
}

function timeDiffDays(from, to) {
  const fromMs = new Date(from ?? Date.now()).getTime();
  const toMs = new Date(to ?? Date.now()).getTime();
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0;
  return Math.max(0, (toMs - fromMs) / (1000 * 60 * 60 * 24));
}

function toRiskBand(score) {
  const n = Number(score) || 0;
  if (n >= 85) return "critical";
  if (n >= 70) return "high";
  if (n >= 40) return "medium";
  return "low";
}

function toVelocityBand(count, limit) {
  const c = Number(count) || 0;
  const l = Math.max(1, Number(limit) || 1);
  if (c > l) return "burst";
  if (c > Math.floor(l * 0.6)) return "elevated";
  return "normal";
}

function isFraudReason(reasonCode) {
  if (!reasonCode) return false;
  return /(fraud|risk|collusion|coordinated|manipulation|spam)/i.test(String(reasonCode));
}

function round4(value) {
  return Math.round(value * 10000) / 10000;
}

function round8(value) {
  return Math.round(value * 100000000) / 100000000;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isReportIdempotencyConflict(error) {
  const message = String(error?.message ?? "");
  return /idempotency_key/i.test(message) && /unique|constraint/i.test(message);
}

function normalizeTag(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9_:-]/g, "_").slice(0, 40);
}
