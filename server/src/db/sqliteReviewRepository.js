import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export class SqliteReviewRepository {
  constructor(options = {}) {
    const filename = options.filename ?? ":memory:";
    if (filename !== ":memory:") fs.mkdirSync(path.dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
  }

  applyMigration(sql) {
    this.db.exec(sql);
  }

  hasReviewPair(serviceRequestId, reviewerUserId) {
    const row = this.db.prepare(
      "select 1 as found from reviews where service_request_id = ? and reviewer_user_id = ? limit 1",
    ).get(serviceRequestId, reviewerUserId);
    return Boolean(row?.found);
  }

  createReview(review) {
    this.db.prepare(`
      insert into reviews (
        id, service_request_id, reviewer_user_id, provider_user_id, rating, comment, status, risk_score, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      review.id,
      review.serviceRequestId,
      review.reviewerUserId,
      review.providerUserId,
      review.rating,
      review.comment,
      review.status,
      review.riskScore,
      review.createdAt,
      review.updatedAt,
    );
  }

  getReviewById(reviewId) {
    const row = this.db.prepare("select * from reviews where id = ?").get(reviewId);
    return row ? mapReviewRow(row) : null;
  }

  updateReview(review) {
    this.db.prepare(`
      update reviews
      set rating = ?, comment = ?, status = ?, updated_at = ?
      where id = ?
    `).run(review.rating, review.comment, review.status, review.updatedAt, review.id);
  }

  listProviderReviews(providerUserId, limit) {
    const rows = this.db.prepare(`
      select * from reviews
      where provider_user_id = ? and status = 'verificada'
      order by created_at desc
      limit ?
    `).all(providerUserId, limit);
    return rows.map(mapReviewRow);
  }

  saveIdempotent(key, result, expiresAt) {
    this.db.prepare(`
      insert into idempotency_records(key, result_json, expires_at)
      values (?, ?, ?)
      on conflict(key) do update set result_json = excluded.result_json, expires_at = excluded.expires_at
    `).run(key, JSON.stringify(result), expiresAt);
  }

  getIdempotent(key) {
    const row = this.db.prepare("select result_json, expires_at from idempotency_records where key = ?").get(key);
    if (!row) return null;
    if (Date.now() > Number(row.expires_at)) return null;
    return JSON.parse(row.result_json);
  }

  appendEvent(event) {
    this.db.prepare(`
      insert into review_events (
        event_id, review_id, event_name, event_version, occurred_at, correlation_id, idempotency_key,
        actor_type, actor_id, payload_json, previous_event_hash, integrity_hash, signature, signature_algorithm, signature_key_id
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.eventId,
      event.reviewId,
      event.eventName,
      event.eventVersion,
      event.occurredAt,
      event.correlationId,
      event.idempotencyKey,
      event.actor.type,
      event.actor.id,
      JSON.stringify(event.payload),
      event.previousEventHash ?? null,
      event.integrityHash,
      event.signature,
      event.signatureAlgorithm,
      event.signatureKeyId,
    );
  }

  listEvents() {
    const rows = this.db.prepare("select * from review_events order by occurred_at asc").all();
    return rows.map((row) => ({
      eventId: row.event_id,
      reviewId: row.review_id,
      eventName: row.event_name,
      eventVersion: row.event_version,
      occurredAt: row.occurred_at,
      correlationId: row.correlation_id,
      idempotencyKey: row.idempotency_key,
      actor: { type: row.actor_type, id: row.actor_id },
      payload: JSON.parse(row.payload_json),
      previousEventHash: row.previous_event_hash,
      integrityHash: row.integrity_hash,
      signature: row.signature,
      signatureAlgorithm: row.signature_algorithm,
      signatureKeyId: row.signature_key_id,
    }));
  }
}

function mapReviewRow(row) {
  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    reviewerUserId: row.reviewer_user_id,
    providerUserId: row.provider_user_id,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    riskScore: row.risk_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
