import { createClient } from "@supabase/supabase-js";
import type { AniListAnime } from "@/types/anilist";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Map flat anime_cache row → AniListAnime shape the frontend expects
export function cacheToAnime(row: Record<string, unknown>): AniListAnime {
  return {
    id: row.anilist_id as number,
    title: {
      romaji:  (row.title_romaji  as string) ?? null,
      english: (row.title_english as string) ?? null,
      native:  (row.title_native  as string) ?? null,
    },
    coverImage: {
      large:      (row.cover_url   as string) ?? null,
      extraLarge: (row.cover_url   as string) ?? null,
      color:      (row.cover_color as string) ?? null,
    },
    bannerImage:  (row.banner_url  as string) ?? null,
    status:       (row.status      as AniListAnime["status"]) ?? "FINISHED",
    format:       (row.format      as AniListAnime["format"]) ?? null,
    episodes:     (row.episodes    as number) ?? null,
    duration:     (row.duration    as number) ?? null,
    genres:       (row.genres      as string[]) ?? [],
    averageScore: (row.average_score as number) ?? null,
    popularity:   (row.popularity   as number) ?? null,
    season:       (row.season       as AniListAnime["season"]) ?? null,
    seasonYear:   (row.season_year  as number) ?? null,
    startDate:    null,
    description:  (row.description  as string) ?? null,
    studios:      row.studio ? { nodes: [{ name: row.studio as string }] } : { nodes: [] },
    nextAiringEpisode: null,
  };
}

export { supabase };
