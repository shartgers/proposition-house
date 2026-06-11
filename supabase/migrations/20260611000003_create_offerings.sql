create table offerings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  key_outcomes text,
  sort_order integer not null default 0,
  proposition_id uuid not null references propositions(id) on delete restrict,
  practice_id uuid references practices(id) on delete set null,
  created_at timestamptz not null default now()
);

create index offerings_proposition_id_sort_order_idx
  on offerings(proposition_id, sort_order);
