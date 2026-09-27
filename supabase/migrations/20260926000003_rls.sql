-- Seguridad: cualquiera lee lo público, solo el admin escribe.

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;
alter table public.teams enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.rounds enable row level security;
alter table public.matches enable row level security;
alter table public.match_results enable row level security;
alter table public.tournament_photos enable row level security;
alter table public.site_settings enable row level security;

-- admins: cada usuario solo puede ver su propia fila; nadie escribe desde la API.
create policy "admins_select_self" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- teams
create policy "teams_public_read" on public.teams
  for select to anon, authenticated using (true);
create policy "teams_admin_write" on public.teams
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- tournaments: los borradores solo los ve el admin.
create policy "tournaments_public_read" on public.tournaments
  for select to anon, authenticated using (status <> 'borrador' or (select public.is_admin()));
create policy "tournaments_admin_write" on public.tournaments
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Tablas hijas: visibles si el torneo padre es visible (el RLS de tournaments se aplica en el EXISTS).
create policy "tournament_teams_public_read" on public.tournament_teams
  for select to anon, authenticated
  using (exists (select 1 from public.tournaments t where t.id = tournament_id));
create policy "tournament_teams_admin_write" on public.tournament_teams
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "rounds_public_read" on public.rounds
  for select to anon, authenticated
  using (exists (select 1 from public.tournaments t where t.id = tournament_id));
create policy "rounds_admin_write" on public.rounds
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "matches_public_read" on public.matches
  for select to anon, authenticated
  using (exists (select 1 from public.rounds r where r.id = round_id));
create policy "matches_admin_write" on public.matches
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "match_results_public_read" on public.match_results
  for select to anon, authenticated
  using (exists (select 1 from public.matches m where m.id = match_id));
create policy "match_results_admin_write" on public.match_results
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "tournament_photos_public_read" on public.tournament_photos
  for select to anon, authenticated
  using (exists (select 1 from public.tournaments t where t.id = tournament_id));
create policy "tournament_photos_admin_write" on public.tournament_photos
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings_admin_update" on public.site_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
