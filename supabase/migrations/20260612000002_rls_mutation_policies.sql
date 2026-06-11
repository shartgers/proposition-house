-- Authenticated users can mutate offerings
create policy "authenticated users can insert offerings"
  on offerings for insert to authenticated with check (true);

create policy "authenticated users can update offerings"
  on offerings for update to authenticated using (true);

create policy "authenticated users can delete offerings"
  on offerings for delete to authenticated using (true);

-- Authenticated users can update cases (for nullifying offering_id on delete)
create policy "authenticated users can update cases"
  on cases for update to authenticated using (true);
