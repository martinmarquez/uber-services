import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { SqliteReviewRepository } from "../src/db/sqliteReviewRepository.js";
import { runSqliteMigrations } from "../src/db/runSqliteMigrations.js";
import { ReviewService } from "../src/domain/reviewService.js";

test("sqlite migration runner applies schema and service persists review + outbox", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const service = new ReviewService({ repository });

  const created = service.createReview({
    idempotencyKey: "idem-sqlite-1",
    serviceRequestId: "sr-sqlite-1",
    reviewerUserId: "u-sqlite-1",
    providerUserId: "p-sqlite-1",
    rating: 5,
    comment: "Persisted review",
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });

  assert.equal(created.ok, true);
  const loaded = repository.getReviewById(created.review.id);
  assert.equal(loaded.rating, 5);
  assert.equal(loaded.comment, "Persisted review");

  const events = repository.listEvents();
  assert.equal(events.length, 2);
  assert.equal(events[0].eventName, "review_eligibility_checked.v1");
  assert.equal(events[1].eventName, "review_created.v1");
  assert.ok(events[1].integrityHash);

  fs.rmSync(dbPath, { force: true });
});

test("sqlite-backed idempotency returns replayed response", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-idem-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const service = new ReviewService({ repository });
  const input = {
    idempotencyKey: "idem-sqlite-2",
    serviceRequestId: "sr-sqlite-2",
    reviewerUserId: "u-sqlite-2",
    providerUserId: "p-sqlite-1",
    rating: 4,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  };

  const first = service.createReview(input);
  const second = service.createReview(input);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.replay, true);
  assert.equal(second.review.id, first.review.id);

  fs.rmSync(dbPath, { force: true });
});

test("sqlite lifecycle migration enforces report idempotency and aggregate constraints", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-lifecycle-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const service = new ReviewService({ repository });
  const created = service.createReview({
    idempotencyKey: "idem-sqlite-3",
    serviceRequestId: "sr-sqlite-3",
    reviewerUserId: "u-sqlite-3",
    providerUserId: "p-sqlite-3",
    rating: 5,
    comment: "Lifecycle test review",
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  repository.db.prepare(`
    insert into review_reports (
      id, review_id, reporter_user_id, reason_code, status, idempotency_key, created_at
    ) values (?, ?, ?, ?, ?, ?, ?)
  `).run("rep-1", created.review.id, "u-reporter-1", "spam", "queued", "rep-idem-1", "2026-05-07T00:11:00.000Z");

  assert.throws(() => {
    repository.db.prepare(`
      insert into review_reports (
        id, review_id, reporter_user_id, reason_code, status, idempotency_key, created_at
      ) values (?, ?, ?, ?, ?, ?, ?)
    `).run("rep-2", created.review.id, "u-reporter-2", "fraud", "queued", "rep-idem-1", "2026-05-07T00:12:00.000Z");
  });

  assert.throws(() => {
    repository.db.prepare(`
      insert into review_aggregates (
        provider_user_id, total_reviews, rating_sum, average_rating, updated_at
      ) values (?, ?, ?, ?, ?)
    `).run("p-sqlite-3", -1, 5, 5, "2026-05-07T00:13:00.000Z");
  });

  fs.rmSync(dbPath, { force: true });
});

test("sqlite repository wiring persists report, moderation tag and provider aggregate", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-wiring-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const service = new ReviewService({ repository });
  const created = service.createReview({
    idempotencyKey: "idem-sqlite-4",
    serviceRequestId: "sr-sqlite-4",
    reviewerUserId: "u-sqlite-4",
    providerUserId: "p-sqlite-4",
    rating: 5,
    comment: "Persistence wiring test",
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  const reportResult = service.reportReview({
    idempotencyKey: "idem-report-sqlite-4",
    reviewId: created.review.id,
    reasonCode: "fraud_signal",
    actor: { id: "u-reporter-4", roles: ["customer"] },
    now: "2026-05-07T00:11:00.000Z",
  });
  assert.equal(reportResult.ok, true);

  const moderationResult = service.transitionModeration({
    idempotencyKey: "idem-moderation-sqlite-4",
    reviewId: created.review.id,
    toStatus: "no_recomendada",
    actor: { id: "mod-4", roles: ["moderator"] },
    decision: {
      reasonCode: "risk_high",
      severity: "SEV-2",
      decisionNote: "Risky pattern",
    },
    now: "2026-05-07T00:12:00.000Z",
  });
  assert.equal(moderationResult.ok, true);

  const aggregateRow = repository.db.prepare("select * from review_aggregates where provider_user_id = ?").get("p-sqlite-4");
  assert.equal(aggregateRow.total_reviews, 0);
  assert.equal(aggregateRow.rating_sum, 0);
  assert.equal(aggregateRow.average_rating, 0);

  const tagRow = repository.db.prepare("select * from review_tags where review_id = ? and tag = ?").get(created.review.id, "risk_high");
  assert.ok(tagRow);
  assert.equal(tagRow.source, "moderator");

  const reportRow = repository.db.prepare("select * from review_reports where id = ?").get(reportResult.report.id);
  assert.ok(reportRow);
  assert.equal(reportRow.idempotency_key, "idem-report-sqlite-4");

  fs.rmSync(dbPath, { force: true });
});

test("sqlite storage-backed appeal state works across service instances", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-appeal-persist-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });

  const serviceA = new ReviewService({ repository, appealReopenCooldownMs: 60 * 60 * 1000 });
  const created = serviceA.createReview({
    idempotencyKey: "idem-sqlite-appeal-persist-1",
    serviceRequestId: "sr-sqlite-appeal-persist-1",
    reviewerUserId: "u-sqlite-appeal-persist-1",
    providerUserId: "p-sqlite-appeal-persist-1",
    rating: 5,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  const opened = serviceA.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-sqlite-appeal-persist-1", roles: ["customer"] },
    note: "Primera apelacion con evidencia suficiente.",
    idempotencyKey: "idem-sqlite-appeal-persist-open-1",
    now: "2026-05-07T01:00:00.000Z",
  });
  assert.equal(opened.ok, true);

  const serviceB = new ReviewService({ repository, appealReopenCooldownMs: 60 * 60 * 1000 });
  const closed = serviceB.closeAppeal({
    reviewId: created.review.id,
    actor: { id: "mod-sqlite-appeal-persist-1", roles: ["moderator"] },
    appealId: opened.appeal.id,
    resolution: "rejected",
    idempotencyKey: "idem-sqlite-appeal-persist-close-1",
    now: "2026-05-07T01:10:00.000Z",
  });
  assert.equal(closed.ok, true);

  const deniedDuringCooldown = serviceB.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-sqlite-appeal-persist-1", roles: ["customer"] },
    note: "Reapertura dentro de ventana de cooldown.",
    idempotencyKey: "idem-sqlite-appeal-persist-open-2",
    resume: true,
    now: "2026-05-07T01:20:00.000Z",
  });
  assert.equal(deniedDuringCooldown.ok, false);
  assert.equal(deniedDuringCooldown.code, "appeal_cooldown_active");

  fs.rmSync(dbPath, { force: true });
});

