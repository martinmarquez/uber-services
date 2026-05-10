-- RAT-321 review lifecycle backend extensions (v1)
-- Adds reports, tags and provider aggregates with integrity constraints.

create table if not exists review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  reporter_user_id uuid not null,
  reason_code text not null check (char_length(reason_code) between 3 and 64),
  description text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'resolved', 'rejected')),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_review_reports_review_status
  on review_reports (review_id, status, created_at desc);

create index if not exists idx_review_reports_reporter_created
  on review_reports (reporter_user_id, created_at desc);

create table if not exists review_tags (
  review_id uuid not null references reviews(id) on delete cascade,
  tag text not null check (char_length(tag) between 2 and 40),
  source text not null default 'system' check (source in ('system', 'moderator')),
  created_at timestamptz not null default now(),
  primary key (review_id, tag)
);

create index if not exists idx_review_tags_tag_created
  on review_tags (tag, created_at desc);

create table if not exists review_aggregates (
  provider_user_id uuid primary key,
  total_reviews integer not null default 0 check (total_reviews >= 0),
  rating_sum integer not null default 0 check (rating_sum >= 0),
  average_rating numeric(3,2) not null default 0 check (average_rating >= 0 and average_rating <= 5),
  last_review_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at_review_aggregates()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_set_updated_at_review_aggregates on review_aggregates;
create trigger trg_set_updated_at_review_aggregates
before update on review_aggregates
for each row
execute procedure set_updated_at_review_aggregates();
