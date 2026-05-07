import test from "node:test";
import assert from "node:assert/strict";
import { ReviewService } from "../src/domain/reviewService.js";

test("createReview stores review and emits eligibility + created events", () => {
  const svc = new ReviewService();
  const res = svc.createReview({
    idempotencyKey: "idem-1",
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
});

test("idempotent create returns cached response", () => {
  const svc = new ReviewService();
  const input = {
    idempotencyKey: "idem-2",
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
    idempotencyKey: "idem-3",
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
    idempotencyKey: "idem-4",
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
    decision: {
      reasonCode: "fraud",
      severity: "SEV-2",
      decisionNote: "Forbidden direct path",
      moderatorId: "mod-1",
    },
  });
  assert.equal(transitioned.ok, false);
  assert.equal(transitioned.code, "forbidden_transition");
});

test("allowed moderation transition emits decision event", () => {
  const svc = new ReviewService();
  const created = svc.createReview({
    idempotencyKey: "idem-5",
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
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-3",
      decisionNote: "Risk threshold exceeded",
      moderatorId: "mod-2",
    },
    idempotencyKey: "idem-mod-1",
    correlationId: "corr-mod-1",
  });
  assert.equal(transitioned.ok, true);
  assert.equal(transitioned.review.status, "en_revision");
  assert.equal(svc.getEvents().at(-1).eventName, "review_moderation_decided.v1");
});
