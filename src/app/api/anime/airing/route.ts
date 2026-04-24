import { getAiring } from "@/lib/anilist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const anime = await getAiring(18);
    return NextResponse.json(anime);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
