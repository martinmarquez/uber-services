import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { runPostgresMigrations } from "../src/db/runPostgresMigrations.js";
import { PostgresReviewRepository } from "../src/db/postgresReviewRepository.js";
import { ReviewService } from "../src/domain/reviewService.js";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDatabase = Boolean(DATABASE_URL);

test("postgres migration runner + review persistence parity", { skip: !hasDatabase }, () => {
  const schema = `rat8_${Date.now()}`;
  runPostgresMigrations({ databaseUrl: DATABASE_URL, schema });
  const repository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });
  const service = new ReviewService({ repository });

  const serviceRequestId = crypto.randomUUID();
  const reviewerUserId = crypto.randomUUID();
  const providerUserId = crypto.randomUUID();
  seedServiceRequest(repository, { serviceRequestId, reviewerUserId, providerUserId });

  const created = service.createReview({
    idempotencyKey: "idem-pg-1",
    serviceRequestId,
    reviewerUserId,
    providerUserId,
    rating: 5,
    comment: "Persisted in postgres",
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  const loaded = repository.getReviewById(created.review.id);
  assert.equal(loaded.rating, 5);
  assert.equal(loaded.comment, "Persisted in postgres");

  const events = repository.listEvents();
  assert.equal(events.length, 2);
  assert.equal(events[0].eventName, "review_eligibility_checked.v1");
  assert.equal(events[1].eventName, "review_created.v1");

  dropSchema(DATABASE_URL, schema);
});

test("postgres idempotency parity", { skip: !hasDatabase }, () => {
  const schema = `rat8_${Date.now()}_idem`;
  runPostgresMigrations({ databaseUrl: DATABASE_URL, schema });
  const repository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });
  const service = new ReviewService({ repository });
  const serviceRequestId = crypto.randomUUID();
  const reviewerUserId = crypto.randomUUID();
  const providerUserId = crypto.randomUUID();
  seedServiceRequest(repository, { serviceRequestId, reviewerUserId, providerUserId });
  const input = {
    idempotencyKey: "idem-pg-2",
    serviceRequestId,
    reviewerUserId,
    providerUserId,
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

  dropSchema(DATABASE_URL, schema);
});

test("postgres lifecycle migration enforces report idempotency and aggregate constraints", { skip: !hasDatabase }, () => {
  const schema = `rat8_${Date.now()}_lifecycle`;
  runPostgresMigrations({ databaseUrl: DATABASE_URL, schema });
  const repository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });
  const service = new ReviewService({ repository });
  const serviceRequestId = crypto.randomUUID();
  const reviewerUserId = crypto.randomUUID();
  const providerUserId = crypto.randomUUID();
  seedServiceRequest(repository, { serviceRequestId, reviewerUserId, providerUserId });

  const created = service.createReview({
    idempotencyKey: "idem-pg-3",
    serviceRequestId,
    reviewerUserId,
    providerUserId,
    rating: 5,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  repository.exec(`
    insert into review_reports (
      review_id, reporter_user_id, reason_code, status, idempotency_key
    ) values (
      ${lit(created.review.id)}::uuid,
      ${lit(crypto.randomUUID())}::uuid,
      'spam',
      'queued',
      'pg-report-idem-1'
    )
  `);

  assert.throws(() => {
    repository.exec(`
      insert into review_reports (
        review_id, reporter_user_id, reason_code, status, idempotency_key
      ) values (
        ${lit(created.review.id)}::uuid,
        ${lit(crypto.randomUUID())}::uuid,
        'fraud',
        'queued',
        'pg-report-idem-1'
      )
    `);
  });

  assert.throws(() => {
    repository.exec(`
      insert into review_aggregates (
        provider_user_id, total_reviews, rating_sum, average_rating
      ) values (
        ${lit(created.review.providerUserId)}::uuid,
        -1,
        5,
        5
      )
    `);
  });

  dropSchema(DATABASE_URL, schema);
});

test("postgres storage-backed appeal state works across service instances", { skip: !hasDatabase }, () => {
  const schema = `rat8_${Date.now()}_appeal_persist`;
  runPostgresMigrations({ databaseUrl: DATABASE_URL, schema });
  const repository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });

  const serviceRequestId = crypto.randomUUID();
  const reviewerUserId = crypto.randomUUID();
  const providerUserId = crypto.randomUUID();
  seedServiceRequest(repository, { serviceRequestId, reviewerUserId, providerUserId });

  const serviceA = new ReviewService({ repository, appealReopenCooldownMs: 60 * 60 * 1000 });
  const created = serviceA.createReview({
    idempotencyKey: "idem-pg-appeal-persist-1",
    serviceRequestId,
    reviewerUserId,
    providerUserId,
    rating: 5,
    serviceCompletedAt: "2026-05-07T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-07T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  const opened = serviceA.openAppeal({
    reviewId: created.review.id,
    actor: { id: created.review.reviewerUserId, roles: ["customer"] },
    note: "Primera apelacion persistida en postgres.",
    idempotencyKey: "idem-pg-appeal-persist-open-1",
    now: "2026-05-07T01:00:00.000Z",
  });
  assert.equal(opened.ok, true);

  const serviceB = new ReviewService({ repository, appealReopenCooldownMs: 60 * 60 * 1000 });
  const closed = serviceB.closeAppeal({
    reviewId: created.review.id,
    actor: { id: "mod-pg-appeal-persist-1", roles: ["moderator"] },
    appealId: opened.appeal.id,
    resolution: "rejected",
    idempotencyKey: "idem-pg-appeal-persist-close-1",
    now: "2026-05-07T01:10:00.000Z",
  });
  assert.equal(closed.ok, true);

  const deniedDuringCooldown = serviceB.openAppeal({
    reviewId: created.review.id,
    actor: { id: created.review.reviewerUserId, roles: ["customer"] },
    note: "Reapertura en cooldown sobre postgres.",
    idempotencyKey: "idem-pg-appeal-persist-open-2",
    resume: true,
    now: "2026-05-07T01:20:00.000Z",
  });
  assert.equal(deniedDuringCooldown.ok, false);
  assert.equal(deniedDuringCooldown.code, "appeal_cooldown_active");

  dropSchema(DATABASE_URL, schema);
});

function dropSchema(databaseUrl, schema) {
  execFileSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-d", databaseUrl, "-c", `drop schema if exists "${schema}" cascade`], { stdio: "pipe" });
}

function lit(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function seedServiceRequest(repository, { serviceRequestId, reviewerUserId, providerUserId }) {
  repository.exec(`
    insert into providers (user_id, category, city, status, rating, base_price_ars)
    values (
      ${lit(providerUserId)}::uuid,
      'cleaning',
      'Buenos Aires',
      'active',
      4.5,
      20000
    )
    on conflict (user_id) do nothing
  `);

  repository.exec(`
    insert into service_requests (
      id,
      customer_user_id,
      provider_user_id,
      category,
      city,
      notes,
      scheduled_at,
      status,
      idempotency_key
    ) values (
      ${lit(serviceRequestId)}::uuid,
      ${lit(reviewerUserId)}::uuid,
      ${lit(providerUserId)}::uuid,
      'cleaning',
      'Buenos Aires',
      'Seed request for RAT-321 postgres integration',
      '2026-05-07T00:00:00.000Z'::timestamptz,
      'completed',
      ${lit(`seed-${serviceRequestId}`)}
    )
    on conflict (id) do nothing
  `);
}