test("sqlite-backed appeals persist across service restart for close and cooldown enforcement", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-appeals-restart-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const firstService = new ReviewService({ repository, appealReopenCooldownMs: 24 * 60 * 60 * 1000 });

  const created = firstService.createReview({
    idempotencyKey: "idem-sqlite-appeal-restart-1",
    serviceRequestId: "sr-sqlite-appeal-restart-1",
    reviewerUserId: "u-sqlite-appeal-restart-1",
    providerUserId: "p-sqlite-appeal-restart-1",
    rating: 5,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  const opened = firstService.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-sqlite-appeal-restart-1", roles: ["user"] },
    note: "Initial appeal evidence from first service instance",
    idempotencyKey: "idem-sqlite-appeal-restart-open-1",
    now: "2026-05-07T02:00:00.000Z",
  });
  assert.equal(opened.ok, true);

  const restartedService = new ReviewService({ repository, appealReopenCooldownMs: 24 * 60 * 60 * 1000 });
  const closed = restartedService.closeAppeal({
    reviewId: created.review.id,
    actor: { id: "mod-sqlite-appeal-restart-1", roles: ["moderator"] },
    appealId: opened.appeal.id,
    resolution: "rejected",
    idempotencyKey: "idem-sqlite-appeal-restart-close-1",
    now: "2026-05-07T02:30:00.000Z",
  });
  assert.equal(closed.ok, true);

  const blockedByCooldown = restartedService.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-sqlite-appeal-restart-1", roles: ["user"] },
    note: "Reopen request with resume flag still inside cooldown",
    resume: true,
    idempotencyKey: "idem-sqlite-appeal-restart-open-2",
    now: "2026-05-07T03:00:00.000Z",
  });
  assert.equal(blockedByCooldown.ok, false);
  assert.equal(blockedByCooldown.code, "appeal_cooldown_active");

  fs.rmSync(dbPath, { force: true });
});

test("sqlite appeal open race across service instances allows only one active appeal", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-appeal-race-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const serviceA = new ReviewService({ repository });
  const serviceB = new ReviewService({ repository });

  const created = serviceA.createReview({
    idempotencyKey: "idem-sqlite-appeal-race-review-1",
    serviceRequestId: "sr-sqlite-appeal-race-1",
    reviewerUserId: "u-sqlite-appeal-race-1",
    providerUserId: "p-sqlite-appeal-race-1",
    rating: 4,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  const first = serviceA.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-sqlite-appeal-race-1", roles: ["customer"] },
    note: "First concurrent appeal attempt with enough evidence.",
    idempotencyKey: "idem-sqlite-appeal-race-open-1",
    now: "2026-05-07T01:00:00.000Z",
  });
  const second = serviceB.openAppeal({
    reviewId: created.review.id,
    actor: { id: "u-sqlite-appeal-race-1", roles: ["customer"] },
    note: "Second concurrent appeal attempt with different idempotency key.",
    idempotencyKey: "idem-sqlite-appeal-race-open-2",
    now: "2026-05-07T01:00:01.000Z",
  });

  const outcomes = [first, second];
  const successCount = outcomes.filter((result) => result.ok === true).length;
  const duplicateCount = outcomes.filter((result) => result.ok === false && result.code === "appeal_already_open").length;
  assert.equal(successCount, 1);
  assert.equal(duplicateCount, 1);

  const openAppeals = repository.db.prepare(
    "select count(*) as total from review_appeals where review_id = ? and status = 'queued'",
  ).get(created.review.id);
  assert.equal(Number(openAppeals.total), 1);

  fs.rmSync(dbPath, { force: true });
});
