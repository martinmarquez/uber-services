create table if not exists reviews (
  id text primary key,
  service_request_id text not null,
  reviewer_user_id text not null,
  provider_user_id text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null check (status in ('verificada', 'en_revision', 'no_recomendada', 'removida')),
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  created_at text not null,
  updated_at text not null
);

create unique index if not exists idx_reviews_pair_unique
  on reviews(service_request_id, reviewer_user_id);

create index if not exists idx_reviews_provider_created
  on reviews(provider_user_id, created_at desc);

create table if not exists review_events (
  event_id text primary key,
  review_id text,
  event_name text not null,
  event_version text not null,
  occurred_at text not null,
  correlation_id text not null,
  idempotency_key text not null,
  actor_type text not null,
  actor_id text not null,
  payload_json text not null,
  previous_event_hash text,
  integrity_hash text not null,
  signature text not null,
  signature_algorithm text not null,
  signature_key_id text not null
);

create unique index if not exists idx_review_events_idempotency
  on review_events(event_name, idempotency_key);

create table if not exists idempotency_records (
  key text primary key,
  result_json text not null,
  expires_at integer not null
);
