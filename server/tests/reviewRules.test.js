const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isEligibleForReview,
  isTransitionAllowed,
  validateModerationDecision,
} = require("../src/domain/reviewRules");
const { eligibilityError } = require("../src/api/reviewsContract");

test("eligible review within 14-day window", () => {
  const result = isEligibleForReview({
    serviceCompletedAt: "2026-05-01T12:00:00.000Z",
    now: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    alreadyReviewed: false,
    rateLimited: false,
  });
  assert.equal(result.eligible, true);
  assert.equal(result.reason, null);
});

test("ineligible when outside 14-day window", () => {
  const result = isEligibleForReview({
    serviceCompletedAt: "2026-04-01T12:00:00.000Z",
    now: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    alreadyReviewed: false,
    rateLimited: false,
  });
  assert.deepEqual(result, {
    eligible: false,
    reason: "outside_14_day_window",
  });
});

test("forbidden transition verificada->removida is denied", () => {
  assert.equal(isTransitionAllowed("verificada", "removida"), false);
});

test("allowed transition en_revision->removida is accepted", () => {
  assert.equal(isTransitionAllowed("en_revision", "removida"), true);
});

test("moderation decision requires metadata", () => {
  assert.equal(
    validateModerationDecision({
      reasonCode: "fraud_suspected",
      severity: "SEV-2",
      decisionNote: "Escalated by risk",
      moderatorId: "mod-123",
    }),
    null
  );
  assert.equal(
    validateModerationDecision({
      reasonCode: "fraud_suspected",
      severity: "SEV-9",
      decisionNote: "Invalid severity",
      moderatorId: "mod-123",
    }),
    "severity_invalid"
  );
});

test("eligibility error contract is deterministic", () => {
  const err = eligibilityError("outside_14_day_window", "corr-1");
  assert.equal(err.error.code, "ELIGIBILITY_FAILED");
  assert.equal(err.error.details.eligibilityReason, "outside_14_day_window");
  assert.equal(err.error.details.correlationId, "corr-1");
});
