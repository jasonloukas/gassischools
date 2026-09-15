-- Minimal core schema for Gassi Schools OS, created because the
-- connected Supabase project had no existing tables.
create extension if not exists pgcrypto;

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz default now()
);

create table tenders (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  title text,
  destination text,
  start_date date,
  end_date date,
  hotel_name text,
  transport_type text,
  status text not null default 'draft', -- draft / sent / won / lost
  created_at timestamptz default now()
);

alter table schools enable row level security;
alter table tenders enable row level security;
-- No anon/authenticated policies: these are managed by the internal
-- Gassi Schools OS via service role / its own auth, not by this portal.
