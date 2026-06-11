create type proof_level as enum ('High', 'Medium-High', 'Medium', 'Low-Medium', 'Ongoing');

create table cases (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  sector text not null,
  date_range text not null,
  proof_level proof_level not null,
  description text not null,
  result text not null,
  proposition_id uuid not null references propositions(id) on delete restrict,
  offering_id uuid references offerings(id) on delete set null,
  created_at timestamptz not null default now()
);

create index cases_proposition_id_idx on cases(proposition_id);
create index cases_offering_id_idx on cases(offering_id);
