create table if not exists review_responses (
  id text primary key,
  review_id text not null references reviews(id) on delete cascade,
  responder_user_id text not null,
  message text not null,
  status text not null default 'active',
  created_at text not null,
  updated_at text not null,
  unique(review_id)
);

create table if not exists review_appeals (
  id text primary key,
  review_id text not null references reviews(id) on delete cascade,
  appellant_user_id text not null,
  note text not null,
  status text not null default 'queued',
  created_at text not null,
  resolved_at text
);

create index if not exists idx_review_appeals_review_status
  on review_appeals(review_id, status, created_at desc);

create unique index if not exists idx_review_appeals_single_open
  on review_appeals(review_id)
  where status = 'queued';
