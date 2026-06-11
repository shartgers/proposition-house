create table propositions (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- Propositions are fixed — seeded here, not user-editable
insert into propositions (number, name) values
  ('01', 'Clear direction with AI'),
  ('02', 'AI and Agentic Solutions'),
  ('03', 'Intelligent Workflows'),
  ('04', 'Data Foundation'),
  ('05', 'Trusted AI');
