-- Authenticated users can mutate practices
-- (rls_mutation_policies covered offerings and cases but omitted practices,
--  so inserts/updates/deletes from the Practices admin hit RLS error 42501)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'practices'
      and policyname = 'authenticated users can insert practices'
  ) then
    create policy "authenticated users can insert practices"
      on practices for insert to authenticated with check (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'practices'
      and policyname = 'authenticated users can update practices'
  ) then
    create policy "authenticated users can update practices"
      on practices for update to authenticated using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'practices'
      and policyname = 'authenticated users can delete practices'
  ) then
    create policy "authenticated users can delete practices"
      on practices for delete to authenticated using (true);
  end if;
end $$;
