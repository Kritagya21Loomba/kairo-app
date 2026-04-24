import type { AniListAnime, AniListPageResponse } from "@/types/anilist";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FRAGMENT = `
  id
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  status
  format
  episodes
  duration
  genres
  averageScore
  popularity
  season
  seasonYear
  startDate { year month day }
  description(asHtml: false)
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { episode airingAt }
`;

async function gql<T>(query: string, variables?: Record<string, unknown>, revalidate = 3600): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "AniList GraphQL error");
  return json.data as T;
}

// ── Trending ────────────────────────────────────────────────────
export async function getTrending(perPage = 18): Promise<AniListAnime[]> {
  const data = await gql<AniListPageResponse>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { perPage }
  );
  return data.Page.media;
}

// ── Currently Airing ─────────────────────────────────────────────
export async function getAiring(perPage = 18): Promise<AniListAnime[]> {
  const data = await gql<AniListPageResponse>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(status: RELEASING, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { perPage },
    1800 // 30-min cache — episodes update frequently
  );
  return data.Page.media;
}

// ── Upcoming ─────────────────────────────────────────────────────
export async function getUpcoming(perPage = 12): Promise<AniListAnime[]> {
  const data = await gql<AniListPageResponse>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(status: NOT_YET_RELEASED, type: ANIME, sort: START_DATE, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { perPage }
  );
  return data.Page.media;
}

// ── Search ────────────────────────────────────────────────────────
export async function searchAnime(search: string, perPage = 20): Promise<AniListAnime[]> {
  if (!search.trim()) return [];
  const data = await gql<AniListPageResponse>(
    `query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { search: search.trim(), perPage },
    60 // 1-min cache for search
  );
  return data.Page.media;
}

// ── By Genre ──────────────────────────────────────────────────────
export async function getByGenre(genre: string, perPage = 18): Promise<AniListAnime[]> {
  const data = await gql<AniListPageResponse>(
    `query ($genre: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(genre: $genre, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { genre, perPage }
  );
  return data.Page.media;
}

// ── Popular All Time ──────────────────────────────────────────────
export async function getPopular(perPage = 18): Promise<AniListAnime[]> {
  const data = await gql<AniListPageResponse>(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { perPage }
  );
  return data.Page.media;
}

// ── Helpers ────────────────────────────────────────────────────────
export function getDisplayTitle(anime: AniListAnime): string {
  return anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
}

export function getJPTitle(anime: AniListAnime): string | null {
  return anime.title.native ?? anime.title.romaji ?? null;
}

export function formatScore(score: number | null): string {
  if (!score) return "—";
  return (score / 10).toFixed(1);
}

export function formatStartDate(date: AniListAnime["startDate"]): string {
  if (!date?.year) return "TBA";
  const parts: string[] = [String(date.year)];
  if (date.month) parts.push(String(date.month).padStart(2, "0"));
  if (date.day) parts.push(String(date.day).padStart(2, "0"));
  return parts.join("-");
}

export function getStatusLabel(status: AniListAnime["status"]): string {
  return {
    RELEASING: "Airing",
    FINISHED: "Finished",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
  }[status] ?? status;
}

export function getStatusColor(status: AniListAnime["status"]): string {
  return {
    RELEASING: "#16A34A",
    FINISHED: "#6B7280",
    NOT_YET_RELEASED: "#D97706",
    CANCELLED: "#DC2626",
    HIATUS: "#7C3AED",
  }[status] ?? "#6B7280";
}

// ── Anime Detail (full) ───────────────────────────────────────────
export interface AniListAnimeDetail extends AniListAnime {
  endDate: { year: number | null; month: number | null; day: number | null } | null;
  source: string | null;
  countryOfOrigin: string | null;
  trailer: { id: string; site: string; thumbnail: string } | null;
  staff: {
    edges: Array<{
      role: string;
      node: { name: { full: string } };
    }>;
  };
  streamingEpisodes: Array<{ title: string; thumbnail: string; url: string; site: string }>;
  recommendations: {
    nodes: Array<{
      mediaRecommendation: {
        id: number;
        title: AniListAnime["title"];
        coverImage: AniListAnime["coverImage"];
        averageScore: number | null;
      } | null;
    }>;
  };
  nextAiringEpisode: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  } | null;
  externalLinks: Array<{ url: string; site: string; color: string | null; icon: string | null }>;
}

export async function getAnimeDetail(id: number): Promise<AniListAnimeDetail> {
  const data = await gql<{ Media: AniListAnimeDetail }>(
    `query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        coverImage { large extraLarge color }
        bannerImage
        status format episodes duration
        genres averageScore popularity
        season seasonYear
        startDate { year month day }
        endDate { year month day }
        description(asHtml: false)
        source countryOfOrigin
        studios(isMain: true) { nodes { name } }
        nextAiringEpisode { episode airingAt timeUntilAiring }
        trailer { id site thumbnail }
        staff(sort: RELEVANCE, perPage: 8) {
          edges { role node { name { full } } }
        }
        streamingEpisodes { title thumbnail url site }
        recommendations(sort: RATING_DESC, perPage: 8) {
          nodes {
            mediaRecommendation {
              id title { romaji english }
              coverImage { large color }
              averageScore
            }
          }
        }
        externalLinks { url site color icon }
      }
    }`,
    { id },
    1800
  );
  return data.Media;
}

// ── Paginated (for ingestion) ─────────────────────────────────────
export async function getPage(page: number, perPage = 50): Promise<{ media: AniListAnime[]; hasNextPage: boolean }> {
  const data = await gql<AniListPageResponse>(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage total }
        media(type: ANIME, isAdult: false, sort: POPULARITY_DESC) { ${MEDIA_FRAGMENT} }
      }
    }`,
    { page, perPage },
    86400
  );
  return { media: data.Page.media, hasNextPage: data.Page.pageInfo.hasNextPage };
}

// ── Time formatting ───────────────────────────────────────────────
export function formatTimeUntilAiring(seconds: number): string {
  if (seconds <= 0) return "Airing now";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
