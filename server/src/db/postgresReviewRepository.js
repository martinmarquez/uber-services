import { execFileSync } from "node:child_process";

export class PostgresReviewRepository {
  constructor({ databaseUrl, schema = "public" }) {
    this.databaseUrl = databaseUrl;
    this.schema = schema;
  }

  hasReviewPair(serviceRequestId, reviewerUserId) {
    const row = this.queryJson(`
      select row_to_json(t) as row
      from (
        select 1 as found
        from reviews
        where service_request_id = ${lit(serviceRequestId)} and reviewer_user_id = ${lit(reviewerUserId)}
        limit 1
      ) t
    `);
    return Boolean(row?.found);
  }

  createReview(review) {
    this.exec(`
      insert into reviews (
        id, service_request_id, reviewer_user_id, provider_user_id, rating, comment, status, risk_score, eligibility_result, created_at, updated_at
      ) values (
        ${lit(review.id)},
        ${lit(review.serviceRequestId)}::uuid,
        ${lit(review.reviewerUserId)}::uuid,
        ${lit(review.providerUserId)}::uuid,
        ${num(review.rating)},
        ${nullable(review.comment)},
        ${lit(review.status)}::review_status,
        ${num(review.riskScore)},
        'eligible'::eligibility_result,
        ${lit(review.createdAt)}::timestamptz,
        ${lit(review.updatedAt)}::timestamptz
      )
    `);
  }

  getReviewById(reviewId) {
    const row = this.queryJson(`
      select row_to_json(t) as row
      from (
        select
          id::text as id,
          service_request_id::text as "serviceRequestId",
          reviewer_user_id::text as "reviewerUserId",
          provider_user_id::text as "providerUserId",
          rating,
          comment,
          status::text as status,
          risk_score as "riskScore",
          created_at::text as "createdAt",
          updated_at::text as "updatedAt"
        from reviews
        where id = ${lit(reviewId)}::uuid
      ) t
    `);
    return row ?? null;
  }

  updateReview(review) {
    this.exec(`
      update reviews
      set rating = ${num(review.rating)},
          comment = ${nullable(review.comment)},
          status = ${lit(review.status)}::review_status,
          updated_at = ${lit(review.updatedAt)}::timestamptz
      where id = ${lit(review.id)}::uuid
    `);
  }

  createReviewReport(report) {
    this.exec(`
      insert into review_reports (
        id, review_id, reporter_user_id, reason_code, description, status, idempotency_key, created_at, resolved_at
      ) values (
        ${lit(report.id)}::uuid,
        ${lit(report.reviewId)}::uuid,
        ${lit(report.reporterUserId)}::uuid,
        ${lit(report.reasonCode)},
        ${nullable(report.description)},
        ${lit(report.status)},
        ${lit(report.idempotencyKey)},
        ${lit(report.createdAt)}::timestamptz,
        ${nullable(report.resolvedAt)}::timestamptz
      )
    `);
  }

  upsertReviewResponse(response) {
    this.exec(`
      insert into review_responses (
        id, review_id, responder_user_id, message, status, created_at, updated_at
      ) values (
        ${lit(response.id)}::uuid,
        ${lit(response.reviewId)}::uuid,
        ${lit(response.responderUserId)}::uuid,
        ${lit(response.message)},
        ${lit(response.status)},
        ${lit(response.createdAt)}::timestamptz,
        ${lit(response.updatedAt)}::timestamptz
      )
      on conflict (review_id) do update set
        message = excluded.message,
        status = excluded.status,
        updated_at = excluded.updated_at
    `);
  }

  upsertAppeal(appeal) {
    this.exec(`
      insert into review_appeals (
        id, review_id, appellant_user_id, note, status, created_at, resolved_at
      ) values (
        ${lit(appeal.id)}::uuid,
        ${lit(appeal.reviewId)}::uuid,
        ${lit(appeal.actorId)},
        ${lit(appeal.note)},
        ${lit(toAppealStatus(appeal.status))},
        ${lit(appeal.createdAt)}::timestamptz,
        ${nullable(appeal.closedAt)}::timestamptz
      )
      on conflict (id) do update set
        note = excluded.note,
        status = excluded.status,
        resolved_at = excluded.resolved_at
    `);
  }

  listAppealsByReviewId(reviewId) {
    return this.queryJsonArray(`
      select row_to_json(t) as row
      from (
        select
          id::text as id,
          review_id::text as "reviewId",
          appellant_user_id as "actorId",
          note,
          status,
          created_at::text as "createdAt",
          resolved_at::text as "closedAt"
        from review_appeals
        where review_id = ${lit(reviewId)}::uuid
        order by created_at asc
      ) t
    `).map((row) => ({
      ...row,
      status: fromAppealStatus(row.status),
      resolution: row.status === "resolved" ? "accepted" : row.status === "rejected" ? "rejected" : undefined,
    }));
  }

  getAppealById(appealId) {
    const row = this.queryJson(`
      select row_to_json(t) as row
      from (
        select
          id::text as id,
          review_id::text as "reviewId",
          appellant_user_id as "actorId",
          note,
          status,
          created_at::text as "createdAt",
          resolved_at::text as "closedAt"
        from review_appeals
        where id = ${lit(appealId)}::uuid
      ) t
    `);
    if (!row) return null;
    return {
      ...row,
      status: fromAppealStatus(row.status),
      resolution: row.status === "resolved" ? "accepted" : row.status === "rejected" ? "rejected" : undefined,
    };
  }

