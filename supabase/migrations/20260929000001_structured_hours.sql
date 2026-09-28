-- Horario estructurado: días de la semana (ISO, 1 = lunes … 7 = domingo) + hora de apertura y de cierre.
-- La fila existente queda con el horario real del club (miércoles a domingo, de 10 a 16:30).
-- opening_hours se borra en una migración aparte, después del deploy (así el sitio publicado no se rompe).
alter table public.site_settings
  add column open_days smallint[] not null default '{3,4,5,6,7}'
    check (cardinality(open_days) >= 1 and open_days <@ '{1,2,3,4,5,6,7}'::smallint[]),
  add column opens_at time not null default '10:00',
  add column closes_at time not null default '16:30',
  add constraint site_settings_hours_order check (closes_at > opens_at);
