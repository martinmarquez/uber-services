import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ReviewService } from "../src/domain/reviewService.js";
import { defaultEventSigner, verifyEventChain } from "../src/security/eventIntegrity.js";

test("createReview stores review and emits eligibility + created events", () => {
  const svc = new ReviewService();
  const res = svc.createReview({
    idempotencyKey: "idem-0001",
    serviceRequestId: "sr-1",
    reviewerUserId: "u-1",
    providerUserId: "p-1",
    rating: 5,
    comment: "Great service",
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  assert.equal(res.ok, true);
  assert.equal(res.review.status, "verificada");
  const events = svc.getEvents();
  assert.equal(events.length, 2);
  assert.equal(events[0].eventName, "review_eligibility_checked.v1");
  assert.equal(events[1].eventName, "review_created.v1");
  assert.equal(events[1].payload.scoreInputs.bayesianPriorWeight, 8);
  assert.equal(events[1].payload.scoreInputs.recencyHalfLifeDays, 120);
  assert.equal(events[1].payload.scoreInputs.recencyLambda, 0.00577623);
  assert.equal(events[1].payload.scoreInputs.recencyFactor, 1);
  assert.equal(events[1].payload.scoreInputs.recencyDecayWeight, 0.9942);
  assert.equal(events[1].payload.fraudHeuristics.thresholdVersion, "anti_gaming_v1_2026-05-10");
  assert.equal(events[1].payload.fraudHeuristics.riskBand, "low");
  assert.equal(events[1].payload.fraudHeuristics.s6Telemetry.status, "partial");
  assert.equal(events[1].payload.fraudHeuristics.s6Telemetry.completenessRatio, 0);
  assert.ok(events[1].integrityHash);
  assert.ok(events[1].signature);
  assert.equal(events[0].previousEventHash, null);
  assert.equal(events[1].previousEventHash, events[0].integrityHash);
});

test("idempotent create returns cached response", () => {
  const svc = new ReviewService();
  const input = {
    idempotencyKey: "idem-0002",
    serviceRequestId: "sr-2",
    reviewerUserId: "u-2",
    providerUserId: "p-1",
    rating: 4,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  };
  const first = svc.createReview(input);
  const second = svc.createReview(input);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.review.id, first.review.id);
  assert.equal(second.replay, true);
});

test("ineligible create returns deterministic reason and no review_created event", () => {
  const svc = new ReviewService();
  const res = svc.createReview({
    idempotencyKey: "idem-0003",
    serviceRequestId: "sr-3",
    reviewerUserId: "u-3",
    providerUserId: "p-1",
    rating: 5,
    serviceCompletedAt: "2026-04-01T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  assert.equal(res.ok, false);
  assert.equal(res.eligibilityReason, "outside_14_day_window");
  const names = svc.getEvents().map((e) => e.eventName);
  assert.deepEqual(names, ["review_eligibility_checked.v1", "review_eligibility_failed.v1"]);
});

test("forbidden moderation transition is denied", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-0004",
    serviceRequestId: "sr-4",
    reviewerUserId: "u-4",
    providerUserId: "p-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  const transitioned = svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "removida",
    actor: { id: "mod-1", roles: ["moderator"] },
    decision: {
      reasonCode: "fraud",
      severity: "SEV-2",
      decisionNote: "Forbidden direct path",
    },
    idempotencyKey: "idem-0004-mod-1",
  });
  assert.equal(transitioned.ok, false);
  assert.equal(transitioned.code, "forbidden_transition");
});

test("allowed moderation transition emits decision event", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-0005",
    serviceRequestId: "sr-5",
    reviewerUserId: "u-5",
    providerUserId: "p-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  const transitioned = svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "en_revision",
    actor: { id: "mod-2", roles: ["moderator"] },
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-3",
      decisionNote: "Risk threshold exceeded",
    },
    idempotencyKey: "idem-mod-0001",
    correlationId: "corr-mod-1",
  });
  assert.equal(transitioned.ok, true);
  assert.equal(transitioned.review.status, "en_revision");
  const event = svc.getEvents().at(-1);
  assert.equal(event.eventName, "review_moderation_decided.v1");
  assert.equal(event.payload.moderationOutcome.excludedFromPublicScore, true);
  assert.equal(event.payload.fraudHeuristics.flaggedByReasonCode, true);
  assert.equal(event.payload.fraudHeuristics.s6Telemetry.sourcesPresent, 1);
});

