// AniList GraphQL types for Kairo

export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AniListCoverImage {
  large: string | null;
  extraLarge: string | null;
  color: string | null;
}

export interface AniListStartDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AniListNextAiringEpisode {
  episode: number;
  airingAt: number; // Unix timestamp
}

export interface AniListStudio {
  name: string;
}

export interface AniListAnime {
  id: number;
  title: AniListTitle;
  coverImage: AniListCoverImage;
  bannerImage: string | null;
  status: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
  format: "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC" | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  averageScore: number | null;       // 0–100
  popularity: number | null;
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL" | null;
  seasonYear: number | null;
  startDate: AniListStartDate | null;
  description: string | null;
  studios: { nodes: AniListStudio[] };
  nextAiringEpisode: AniListNextAiringEpisode | null;
}

export interface AniListPageResponse {
  Page: {
    pageInfo: { total: number; hasNextPage: boolean };
    media: AniListAnime[];
  };
}

// ── Library (local + Supabase) ──────────────────────────────────
export type LibraryStatus = "watching" | "completed" | "plan" | "dropped" | "hold";

export interface LibraryEntry {
  id: string;             // local UUID
  animeId: number;        // AniList ID
  title: string;
  titleJP: string | null;
  coverUrl: string;
  accentColor: string;    // from AniList coverImage.color
  status: LibraryStatus;
  userRating: number | null;   // 1.0–10.0
  notes: string;
  epProgress: number;
  totalEps: number | null;
  genres: string[];
  addedAt: string;        // ISO date
  updatedAt: string;
}