  upsertReviewTag({ reviewId, tag, source = "moderator", createdAt }) {
    this.exec(`
      insert into review_tags (review_id, tag, source, created_at)
      values (
        ${lit(reviewId)}::uuid,
        ${lit(tag)},
        ${lit(source)},
        ${lit(createdAt ?? new Date().toISOString())}::timestamptz
      )
      on conflict (review_id, tag) do update set source = excluded.source
    `);
  }

  recomputeProviderAggregate(providerUserId) {
    this.exec(`
      with summary as (
        select
          count(*)::integer as total_reviews,
          coalesce(sum(rating), 0)::integer as rating_sum,
          coalesce(avg(rating), 0)::numeric(3,2) as average_rating,
          max(created_at) as last_review_at
        from reviews
        where provider_user_id = ${lit(providerUserId)}::uuid and status = 'verificada'::review_status
      )
      insert into review_aggregates (
        provider_user_id, total_reviews, rating_sum, average_rating, last_review_at, updated_at
      )
      select
        ${lit(providerUserId)}::uuid,
        summary.total_reviews,
        summary.rating_sum,
        summary.average_rating,
        summary.last_review_at,
        now()
      from summary
      on conflict (provider_user_id) do update set
        total_reviews = excluded.total_reviews,
        rating_sum = excluded.rating_sum,
        average_rating = excluded.average_rating,
        last_review_at = excluded.last_review_at,
        updated_at = excluded.updated_at
    `);
  }

  listProviderReviews(providerUserId, limit) {
    return this.queryJsonArray(`
      select row_to_json(t) as row
      from (
        select
          id::text as id,
          service_request_id::text as "serviceRequestId",
          reviewer_user_id::text as "reviewerUserId",
          provider_user_id::text as "providerUserId",
          rating,
          comment,
          status::text as status,
          risk_score as "riskScore",
          created_at::text as "createdAt",
          updated_at::text as "updatedAt"
        from reviews
        where provider_user_id = ${lit(providerUserId)}::uuid and status = 'verificada'::review_status
        order by created_at desc
        limit ${num(limit)}
      ) t
    `);
  }

  saveIdempotent(key, result, expiresAt) {
    this.exec(`
      insert into idempotency_records (key, result_json, expires_at)
      values (${lit(key)}, ${lit(JSON.stringify(result))}, ${num(expiresAt)})
      on conflict (key) do update set
        result_json = excluded.result_json,
        expires_at = excluded.expires_at
    `);
  }

  getIdempotent(key) {
    const row = this.queryJson(`
      select row_to_json(t) as row
      from (
        select result_json, expires_at
        from idempotency_records
        where key = ${lit(key)}
      ) t
    `);
    if (!row) return null;
    if (Date.now() > Number(row.expires_at)) return null;
    return JSON.parse(row.result_json);
  }

  appendEvent(event) {
    this.exec(`
      insert into review_events (
        id, review_id, event_name, event_version, occurred_at, actor_type, actor_id, correlation_id, idempotency_key, payload_json, integrity_hash
      ) values (
        ${lit(event.eventId)}::uuid,
        ${event.reviewId ? `${lit(event.reviewId)}::uuid` : "null"},
        ${lit(event.eventName)}::review_event_name,
        ${lit(event.eventVersion)},
        ${lit(event.occurredAt)}::timestamptz,
        ${lit(event.actor.type)}::review_actor_type,
        ${lit(event.actor.id)},
        ${lit(event.correlationId)},
        ${lit(event.idempotencyKey)},
        ${lit(JSON.stringify(event.payload))}::jsonb,
        ${lit(event.integrityHash)}
      )
    `);
  }

  listEvents() {
    return this.queryJsonArray(`
      select row_to_json(t) as row
      from (
        select
          id::text as "eventId",
          review_id::text as "reviewId",
          event_name::text as "eventName",
          event_version as "eventVersion",
          occurred_at::text as "occurredAt",
          correlation_id as "correlationId",
          idempotency_key as "idempotencyKey",
          json_build_object('type', actor_type::text, 'id', actor_id) as actor,
          payload_json as payload,
          integrity_hash as "integrityHash",
          null::text as signature,
          null::text as "signatureAlgorithm",
          null::text as "signatureKeyId",
          null::text as "previousEventHash"
        from review_events
        order by occurred_at asc
      ) t
    `);
  }

  exec(sql) {
    execFileSync("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", this.databaseUrl, "-c", withSchema(sql, this.schema)], { stdio: "pipe" });
  }

  queryJson(sql) {
    const raw = execFileSync(
      "psql",
      ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", this.databaseUrl, "-t", "-A", "-c", withSchema(sql, this.schema)],
      { encoding: "utf8" },
    )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (raw.length === 0) return null;
    return JSON.parse(raw[raw.length - 1]);
  }

  queryJsonArray(sql) {
    const raw = execFileSync(
      "psql",
      ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", this.databaseUrl, "-t", "-A", "-c", withSchema(sql, this.schema)],
      { encoding: "utf8" },
    )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return raw.map((line) => JSON.parse(line));
  }
}

function withSchema(sql, schema) {
  return `set search_path to "${String(schema).replace(/"/g, "\"\"")}"; ${sql}`;
}

function lit(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function num(value) {
  return Number(value);
}

function nullable(value) {
  if (value === null || value === undefined) return "null";
  return lit(value);
}

function toAppealStatus(status) {
  if (status === "closed") return "resolved";
  return "queued";
}

function fromAppealStatus(status) {
  if (status === "resolved" || status === "rejected") return "closed";
  return "open";
}
