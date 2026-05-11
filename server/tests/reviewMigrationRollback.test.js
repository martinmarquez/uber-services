import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { runPostgresMigrations } from "../src/db/runPostgresMigrations.js";
import { runSqliteMigrations } from "../src/db/runSqliteMigrations.js";
import { PostgresReviewRepository } from "../src/db/postgresReviewRepository.js";
import { SqliteReviewRepository } from "../src/db/sqliteReviewRepository.js";
import { ReviewService } from "../src/domain/reviewService.js";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDatabase = Boolean(DATABASE_URL);

function hasReviewTablePostgres(repository, tableName) {
  const normalized = repository.queryJson(`
    select row_to_json(t) as row
    from (select to_regclass(${lit(tableName)}) is not null as exists) t
  `);
  return normalized?.exists === true;
}

function hasReviewTableSqlite(repository) {
  const row = repository.db.prepare("select 1 as present from sqlite_master where type = 'table' and name = 'reviews'").get();
  return Boolean(row?.present);
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
      'Seed request for migration rollback checks',
      '2026-05-11T00:00:00.000Z'::timestamptz,
      'completed',
      ${lit(`seed-${serviceRequestId}`)}
    )
    on conflict (id) do nothing
  `);
}

test("sqlite migration up/down/up is reversible and preserves schema assumptions", () => {
  const dbPath = path.join(os.tmpdir(), `rat8-migration-rollback-${Date.now()}.sqlite`);
  runSqliteMigrations({ dbPath });

  const repository = new SqliteReviewRepository({ filename: dbPath });
  const service = new ReviewService({ repository });
  const created = service.createReview({
    idempotencyKey: "idem-sqlite-rollback-1",
    serviceRequestId: "sr-sqlite-rollback-1",
    reviewerUserId: "u-sqlite-rollback-1",
    providerUserId: "p-sqlite-rollback-1",
    rating: 5,
    comment: "for rollback test",
    serviceCompletedAt: "2026-05-11T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-11T00:10:00.000Z",
  });
  assert.equal(created.ok, true);

  runSqliteMigrations({ dbPath, direction: "down" });
  const repositoryAfterDown = new SqliteReviewRepository({ filename: dbPath });
  assert.equal(hasReviewTableSqlite(repositoryAfterDown), false);

  runSqliteMigrations({ dbPath });
  const serviceAfterRollback = new ReviewService({ repository: repositoryAfterDown });
  const recreated = serviceAfterRollback.createReview({
    idempotencyKey: "idem-sqlite-rollback-2",
    serviceRequestId: "sr-sqlite-rollback-2",
    reviewerUserId: "u-sqlite-rollback-2",
    providerUserId: "p-sqlite-rollback-2",
    rating: 4,
    serviceCompletedAt: "2026-05-11T00:00:00.000Z",
    reviewerMatchesParticipant: true,
    now: "2026-05-11T00:20:00.000Z",
  });
  assert.equal(recreated.ok, true);

  fs.rmSync(dbPath, { force: true });
});

test("postgres migration up/down/up is reversible and schema returns", { skip: !hasDatabase }, () => {
  const schema = `rat8_${Date.now()}_rollback`;
  try {
    runPostgresMigrations({ databaseUrl: DATABASE_URL, schema });

    const repository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });
    const serviceRequestId = crypto.randomUUID();
    const reviewerUserId = crypto.randomUUID();
    const providerUserId = crypto.randomUUID();
    seedServiceRequest(repository, { serviceRequestId, reviewerUserId, providerUserId });

    const service = new ReviewService({ repository });
    const created = service.createReview({
      idempotencyKey: "idem-pg-rollback-1",
      serviceRequestId,
      reviewerUserId,
      providerUserId,
      rating: 5,
      comment: "for rollback test",
      serviceCompletedAt: "2026-05-11T00:00:00.000Z",
      reviewerMatchesParticipant: true,
      now: "2026-05-11T00:10:00.000Z",
    });
    assert.equal(created.ok, true);

    runPostgresMigrations({ databaseUrl: DATABASE_URL, schema, direction: "down" });
    const rollbackRepository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });
    assert.equal(hasReviewTablePostgres(rollbackRepository, "reviews"), false);

    runPostgresMigrations({ databaseUrl: DATABASE_URL, schema });
    const finalRepository = new PostgresReviewRepository({ databaseUrl: DATABASE_URL, schema });
    const recreatedServiceRequestId = crypto.randomUUID();
    seedServiceRequest(finalRepository, {
      serviceRequestId: recreatedServiceRequestId,
      reviewerUserId,
      providerUserId,
    });
    const recreatedService = new ReviewService({ repository: finalRepository });
    const recreated = recreatedService.createReview({
      idempotencyKey: "idem-pg-rollback-2",
      serviceRequestId: recreatedServiceRequestId,
      reviewerUserId,
      providerUserId,
      rating: 4,
      serviceCompletedAt: "2026-05-11T00:00:00.000Z",
      reviewerMatchesParticipant: true,
      now: "2026-05-11T00:20:00.000Z",
    });
    assert.equal(recreated.ok, true);
  } finally {
    dropSchema(DATABASE_URL, schema);
  }
});

function dropSchema(databaseUrl, schema) {
  execFileSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-d", databaseUrl, "-c", `drop schema if exists "${schema}" cascade`], { stdio: "pipe" });
}

function lit(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}
