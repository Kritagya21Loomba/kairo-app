import { NextResponse } from "next/server";
import { supabase, cacheToAnime } from "@/lib/supabase/cache";

// GET /api/anime/random?count=12&genre=Action&minScore=70
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count    = Math.min(parseInt(searchParams.get("count") ?? "12"), 50);
  const genre    = searchParams.get("genre") ?? "";
  const minScore = parseInt(searchParams.get("minScore") ?? "0");

  try {
    // Fetch a pool of candidates, then randomly sample from it
    const poolSize = Math.max(count * 10, 100);

    let query = supabase
      .from("anime_cache")
      .select("*")
      .not("cover_url", "is", null)
      .order("popularity", { ascending: false })
      .limit(poolSize);

    if (genre)    query = query.contains("genres", [genre]);
    if (minScore > 0) query = query.gte("average_score", minScore);

    const { data, error } = await query;
    if (error) throw error;

    // Shuffle and take `count` items
    const pool = data ?? [];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const sample = pool.slice(0, count);

    return NextResponse.json(sample.map(cacheToAnime), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