test("moderation transition is idempotent for repeated idempotency key", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-mod-idem-1",
    serviceRequestId: "sr-mod-idem-1",
    reviewerUserId: "u-mod-idem-1",
    providerUserId: "p-mod-idem-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const first = svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "en_revision",
    actor: { id: "mod-idem-1", roles: ["moderator"] },
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-2",
      decisionNote: "first decision",
    },
    idempotencyKey: "idem-mod-transition-1",
  });
  const second = svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "en_revision",
    actor: { id: "mod-idem-1", roles: ["moderator"] },
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-2",
      decisionNote: "first decision",
    },
    idempotencyKey: "idem-mod-transition-1",
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.replay, true);
});

test("moderation to removida emits review_removed event", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-removed-1",
    serviceRequestId: "sr-removed-1",
    reviewerUserId: "u-removed-1",
    providerUserId: "p-removed-1",
    rating: 2,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "en_revision",
    actor: { id: "mod-removed-1", roles: ["moderator"] },
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-3",
      decisionNote: "Escalated for removal",
    },
    idempotencyKey: "idem-removed-step-1",
  });

  svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "removida",
    actor: { id: "mod-removed-1", roles: ["moderator"] },
    decision: {
      reasonCode: "coordinated_manipulation",
      severity: "SEV-3",
      decisionNote: "Policy confirmed",
    },
    idempotencyKey: "idem-removed-step-2",
  });

  const names = svc.getEvents().map((e) => e.eventName);
  assert.ok(names.includes("review_moderation_decided.v1"));
  assert.ok(names.includes("review_removed.v1"));
});

test("appeal open/close emits appeal events", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-appeal-1",
    serviceRequestId: "sr-appeal-1",
    reviewerUserId: "u-appeal-1",
    providerUserId: "p-appeal-1",
    rating: 4,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const opened = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-1", roles: ["user"] },
    note: "Please review this decision",
    idempotencyKey: "idem-appeal-open-1",
    correlationId: "corr-appeal-1",
  });
  assert.equal(opened.ok, true);

  const closed = svc.closeAppeal({
    reviewId: created.review.id,
    actor: { id: "mod-appeal-1", roles: ["moderator"] },
    appealId: opened.appeal.id,
    resolution: "accepted",
    idempotencyKey: "idem-appeal-close-1",
    correlationId: "corr-appeal-2",
  });
  assert.equal(closed.ok, true);

  const names = svc.getEvents().map((e) => e.eventName);
  assert.ok(names.includes("review_appeal_opened.v1"));
  assert.ok(names.includes("review_appeal_closed.v1"));
});

test("openAppeal rejects non-owner actor", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-appeal-owner-1",
    serviceRequestId: "sr-appeal-owner-1",
    reviewerUserId: "u-appeal-owner-1",
    providerUserId: "p-appeal-owner-1",
    rating: 4,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const opened = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-other", roles: ["user"] },
    note: "No soy titular",
    idempotencyKey: "idem-appeal-owner-open-1",
  });

  assert.equal(opened.ok, false);
  assert.equal(opened.code, "forbidden_actor");
});

test("openAppeal blocks duplicate active appeal for same review", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-appeal-dupe-1",
    serviceRequestId: "sr-appeal-dupe-1",
    reviewerUserId: "u-appeal-dupe-1",
    providerUserId: "p-appeal-dupe-1",
    rating: 4,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const first = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-dupe-1", roles: ["user"] },
    note: "Evidence package for first appeal",
    idempotencyKey: "idem-appeal-dupe-open-1",
    now: "2026-05-07T01:00:00.000Z",
  });
  assert.equal(first.ok, true);

  const second = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-dupe-1", roles: ["user"] },
    note: "Trying to flood another active appeal",
    idempotencyKey: "idem-appeal-dupe-open-2",
    now: "2026-05-07T01:05:00.000Z",
  });
  assert.equal(second.ok, false);
  assert.equal(second.code, "appeal_already_open");
});

