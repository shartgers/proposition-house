-- Authenticated users can insert and delete cases
-- (rls_mutation_policies added only an update policy for cases — for nullifying
--  offering_id — so Add case (insert) and delete from the Case library hit RLS
--  error 42501)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'cases'
      and policyname = 'authenticated users can insert cases'
  ) then
    create policy "authenticated users can insert cases"
      on cases for insert to authenticated with check (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'cases'
      and policyname = 'authenticated users can delete cases'
  ) then
    create policy "authenticated users can delete cases"
      on cases for delete to authenticated using (true);
  end if;
end $$;
