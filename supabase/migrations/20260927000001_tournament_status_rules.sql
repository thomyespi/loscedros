-- Reglas de estado del torneo (misma lógica que lib/domain/readiness.ts).
-- Solo se evalúan cuando el estado cambia, así los torneos que ya están en un
-- estado no se ven afectados y los cruces se pueden editar libremente en juego.
--   · a en_curso desde borrador/proximo (o al insertar): la Fecha 1 tiene al menos un cruce.
--     Reabrir un finalizado no se valida.
--   · a finalizado: todas las fechas tienen cruces y todos los cruces sus 3 resultados.
-- Rollback: recrear check_tournament() desde 20260926000002_integrity.sql.

create or replace function public.check_tournament()
returns trigger language plpgsql set search_path = '' as $$
declare
  status_changed boolean := tg_op = 'INSERT' or old.status is distinct from new.status;
  bad_round int;
  total int;
  pending int;
begin
  if status_changed and new.status = 'en_curso'
     and (tg_op = 'INSERT' or old.status in ('borrador', 'proximo')) then
    if not exists (
      select 1
      from public.matches m
      join public.rounds r on r.id = m.round_id
      where r.tournament_id = new.id and r.number = 1
    ) then
      raise exception 'Armá los cruces de la Fecha 1 para arrancar' using errcode = 'P0001';
    end if;
  end if;

  if status_changed and new.status = 'finalizado' then
    if not exists (select 1 from public.rounds where tournament_id = new.id) then
      raise exception 'El torneo no tiene fechas' using errcode = 'P0001';
    end if;

    -- Primera fecha (en orden) vacía o con cruces sin sus 3 resultados.
    select s.number, s.total, s.pending into bad_round, total, pending
    from (
      select r.number,
        (select count(*) from public.matches m where m.round_id = r.id) as total,
        (select count(*) from public.matches m
          where m.round_id = r.id
            and (select count(distinct mr.modality) from public.match_results mr where mr.match_id = m.id) < 3) as pending
      from public.rounds r
      where r.tournament_id = new.id
    ) s
    where s.total = 0 or s.pending > 0
    order by s.number
    limit 1;
    if bad_round is not null and total = 0 then
      raise exception 'La Fecha % no tiene cruces', bad_round using errcode = 'P0001';
    elsif bad_round is not null then
      raise exception 'Faltan resultados en la Fecha % (% %)', bad_round, pending,
        case when pending = 1 then 'cruce' else 'cruces' end
        using errcode = 'P0001';
    end if;
  end if;

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
