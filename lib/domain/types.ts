export type TournamentStatus = "borrador" | "proximo" | "en_curso" | "finalizado";
export type Modality = "individual" | "four_ball" | "foursome";

export const MODALITIES: readonly Modality[] = ["individual", "four_ball", "foursome"];
export const POINTS_PER_MODALITY = 3;

export const MODALITY_LABEL: Record<Modality, string> = {
  individual: "Individual",
  four_ball: "Four Ball",
  foursome: "Foursome",
};

export const MODALITY_SHORT: Record<Modality, string> = {
  individual: "IND",
  four_ball: "FB",
  foursome: "FS",
};

export const STATUS_LABEL: Record<TournamentStatus, string> = {
  borrador: "Borrador",
  proximo: "Próximo",
  en_curso: "En curso",
  finalizado: "Finalizado",
};

export interface Team {
  id: string;
  name: string;
  slug: string;
  avatarPath: string | null;
  archivedAt: string | null;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverPath: string | null;
  status: TournamentStatus;
  championTeamId: string | null;
  finishedAt: string | null;
  createdAt: string;
  teamIds: string[];
}

export interface Round {
  id: string;
  tournamentId: string;
  number: number;
  /** Día de juego, formato YYYY-MM-DD (sin hora). */
  playDate: string;
}

export interface Match {
  id: string;
  roundId: string;
  teamAId: string;
  teamBId: string;
  createdAt: string;
}

export interface MatchResult {
  matchId: string;
  modality: Modality;
  winnerTeamId: string;
  scoreNote: string | null;
}

export interface Photo {
  id: string;
  tournamentId: string;
  roundId: string | null;
  path: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  createdAt: string;
}

export interface SiteSettings {
  openingHours: string;
  whatsapp: string;
  instagram: string;
  address: string;
}

/** Todo lo público del sitio en una sola lectura (el volumen del club es chico). */
export interface Snapshot {
  settings: SiteSettings;
  teams: Team[];
  tournaments: Tournament[];
  rounds: Round[];
  matches: Match[];
  results: MatchResult[];
  photos: Photo[];
}
