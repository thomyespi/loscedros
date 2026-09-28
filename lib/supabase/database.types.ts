/**
 * Tipos de la base (formato de `supabase gen types typescript`).
 * Si cambiás el esquema, regeneralos con:
 *   npx supabase gen types typescript --linked > lib/supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string };

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      admins: {
        Row: { user_id: string } & Timestamps;
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          avatar_path: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          avatar_path?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          avatar_path?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          cover_path: string | null;
          status: Database["public"]["Enums"]["tournament_status"];
          champion_team_id: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          cover_path?: string | null;
          status?: Database["public"]["Enums"]["tournament_status"];
          champion_team_id?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          cover_path?: string | null;
          status?: Database["public"]["Enums"]["tournament_status"];
          champion_team_id?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournaments_champion_team_id_fkey";
            columns: ["champion_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      tournament_teams: {
        Row: { tournament_id: string; team_id: string; created_at: string };
        Insert: { tournament_id: string; team_id: string; created_at?: string };
        Update: { tournament_id?: string; team_id?: string; created_at?: string };
        Relationships: [
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tournament_teams_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      rounds: {
        Row: { id: string; tournament_id: string; number: number; play_date: string; created_at: string };
        Insert: { id?: string; tournament_id: string; number: number; play_date: string; created_at?: string };
        Update: { id?: string; tournament_id?: string; number?: number; play_date?: string; created_at?: string };
        Relationships: [
          {
            foreignKeyName: "rounds_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: { id: string; round_id: string; team_a_id: string; team_b_id: string; created_at: string };
        Insert: { id?: string; round_id: string; team_a_id: string; team_b_id: string; created_at?: string };
        Update: { id?: string; round_id?: string; team_a_id?: string; team_b_id?: string; created_at?: string };
        Relationships: [
          {
            foreignKeyName: "matches_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
        ];
      };
      match_results: {
        Row: {
          match_id: string;
          modality: Database["public"]["Enums"]["modality_type"];
          winner_team_id: string;
          score_note: string | null;
          updated_at: string;
        };
        Insert: {
          match_id: string;
          modality: Database["public"]["Enums"]["modality_type"];
          winner_team_id: string;
          score_note?: string | null;
          updated_at?: string;
        };
        Update: {
          match_id?: string;
          modality?: Database["public"]["Enums"]["modality_type"];
          winner_team_id?: string;
          score_note?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_results_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      tournament_photos: {
        Row: {
          id: string;
          tournament_id: string;
          round_id: string | null;
          path: string;
          caption: string | null;
          width: number | null;
          height: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          round_id?: string | null;
          path: string;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          round_id?: string | null;
          path?: string;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_photos_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: number;
          opening_hours: string;
          whatsapp: string;
          instagram: string;
          address: string;
          course_map_path: string | null;
          course_map_width: number | null;
          course_map_height: number | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          opening_hours: string;
          whatsapp: string;
          instagram: string;
          address: string;
          course_map_path?: string | null;
          course_map_width?: number | null;
          course_map_height?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          opening_hours?: string;
          whatsapp?: string;
          instagram?: string;
          address?: string;
          course_map_path?: string | null;
          course_map_width?: number | null;
          course_map_height?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_match_summary: {
        Row: {
          match_id: string;
          round_id: string;
          tournament_id: string;
          round_number: number;
          play_date: string;
          team_a_id: string;
          team_b_id: string;
          results_count: number;
          team_a_wins: number;
          team_b_wins: number;
          is_complete: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      tournament_status: "borrador" | "proximo" | "en_curso" | "finalizado";
      modality_type: "individual" | "four_ball" | "foursome";
    };
    CompositeTypes: Record<string, never>;
  };
};
