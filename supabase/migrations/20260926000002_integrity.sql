-- Reglas de integridad que la base garantiza aunque la app falle
-- (dos pestañas abiertas, edición manual desde Supabase, etc.).

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger teams_updated_at before update on public.teams
  for each row execute function public.set_updated_at();
create trigger tournaments_updated_at before update on public.tournaments
  for each row execute function public.set_updated_at();
create trigger match_results_updated_at before update on public.match_results
  for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Inscripción: no se pueden inscribir equipos archivados.
create or replace function public.check_tournament_team_insert()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.teams where id = new.team_id and archived_at is not null) then
    raise exception 'No se puede inscribir un equipo archivado' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger tournament_teams_check_insert before insert on public.tournament_teams
  for each row execute function public.check_tournament_team_insert();

-- Baja de inscripción: bloqueada si el equipo ya tiene cruces en el torneo
-- (salvo cuando viene en cascada por el borrado del torneo).
create or replace function public.check_tournament_team_delete()
returns trigger language plpgsql set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 then
    return old;
  end if;
  if exists (
    select 1
    from public.matches m
    join public.rounds r on r.id = m.round_id
    where r.tournament_id = old.tournament_id
      and old.team_id in (m.team_a_id, m.team_b_id)
  ) then
    raise exception 'El equipo tiene cruces en este torneo y no se puede quitar' using errcode = 'P0001';
  end if;
  return old;
end;
$$;
create trigger tournament_teams_check_delete before delete on public.tournament_teams
  for each row execute function public.check_tournament_team_delete();

-- Fechas: el día debe ser no decreciente según el número. Se valida al final
-- de la transacción para permitir reordenar varias fechas en un solo upsert.
create or replace function public.check_round_dates()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (
    select 1
    from (
      select play_date, lag(play_date) over (order by number) as prev_date
      from public.rounds
      where tournament_id = new.tournament_id
    ) s
    where s.prev_date is not null and s.play_date < s.prev_date
  ) then
    raise exception 'Las fechas del torneo deben estar en orden cronológico' using errcode = 'P0001';
  end if;
  return null;
end;
$$;
create constraint trigger rounds_check_dates
  after insert or update on public.rounds
  deferrable initially deferred
  for each row execute function public.check_round_dates();

-- Fechas: no se puede borrar una fecha con cruces (salvo cascada del torneo).
create or replace function public.check_round_delete()
returns trigger language plpgsql set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 then
    return old;
  end if;
  if exists (select 1 from public.matches where round_id = old.id) then
    raise exception 'La fecha tiene cruces cargados; borralos primero' using errcode = 'P0001';
  end if;
  return old;
end;
$$;
create trigger rounds_check_delete before delete on public.rounds
  for each row execute function public.check_round_delete();

-- Cruces: ambos equipos inscriptos y cada equipo en un solo cruce por fecha.
create or replace function public.check_match_integrity()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_tournament uuid;
begin
  if tg_op = 'UPDATE'
     and (new.team_a_id, new.team_b_id, new.round_id) is distinct from (old.team_a_id, old.team_b_id, old.round_id)
     and exists (select 1 from public.match_results where match_id = old.id) then
    raise exception 'No se pueden cambiar los equipos de un cruce con resultados' using errcode = 'P0001';
  end if;

  -- Serializa las altas concurrentes dentro de la misma fecha.
  perform pg_advisory_xact_lock(hashtext(new.round_id::text));

  select tournament_id into v_tournament from public.rounds where id = new.round_id;

  if (select count(*) from public.tournament_teams
      where tournament_id = v_tournament and team_id in (new.team_a_id, new.team_b_id)) < 2 then
    raise exception 'Ambos equipos deben estar inscriptos en el torneo' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.matches m
    where m.round_id = new.round_id
      and m.id <> new.id
      and (m.team_a_id in (new.team_a_id, new.team_b_id) or m.team_b_id in (new.team_a_id, new.team_b_id))
  ) then
    raise exception 'Uno de los equipos ya tiene un cruce en esta fecha' using errcode = 'P0001';
  end if;

  return new;
end;
$$;
create trigger matches_check_integrity before insert or update on public.matches
  for each row execute function public.check_match_integrity();

-- Resultados: el ganador tiene que ser uno de los dos equipos del cruce.
create or replace function public.check_match_result_winner()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.matches
    where id = new.match_id and new.winner_team_id in (team_a_id, team_b_id)
  ) then
    raise exception 'El ganador debe ser uno de los equipos del cruce' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger match_results_check_winner before insert or update on public.match_results
  for each row execute function public.check_match_result_winner();

-- Torneos: el campeón debe estar inscripto; finished_at acompaña al estado.
create or replace function public.check_tournament()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'finalizado' then
    if new.finished_at is null then
      new.finished_at := now();
    end if;
  else
    new.finished_at := null;
    new.champion_team_id := null;
  end if;

  if new.champion_team_id is not null and not exists (
    select 1 from public.tournament_teams
    where tournament_id = new.id and team_id = new.champion_team_id
  ) then
    raise exception 'El campeón debe ser un equipo inscripto en el torneo' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger tournaments_check before insert or update on public.tournaments
  for each row execute function public.check_tournament();

-- Fotos: la fecha (si se indica) debe pertenecer al mismo torneo.
create or replace function public.check_photo_round()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.round_id is not null and not exists (
    select 1 from public.rounds where id = new.round_id and tournament_id = new.tournament_id
  ) then
    raise exception 'La fecha no pertenece a este torneo' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger tournament_photos_check_round before insert or update on public.tournament_photos
  for each row execute function public.check_photo_round();
