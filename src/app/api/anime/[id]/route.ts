import { getAnimeDetail } from "@/lib/anilist";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  try {
    const anime = await getAnimeDetail(numId);
    return NextResponse.json(anime);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
