-- Practices are ordered manually on the Practices board: new practices and
-- practices dragged into a unit go to the bottom of that unit's list.
alter table practices add column if not exists sort_order integer not null default 0;

-- Backfill existing rows so they keep a stable starting order (current name order).
with ordered as (
  select id, row_number() over (order by name) as rn
  from practices
)
update practices p
  set sort_order = o.rn
  from ordered o
  where p.id = o.id;