test("openAppeal enforces cooldown after appeal closure", () => {
  const svc = new ReviewService({ appealReopenCooldownMs: 24 * 60 * 60 * 1000 });
  const created = svc.createReview({
    idempotencyKey: "idem-appeal-cooldown-1",
    serviceRequestId: "sr-appeal-cooldown-1",
    reviewerUserId: "u-appeal-cooldown-1",
    providerUserId: "p-appeal-cooldown-1",
    rating: 4,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const opened = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-cooldown-1", roles: ["user"] },
    note: "Initial appeal with enough evidence",
    idempotencyKey: "idem-appeal-cooldown-open-1",
    now: "2026-05-07T10:00:00.000Z",
  });
  assert.equal(opened.ok, true);

  const closed = svc.closeAppeal({
    reviewId: created.review.id,
    actor: { id: "mod-cooldown-1", roles: ["moderator"] },
    appealId: opened.appeal.id,
    resolution: "rejected",
    idempotencyKey: "idem-appeal-cooldown-close-1",
    now: "2026-05-07T10:10:00.000Z",
  });
  assert.equal(closed.ok, true);

  const blockedReopen = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-cooldown-1", roles: ["user"] },
    note: "Retry during cooldown should be blocked",
    idempotencyKey: "idem-appeal-cooldown-open-2",
    now: "2026-05-07T12:00:00.000Z",
  });
  assert.equal(blockedReopen.ok, false);
  assert.equal(blockedReopen.code, "appeal_resume_required");

  const blockedByCooldown = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-cooldown-1", roles: ["user"] },
    note: "Retry during cooldown with resume should still be blocked",
    resume: true,
    idempotencyKey: "idem-appeal-cooldown-open-2b",
    now: "2026-05-07T12:00:00.000Z",
  });
  assert.equal(blockedByCooldown.ok, false);
  assert.equal(blockedByCooldown.code, "appeal_cooldown_active");

  const reopened = svc.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-appeal-cooldown-1", roles: ["user"] },
    note: "Retry after cooldown with new evidence",
    resume: true,
    idempotencyKey: "idem-appeal-cooldown-open-3",
    now: "2026-05-08T10:11:00.000Z",
  });
  assert.equal(reopened.ok, true);
});

test("closeAppeal rejects unknown appeal id", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-appeal-close-not-found-1",
    serviceRequestId: "sr-appeal-close-not-found-1",
    reviewerUserId: "u-appeal-close-not-found-1",
    providerUserId: "p-appeal-close-not-found-1",
    rating: 4,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const closed = svc.closeAppeal({
    reviewId: created.review.id,
    actor: { id: "mod-not-found-1", roles: ["moderator"] },
    appealId: "apl_missing",
    resolution: "accepted",
    idempotencyKey: "idem-appeal-close-not-found-op-1",
  });
  assert.equal(closed.ok, false);
  assert.equal(closed.code, "appeal_not_found");
});

test("editReview allows owner within edit window", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-6-edit",
    serviceRequestId: "sr-6",
    reviewerUserId: "u-6",
    providerUserId: "p-1",
    rating: 4,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  const edited = svc.editReview({
    reviewId: created.review.id,
    actor: { id: "u-6" },
    rating: 5,
    comment: "Updated",
    now: "2026-05-07T00:05:00.000Z",
    idempotencyKey: "idem-6-edit-op",
  });
  assert.equal(edited.ok, true);
  assert.equal(edited.review.rating, 5);
});

