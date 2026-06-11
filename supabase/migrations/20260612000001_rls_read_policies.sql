-- Enable RLS on all tables
alter table propositions enable row level security;
alter table practices enable row level security;
alter table offerings enable row level security;
alter table cases enable row level security;

-- Authenticated users can read all reference data
create policy "authenticated users can read propositions"
  on propositions for select to authenticated using (true);

create policy "authenticated users can read practices"
  on practices for select to authenticated using (true);

create policy "authenticated users can read offerings"
  on offerings for select to authenticated using (true);

create policy "authenticated users can read cases"
  on cases for select to authenticated using (true);
