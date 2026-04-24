import { NextResponse } from "next/server";
import { supabase, cacheToAnime } from "@/lib/supabase/cache";
import { searchAnime } from "@/lib/anilist";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 50);
  if (!q) return NextResponse.json([]);

  try {
    // 1. Query Supabase cache (instant, 27k+ anime, no rate limits)
    const terms = q.split(/\s+/).filter(Boolean);
    let query = supabase
      .from("anime_cache")
      .select("*")
      .order("popularity", { ascending: false })
      .limit(limit);

    // Build OR filter across all title columns
    const orFilters = terms.map(t =>
      `title_english.ilike.%${t}%,title_romaji.ilike.%${t}%,title_native.ilike.%${t}%`
    ).join(",");
    query = query.or(orFilters);

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json(data.map(cacheToAnime), {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
      });
    }

    // 2. Fallback to AniList if cache miss or empty
    const anime = await searchAnime(q, limit);
    return NextResponse.json(anime, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    // Fallback to AniList on any error
    try {
      const anime = await searchAnime(q, limit);
      return NextResponse.json(anime);
    } catch {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }
}
