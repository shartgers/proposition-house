create table practices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  practice_owner text not null,
  created_at timestamptz not null default now()
);
