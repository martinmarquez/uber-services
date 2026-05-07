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

  const created = service.createReview({
    idempotencyKey: "idem-pg-1",
    serviceRequestId: crypto.randomUUID(),
    reviewerUserId: crypto.randomUUID(),
    providerUserId: crypto.randomUUID(),
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
  const input = {
    idempotencyKey: "idem-pg-2",
    serviceRequestId: crypto.randomUUID(),
    reviewerUserId: crypto.randomUUID(),
    providerUserId: crypto.randomUUID(),
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

function dropSchema(databaseUrl, schema) {
  execFileSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-d", databaseUrl, "-c", `drop schema if exists "${schema}" cascade`], { stdio: "pipe" });
}
