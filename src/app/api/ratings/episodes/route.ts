import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/ratings/episodes?animeId=21
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const animeId = parseInt(searchParams.get("animeId") ?? "0");
  if (!animeId) return NextResponse.json([]);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("episode_ratings")
    .select("episode_num, rating, note, is_spoiler, watched_at")
    .eq("user_id", user.id)
    .eq("anime_id", animeId)
    .order("episode_num");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/ratings/episodes  { animeId, episodeNum, rating, note, isSpoiler }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { animeId, episodeNum, rating, note = "", isSpoiler = false } = body;

  if (!animeId || !episodeNum || !rating) {
    return NextResponse.json({ error: "animeId, episodeNum, rating required" }, { status: 400 });
  }

  const { error } = await supabase.from("episode_ratings").upsert({
    user_id:     user.id,
    anime_id:    animeId,
    episode_num: episodeNum,
    rating,
    note,
    is_spoiler: isSpoiler,
    watched_at: new Date().toISOString(),
  }, { onConflict: "user_id,anime_id,episode_num" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/ratings/episodes?animeId=21&episodeNum=3
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const animeId    = parseInt(searchParams.get("animeId") ?? "0");
  const episodeNum = parseInt(searchParams.get("episodeNum") ?? "0");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { error } = await supabase.from("episode_ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("anime_id", animeId)
    .eq("episode_num", episodeNum);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
