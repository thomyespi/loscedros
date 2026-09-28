/**
 * Índice único de las imágenes de la landing. Los archivos viven en /public/landing/
 * y son parte del sitio (no de la base). Para cambiar una: reemplazá el archivo con el
 * mismo nombre, o cambiá acá `file`, dimensiones y `alt`. Las fotos propias del club
 * van sin `credit`; /creditos lista solo las que lo tienen.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit?: { title: string; artist: string; license: string; source: string };
}

const img = (
  file: string,
  width: number,
  height: number,
  alt: string,
  credit?: SiteImage["credit"],
): SiteImage => ({ src: `/landing/${file}`, width, height, alt, credit });

export const media = {
  hero: img("hero.webp", 1920, 1278, "Jugador de footgolf pateando hacia el green", {
    title: "FootGolf Player - Approach",
    artist: "JuanMFernandez2000",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:FootGolf_Player_-_Approach.jpg",
  }),
  heroMobile: img("hero-mobile.webp", 1080, 1623, "Jugador de footgolf junto a la bandera del hoyo", {
    title: "FootGolf Player making a putt",
    artist: "Mastertutti",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:FootGolf_Player_making_a_putt.jpg",
  }),
  teeShot: img("tee-shot.webp", 1600, 1024, "Salida desde el tee frente a un lago", {
    title: "FootGolf Promo 2009",
    artist: "FIFG",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:FootGolf_Promo_2009.jpg",
  }),
  greenGolden: img("green-golden.webp", 1600, 1200, "Jugador en el green al atardecer", {
    title: "Stefano Santoni allenamento al Golf San Miniato (PI)",
    artist: "Stefano Santoni",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Stefano_Santoni_allenamento_al_Golf_San_Miniato_(PI).jpg",
  }),
  flagHill: img("flag-hill.webp", 1600, 1067, "Jugador preparando el putt junto a la bandera", {
    title: "Jamkovisko Golf Club Skalica",
    artist: "Tomas.dittinger",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Jamkovisko_Golf_Club_Skalica.jpg",
  }),
  flag9: img("flag-9.webp", 1600, 1067, "Bandera del hoyo 9 en la cancha", {
    title: "Bradninch, Footgolf Devon",
    artist: "Lewis Clarke",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Bradninch_,_Footgolf_Devon_-_geograph.org.uk_-_7553751.jpg",
  }),
  course: img("course.webp", 1600, 1200, "Vista de la cancha de footgolf", {
    title: "Footgolf - P1520379",
    artist: "El Pantera",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Footgolf_-_P1520379.jpg",
  }),
  teamGroup: img("team-group.webp", 1400, 1302, "Grupo de jugadores posando con sus pelotas", {
    title: "Kikus Capital Cup",
    artist: "Tomas.dittinger",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Kikus_Capital_Cup.jpg",
  }),
  teamFlag: img("team-flag.webp", 1400, 933, "Equipo de footgolf con su bandera", {
    title: "SFZ footgolf",
    artist: "Tomas.dittinger",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:SFZ_footgolf.jpg",
  }),
  playersMountains: img("players-mountains.webp", 1400, 933, "Dos jugadores en la cancha con montañas de fondo", {
    title: "US Pro-Am 2014",
    artist: "JuanMFernandez2000",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:US_Pro-Am_2014_.jpg",
  }),
} satisfies Record<string, SiteImage>;

/** Galería de la landing (siempre imágenes del sitio, nunca fotos de la base). */
export const landingGallery: SiteImage[] = [
  media.greenGolden,
  media.teamGroup,
  media.teeShot,
  media.flagHill,
  media.course,
  media.teamFlag,
  media.playersMountains,
  media.flag9,
];

export const allCredits = Object.values(media).flatMap((m) =>
  m.credit ? [{ file: m.src, ...m.credit }] : [],
);
