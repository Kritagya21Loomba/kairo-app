import { NextResponse } from "next/server";
import { supabase, cacheToAnime } from "@/lib/supabase/cache";
import { getByGenre, getPopular } from "@/lib/anilist";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre  = searchParams.get("genre") ?? "";
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "24"), 50);
  const sort   = searchParams.get("sort") ?? "popularity"; // popularity | score | newest

  try {
    const column = sort === "score" ? "average_score" : sort === "newest" ? "season_year" : "popularity";

    let query = supabase
      .from("anime_cache")
      .select("*")
      .not("cover_url", "is", null)
      .order(column, { ascending: false })
      .limit(limit);

    if (genre) {
      query = query.contains("genres", [genre]);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json(data.map(cacheToAnime), {
        headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    // Fallback to AniList
    const anime = genre ? await getByGenre(genre, limit) : await getPopular(limit);
    return NextResponse.json(anime);
  } catch (e) {
    try {
      const anime = genre ? await getByGenre(genre, limit) : await getPopular(limit);
      return NextResponse.json(anime);
    } catch {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }
}
