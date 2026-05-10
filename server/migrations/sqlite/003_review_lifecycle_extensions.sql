create table if not exists review_reports (
  id text primary key,
  review_id text not null references reviews(id) on delete cascade,
  reporter_user_id text not null,
  reason_code text not null check (length(reason_code) between 3 and 64),
  description text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'resolved', 'rejected')),
  idempotency_key text not null unique,
  created_at text not null,
  resolved_at text
);

create index if not exists idx_review_reports_review_status
  on review_reports(review_id, status, created_at desc);

create index if not exists idx_review_reports_reporter_created
  on review_reports(reporter_user_id, created_at desc);

create table if not exists review_tags (
  review_id text not null references reviews(id) on delete cascade,
  tag text not null check (length(tag) between 2 and 40),
  source text not null default 'system' check (source in ('system', 'moderator')),
  created_at text not null,
  primary key (review_id, tag)
);

create index if not exists idx_review_tags_tag_created
  on review_tags(tag, created_at desc);

create table if not exists review_aggregates (
  provider_user_id text primary key,
  total_reviews integer not null default 0 check (total_reviews >= 0),
  rating_sum integer not null default 0 check (rating_sum >= 0),
  average_rating real not null default 0 check (average_rating >= 0 and average_rating <= 5),
  last_review_at text,
  updated_at text not null
);
