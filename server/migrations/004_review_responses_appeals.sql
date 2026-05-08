create table if not exists review_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  responder_user_id uuid not null,
  message text not null check (char_length(message) between 1 and 500),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_responses_unique_review unique (review_id)
);

create table if not exists review_appeals (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  appellant_user_id text not null,
  note text not null check (char_length(note) between 10 and 2000),
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_review_appeals_review_status
  on review_appeals (review_id, status, created_at desc);