test("editReview denies when actor is not owner", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-7-edit",
    serviceRequestId: "sr-7",
    reviewerUserId: "u-7",
    providerUserId: "p-1",
    rating: 4,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  const edited = svc.editReview({
    reviewId: created.review.id,
    actor: { id: "u-other" },
    rating: 5,
    now: "2026-05-07T00:05:00.000Z",
  });
  assert.equal(edited.ok, false);
  assert.equal(edited.code, "not_owner");
});

test("reportReview moves review to en_revision", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-8-report",
    serviceRequestId: "sr-8",
    reviewerUserId: "u-8",
    providerUserId: "p-1",
    rating: 4,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  const reported = svc.reportReview({
    idempotencyKey: "idem-8-report-op",
    reviewId: created.review.id,
    actor: { id: "u-9" },
    reasonCode: "offensive_content",
  });
  assert.equal(reported.ok, true);
  assert.equal(reported.review.status, "en_revision");
  const event = svc.getEvents().at(-1);
  assert.equal(event.eventName, "review_sent_to_moderation.v1");
  assert.equal(event.payload.scoreInputs.bayesianPriorMean, 3.8);
  assert.equal(event.payload.fraudHeuristics.flaggedByReasonCode, false);
  assert.equal(event.payload.fraudHeuristics.s6Telemetry.status, "partial");
});

test("fraud heuristics propagate configured threshold version", () => {
  const svc = new ReviewService({ thresholdVersion: "anti_gaming_v2_2026-05-11" });
  const created = svc.createReview({
    idempotencyKey: "idem-threshold-1",
    serviceRequestId: "sr-threshold-1",
    reviewerUserId: "u-threshold-1",
    providerUserId: "p-threshold-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  assert.equal(created.ok, true);
  const createdEvent = svc.getEvents().at(-1);
  assert.equal(createdEvent.payload.fraudHeuristics.thresholdVersion, "anti_gaming_v2_2026-05-11");
});

test("reportReview rejects unauthenticated actor", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-8b-report",
    serviceRequestId: "sr-8b",
    reviewerUserId: "u-8b",
    providerUserId: "p-1",
    rating: 4,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });
  const reported = svc.reportReview({
    idempotencyKey: "idem-8b-report-op",
    reviewId: created.review.id,
    actor: null,
    reasonCode: "offensive_content",
  });
  assert.equal(reported.ok, false);
  assert.equal(reported.code, "unauthenticated");
});

test("createReview ignores client-provided riskScore", () => {
  const svc = new ReviewService();
  const res = svc.createReview({
    idempotencyKey: "idem-risk-0001",
    serviceRequestId: "sr-risk-1",
    reviewerUserId: "u-risk-1",
    providerUserId: "p-risk-1",
    rating: 5,
    riskScore: 999,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  assert.equal(res.ok, true);
  assert.equal(res.review.riskScore, 0);
});

test("createReview rejects missing idempotency key", () => {
  const svc = new ReviewService();
  const res = svc.createReview({
    serviceRequestId: "sr-idem-1",
    reviewerUserId: "u-idem-1",
    providerUserId: "p-idem-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  assert.equal(res.ok, false);
  assert.equal(res.code, "idempotency_key_required");
});

test("transitionModeration rejects non-moderator actor", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-authz-0001",
    serviceRequestId: "sr-authz-1",
    reviewerUserId: "u-authz-1",
    providerUserId: "p-authz-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const res = svc.transitionModeration({
    reviewId: created.review.id,
    toStatus: "en_revision",
    actor: { id: "user-1", roles: ["user"] },
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-2",
      decisionNote: "forged decision",
    },
    idempotencyKey: "idem-authz-mod-0001",
  });

  assert.equal(res.ok, false);
  assert.equal(res.code, "forbidden_actor");
});

