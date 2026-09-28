-- Se aplica DESPUÉS de desplegar el código que usa open_days / opens_at / closes_at.
-- El texto libre de horarios ya no se usa.
alter table public.site_settings drop column opening_hours;
