-- Mapa del momento de la cancha: imagen opcional que el admin sube desde /vestuario/club.
-- El archivo vive en el bucket tournament-media (carpeta club/); RLS y políticas de Storage no cambian.
alter table public.site_settings
  add column course_map_path text check (course_map_path is null or course_map_path like 'club/%'),
  add column course_map_width int check (course_map_width > 0),
  add column course_map_height int check (course_map_height > 0);
