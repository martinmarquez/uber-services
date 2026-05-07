import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { ReviewService } from "../src/domain/reviewService.js";
import { verifyEventChain } from "../src/security/eventIntegrity.js";

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
  assert.equal(svc.getEvents().at(-1).eventName, "review_moderation_decided.v1");
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
