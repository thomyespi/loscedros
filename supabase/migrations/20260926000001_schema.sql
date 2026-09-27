-- Los Cedros Footgolf · Esquema principal
-- Una única fuente de verdad: los resultados por modalidad. Tablas de posiciones,
-- campeones e histórico se derivan en la aplicación.

create type public.tournament_status as enum ('borrador', 'proximo', 'en_curso', 'finalizado');
create type public.modality_type as enum ('individual', 'four_ball', 'foursome');

-- Usuarios con acceso al panel (/vestuario). Se carga a mano: ver README.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  avatar_path text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index teams_name_lower_key on public.teams (lower(btrim(name)));

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 3 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 600),
  cover_path text,
  status public.tournament_status not null default 'borrador',
  champion_team_id uuid references public.teams (id) on delete restrict,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournaments_champion_only_when_finished
    check (status = 'finalizado' or champion_team_id is null)
);
create unique index tournaments_name_lower_key on public.tournaments (lower(btrim(name)));
create index tournaments_status_idx on public.tournaments (status);

create table public.tournament_teams (
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (tournament_id, team_id)
);
create index tournament_teams_team_idx on public.tournament_teams (team_id);

-- "Fechas" del torneo. Siempre se juegan en Los Cedros; solo importa el día.
create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  number integer not null check (number >= 1),
  play_date date not null,
  created_at timestamptz not null default now(),
  unique (tournament_id, number)
);

-- "Cruces": equipo A vs equipo B dentro de una fecha.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  team_a_id uuid not null references public.teams (id) on delete restrict,
  team_b_id uuid not null references public.teams (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint matches_distinct_teams check (team_a_id <> team_b_id)
);
create index matches_round_idx on public.matches (round_id);
create index matches_team_a_idx on public.matches (team_a_id);
create index matches_team_b_idx on public.matches (team_b_id);

-- Ganador de cada modalidad de un cruce. Sin empates: cada fila = 3 puntos al ganador.
create table public.match_results (
  match_id uuid not null references public.matches (id) on delete cascade,
  modality public.modality_type not null,
  winner_team_id uuid not null references public.teams (id) on delete restrict,
  score_note varchar(20),
  updated_at timestamptz not null default now(),
  primary key (match_id, modality)
);

create table public.tournament_photos (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  round_id uuid references public.rounds (id) on delete set null,
  path text not null,
  caption text check (char_length(caption) <= 140),
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index tournament_photos_tournament_idx on public.tournament_photos (tournament_id, sort_order);

-- Datos del club editables desde el panel (una sola fila).
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  opening_hours text not null check (char_length(opening_hours) between 3 and 80),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  instagram text not null check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  address text not null check (char_length(address) between 5 and 160),
  updated_at timestamptz not null default now()
);
