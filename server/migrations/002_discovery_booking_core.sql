-- RAT-129 discovery + booking schema (draft v1)
-- ADR aligned: modular monolith, REST v1, Postgres source-of-truth

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'provider_status') then
    create type provider_status as enum ('active', 'paused', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'service_request_status') then
    create type service_request_status as enum ('requested', 'accepted', 'declined', 'completed', 'cancelled');
  end if;
end $$;

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  category text not null,
  city text not null,
  status provider_status not null default 'active',
  rating numeric(3,2) not null default 0,
  base_price_ars integer not null check (base_price_ars >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null,
  provider_user_id uuid not null,
  category text not null,
  city text not null,
  notes text not null,
  scheduled_at timestamptz not null,
  status service_request_status not null default 'requested',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_requests_provider_fk
    foreign key (provider_user_id) references providers(user_id) on delete restrict
);

create index if not exists idx_providers_discovery
  on providers (category, city, status, rating desc);

create index if not exists idx_service_requests_customer_created_at
  on service_requests (customer_user_id, created_at desc);

create index if not exists idx_service_requests_provider_created_at
  on service_requests (provider_user_id, created_at desc);

create or replace function set_updated_at_providers()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create or replace function set_updated_at_service_requests()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_set_updated_at_providers on providers;
create trigger trg_set_updated_at_providers
before update on providers
for each row
execute procedure set_updated_at_providers();

drop trigger if exists trg_set_updated_at_service_requests on service_requests;
create trigger trg_set_updated_at_service_requests
before update on service_requests
for each row
execute procedure set_updated_at_service_requests();
