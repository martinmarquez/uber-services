-- RAT-8 core reviews schema (draft v1)
-- Source contracts: RAT-45, RAT-42

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type review_status as enum ('verificada', 'en_revision', 'no_recomendada', 'removida');
  end if;
  if not exists (select 1 from pg_type where typname = 'eligibility_result') then
    create type eligibility_result as enum ('eligible', 'ineligible');
  end if;
  if not exists (select 1 from pg_type where typname = 'eligibility_reason') then
    create type eligibility_reason as enum (
      'service_not_completed',
      'outside_14_day_window',
      'identity_mismatch',
      'duplicate_review',
      'rate_limited',
      'other_policy_violation'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'review_event_name') then
    create type review_event_name as enum (
      'review_eligibility_checked.v1',
      'review_eligibility_failed.v1',
      'review_created.v1',
      'review_sent_to_moderation.v1',
      'review_moderation_decided.v1',
      'review_published.v1',
      'review_removed.v1',
      'review_appeal_opened.v1',
      'review_appeal_closed.v1'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'review_actor_type') then
    create type review_actor_type as enum ('system', 'user', 'moderator');
  end if;
end $$;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null,
  reviewer_user_id uuid not null,
  provider_user_id uuid not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  status review_status not null default 'verificada',
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  eligibility_result eligibility_result not null default 'eligible',
  eligibility_reason eligibility_reason,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_unique_active_per_pair unique (service_request_id, reviewer_user_id)
);

create table if not exists review_events (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete restrict,
  event_name review_event_name not null,
  event_version text not null default 'v1',
  occurred_at timestamptz not null default now(),
  actor_type review_actor_type not null,
  actor_id text not null,
  correlation_id text not null,
  idempotency_key text not null,
  payload_json jsonb not null,
  integrity_hash text not null,
  created_at timestamptz not null default now(),
  constraint review_events_unique_idempotency unique (event_name, idempotency_key)
);

create index if not exists idx_reviews_provider_created_at
  on reviews (provider_user_id, created_at desc);

create index if not exists idx_review_events_review_id_occurred_at
  on review_events (review_id, occurred_at desc);

create or replace function set_updated_at_reviews()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_set_updated_at_reviews on reviews;
create trigger trg_set_updated_at_reviews
before update on reviews
for each row
execute procedure set_updated_at_reviews();
