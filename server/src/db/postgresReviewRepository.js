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
