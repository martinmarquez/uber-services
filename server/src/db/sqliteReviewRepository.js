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

  createReviewReport(report) {
    this.db.prepare(`
      insert into review_reports (
        id, review_id, reporter_user_id, reason_code, description, status, idempotency_key, created_at, resolved_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      report.id,
      report.reviewId,
      report.reporterUserId,
      report.reasonCode,
      report.description,
      report.status,
      report.idempotencyKey,
      report.createdAt,
      report.resolvedAt ?? null,
    );
  }

  upsertReviewResponse(response) {
    this.db.prepare(`
      insert into review_responses (
        id, review_id, responder_user_id, message, status, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?)
      on conflict(review_id) do update set
        message = excluded.message,
        status = excluded.status,
        updated_at = excluded.updated_at
    `).run(
      response.id,
      response.reviewId,
      response.responderUserId,
      response.message,
      response.status,
      response.createdAt,
      response.updatedAt,
    );
  }

  upsertAppeal(appeal) {
    this.db.prepare(`
      insert into review_appeals (
        id, review_id, appellant_user_id, note, status, created_at, resolved_at
      ) values (?, ?, ?, ?, ?, ?, ?)
      on conflict(id) do update set
        note = excluded.note,
        status = excluded.status,
        resolved_at = excluded.resolved_at
    `).run(
      appeal.id,
      appeal.reviewId,
      appeal.actorId,
      appeal.note,
      toAppealStatus(appeal.status),
      appeal.createdAt,
      appeal.closedAt ?? null,
    );
  }

  listAppealsByReviewId(reviewId) {
    const rows = this.db.prepare(`
      select *
      from review_appeals
      where review_id = ?
      order by created_at asc
    `).all(reviewId);
    return rows.map((row) => ({
      id: row.id,
      reviewId: row.review_id,
      actorId: row.appellant_user_id,
      note: row.note,
      status: fromAppealStatus(row.status),
      createdAt: row.created_at,
      closedAt: row.resolved_at ?? null,
      resolution: row.status === "resolved" ? "accepted" : row.status === "rejected" ? "rejected" : undefined,
    }));
  }

  upsertReviewTag({ reviewId, tag, source = "moderator", createdAt }) {
    this.db.prepare(`
      insert into review_tags (review_id, tag, source, created_at)
      values (?, ?, ?, ?)
      on conflict(review_id, tag) do update set source = excluded.source
    `).run(reviewId, tag, source, createdAt ?? new Date().toISOString());
  }

  recomputeProviderAggregate(providerUserId) {
    const row = this.db.prepare(`
      select
        count(*) as total_reviews,
        coalesce(sum(rating), 0) as rating_sum,
        coalesce(avg(rating), 0) as avg_rating,
        max(created_at) as last_review_at
      from reviews
      where provider_user_id = ? and status = 'verificada'
    `).get(providerUserId);
    const totalReviews = Number(row?.total_reviews ?? 0);
    const ratingSum = Number(row?.rating_sum ?? 0);
    const averageRating = Number((Number(row?.avg_rating ?? 0)).toFixed(2));
    const lastReviewAt = row?.last_review_at ?? null;
    const now = new Date().toISOString();

    this.db.prepare(`
      insert into review_aggregates (
        provider_user_id, total_reviews, rating_sum, average_rating, last_review_at, updated_at
      ) values (?, ?, ?, ?, ?, ?)
      on conflict(provider_user_id) do update set
        total_reviews = excluded.total_reviews,
        rating_sum = excluded.rating_sum,
        average_rating = excluded.average_rating,
        last_review_at = excluded.last_review_at,
        updated_at = excluded.updated_at
    `).run(providerUserId, totalReviews, ratingSum, averageRating, lastReviewAt, now);
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

function toAppealStatus(status) {
  if (status === "closed") return "resolved";
  return "queued";
}

function fromAppealStatus(status) {
  if (status === "resolved" || status === "rejected") return "closed";
  return "open";
}
