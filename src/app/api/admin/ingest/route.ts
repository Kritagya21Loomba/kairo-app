import { getPage } from "@/lib/anilist";
import { NextResponse } from "next/server";

// Protected ingestion endpoint
// GET /api/admin/ingest?page=1&secret=YOUR_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { media, hasNextPage } = await getPage(page, 50);

    // TODO: upsert to Supabase anime_cache when table exists
    // const supabase = await createClient();
    // await supabase.from("anime_cache").upsert(media.map(mapToCache));

    return NextResponse.json({
      page,
      count: media.length,
      hasNextPage,
      sample: media[0]?.title?.romaji ?? "—",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
