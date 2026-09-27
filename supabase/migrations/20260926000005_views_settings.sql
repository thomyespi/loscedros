-- Resumen por cruce: modalidades cargadas y ganadas por cada equipo.
-- security_invoker: respeta el RLS de quien consulta (el público no ve borradores).
create view public.v_match_summary
with (security_invoker = true)
as
select
  m.id as match_id,
  m.round_id,
  r.tournament_id,
  r.number as round_number,
  r.play_date,
  m.team_a_id,
  m.team_b_id,
  count(mr.modality)::int as results_count,
  count(mr.modality) filter (where mr.winner_team_id = m.team_a_id)::int as team_a_wins,
  count(mr.modality) filter (where mr.winner_team_id = m.team_b_id)::int as team_b_wins,
  (count(mr.modality) = 3) as is_complete
from public.matches m
join public.rounds r on r.id = m.round_id
left join public.match_results mr on mr.match_id = m.id
group by m.id, r.id;

grant select on public.v_match_summary to anon, authenticated;

-- Datos iniciales del club (editables desde /vestuario/club).
insert into public.site_settings (id, opening_hours, whatsapp, instagram, address)
values (
  1,
  'Todos los días de 9 a 19 h',
  '5491139567637',
  'los_cedros_footgolf',
  'César Bacle 1500, B1614 Malvinas Argentinas, Buenos Aires'
)
on conflict (id) do nothing;