test("event chain verifies offline with asymmetric key metadata", () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const signer = {
    signDigest(digestHex) {
      return {
        signature: crypto.sign("RSA-SHA256", Buffer.from(digestHex, "hex"), privateKey).toString("base64"),
        keyId: "kms-key-1",
        algorithm: "RSA-SHA256",
      };
    },
  };

  const svc = new ReviewService({ eventSigner: signer });
  svc.createReview({
    idempotencyKey: "idem-kms-verify-1",
    serviceRequestId: "sr-kms-1",
    reviewerUserId: "u-kms-1",
    providerUserId: "p-kms-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const result = verifyEventChain(svc.getEvents(), (keyId) =>
    keyId === "kms-key-1" ? publicKey.export({ type: "pkcs1", format: "pem" }) : null,
  );
  assert.equal(result.ok, true);
});

test("offline verifier detects payload tampering", () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const signer = {
    signDigest(digestHex) {
      return {
        signature: crypto.sign("RSA-SHA256", Buffer.from(digestHex, "hex"), privateKey).toString("base64"),
        keyId: "kms-key-2",
        algorithm: "RSA-SHA256",
      };
    },
  };

  const svc = new ReviewService({ eventSigner: signer });
  svc.createReview({
    idempotencyKey: "idem-kms-verify-2",
    serviceRequestId: "sr-kms-2",
    reviewerUserId: "u-kms-2",
    providerUserId: "p-kms-2",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const tampered = svc.getEvents();
  tampered[1].payload.rating = 1;

  const result = verifyEventChain(tampered, () => publicKey.export({ type: "pkcs1", format: "pem" }));
  assert.equal(result.ok, false);
  assert.equal(result.code, "event_payload_tampered");
  assert.equal(result.index, 1);
});

test("defaultEventSigner fails fast outside development/test when key material is missing", () => {
  assert.throws(
    () => defaultEventSigner({ nodeEnv: "production", privateKeyPem: null, keyId: null }),
    /EVENT_SIGNING_PRIVATE_KEY_PEM and EVENT_SIGNING_KEY_ID are required outside development\/test/,
  );
});

test("offline verifier validates HMAC signatures", () => {
  const hmacSecret = "test-hmac-secret";
  const svc = new ReviewService({
    eventSigner: {
      signDigest(digestHex) {
        return {
          signature: crypto.createHmac("sha256", hmacSecret).update(digestHex).digest("hex"),
          keyId: "hmac-kid-1",
          algorithm: "HMAC-SHA256",
        };
      },
    },
  });

  svc.createReview({
    idempotencyKey: "idem-hmac-verify-1",
    serviceRequestId: "sr-hmac-1",
    reviewerUserId: "u-hmac-1",
    providerUserId: "p-hmac-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const result = verifyEventChain(svc.getEvents(), (_keyId, algorithm) =>
    algorithm === "HMAC-SHA256" ? hmacSecret : null,
  );
  assert.equal(result.ok, true);
});

test("verify-event-chain script validates HMAC event chain", () => {
  const hmacSecret = "script-hmac-secret";
  const svc = new ReviewService({
    eventSigner: {
      signDigest(digestHex) {
        return {
          signature: crypto.createHmac("sha256", hmacSecret).update(digestHex).digest("hex"),
          keyId: "hmac-script-kid-1",
          algorithm: "HMAC-SHA256",
        };
      },
    },
  });

  svc.createReview({
    idempotencyKey: "idem-hmac-script-1",
    serviceRequestId: "sr-hmac-script-1",
    reviewerUserId: "u-hmac-script-1",
    providerUserId: "p-hmac-script-1",
    rating: 5,
    serviceCompletedAt: "2026-05-06T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:00:00.000Z",
  });

  const eventsFile = path.join(os.tmpdir(), `rat-141-events-${Date.now()}.json`);
  fs.writeFileSync(eventsFile, JSON.stringify(svc.getEvents()), "utf8");

  const script = spawnSync("node", ["server/scripts/verify-event-chain.js", eventsFile], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      EVENT_VERIFY_HMAC_SECRET: hmacSecret,
    },
    encoding: "utf8",
  });

  assert.equal(script.status, 0, script.stderr || script.stdout);
  const parsed = JSON.parse(script.stdout.trim());
  assert.equal(parsed.ok, true);
});
