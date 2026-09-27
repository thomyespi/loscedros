-- is_admin() no necesita privilegios elevados: la política admins_select_self ya
-- permite que cada usuario vea solo su propia fila, y anon no ve ninguna.
-- (La 0003 ya la crea así; esta migración refleja el cambio aplicado en producción.)
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
