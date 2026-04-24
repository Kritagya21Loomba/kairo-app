import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  
  // Try to get the auth token from cookies
  const cookieStore = await cookies();
  const tokenCookieName = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const token = cookieStore.get(tokenCookieName)?.value;
  
  let authHeader = {};
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed[0]) authHeader = { Authorization: `Bearer ${parsed[0]}` };
    } catch { /* ignore */ }
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: authHeader },
    auth: { persistSession: false },
  });
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("kairo_watch_logs")
      .select("*")
      .order("watched_on", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(data.map((row) => ({
      id: row.id,
      animeId: row.anime_id,
      title: row.anime_title,
      coverUrl: row.cover_url,
      format: row.format,
      epStart: row.ep_start,
      epEnd: row.ep_end,
      watchedOn: row.watched_on,
      durationMin: row.duration_min,
      notes: row.notes,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    
    const { error } = await supabase.from("kairo_watch_logs").insert({
      user_id: user.id,
      anime_id: body.animeId,
      anime_title: body.title,
      cover_url: body.coverUrl,
      format: body.format,
      ep_start: body.epStart,
      ep_end: body.epEnd,
      watched_on: body.watchedOn,
      duration_min: body.durationMin,
      notes: body.notes,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabase
      .from("kairo_watch_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Double check ownership

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
