alter table practices
  add column unit text
    check (
      unit is null
      or unit in (
        'Strategy & Delivery',
        'AI Solutions',
        'Analytics & Data Engineering',
        'Data Platform Engineering'
      )
    );
