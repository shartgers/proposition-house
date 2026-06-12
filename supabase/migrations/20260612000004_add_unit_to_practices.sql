alter table practices
  add column if not exists unit text
    check (
      unit is null
      or unit in (
        'Strategy & Delivery',
        'AI Solutions',
        'Analytics & Data Engineering',
        'Data Platform Engineering'
      )
    );
