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
