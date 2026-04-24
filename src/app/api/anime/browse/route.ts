import { NextResponse } from "next/server";
import { supabase, cacheToAnime } from "@/lib/supabase/cache";

// GET /api/anime/browse?genres=Action,Fantasy&format=TV&status=FINISHED&minScore=70&maxScore=100&minYear=2000&maxYear=2025&sort=score&page=1&limit=24
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const genres   = searchParams.get("genres")?.split(",").filter(Boolean) ?? [];
  const format   = searchParams.get("format") ?? "";
  const status   = searchParams.get("status") ?? "";
  const minScore = parseInt(searchParams.get("minScore") ?? "0");
  const maxScore = parseInt(searchParams.get("maxScore") ?? "100");
  const minYear  = parseInt(searchParams.get("minYear") ?? "0");
  const maxYear  = parseInt(searchParams.get("maxYear") ?? "9999");
  const sort     = searchParams.get("sort") ?? "popularity"; // popularity | score | newest | title
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const from     = (page - 1) * limit;
  const to       = from + limit - 1;

  const sortCol = sort === "score" ? "average_score"
    : sort === "newest" ? "season_year"
    : sort === "title"  ? "title_romaji"
    : "popularity";
  const ascending = sort === "title";

  try {
    let query = supabase
      .from("anime_cache")
      .select("*", { count: "exact" })
      .not("cover_url", "is", null)
      .order(sortCol, { ascending })
      .range(from, to);

    if (genres.length > 0)  query = query.contains("genres", genres);
    if (format)             query = query.eq("format", format);
    if (status)             query = query.eq("status", status);
    if (minScore > 0)       query = query.gte("average_score", minScore);
    if (maxScore < 100)     query = query.lte("average_score", maxScore);
    if (minYear > 0)        query = query.gte("season_year", minYear);
    if (maxYear < 9999)     query = query.lte("season_year", maxYear);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      items:     (data ?? []).map(cacheToAnime),
      total:     count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit),
    }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
