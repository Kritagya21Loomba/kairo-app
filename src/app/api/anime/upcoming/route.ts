import { getUpcoming } from "@/lib/anilist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const anime = await getUpcoming(12);
    return NextResponse.json(anime);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
