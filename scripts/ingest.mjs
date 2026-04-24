#!/usr/bin/env node
// ================================================================
// Kairo Anime Ingestion Script
// Usage: node scripts/ingest.mjs [startPage] [passes]
//
// Pass 1 (default): 200 pages × 50 anime = ~10,000 anime (popularity sorted)
// Pass 2: MOVIES sorted by score
// Pass 3: Currently AIRING
// Pass 4: UPCOMING
//
// Run all passes: node scripts/ingest.mjs 1 all
// Resume from page 50: node scripts/ingest.mjs 50
// ================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wsqgwgjavelkzzdyjtfr.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcWd3Z2phdmVsa3p6ZHlqdGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTk5MDAsImV4cCI6MjA5MjQzNTkwMH0.cfdE8dDhQgWTJZo4nb9jT-E087KqWKNekPBTgnMz81M";

const ANILIST_URL = "https://graphql.anilist.co";
const DELAY_MS   = 750;  // 80 req/min — safely under AniList's 90 req/min limit
const PER_PAGE   = 50;
const MAX_PAGES  = 200; // AniList caps at page*perPage ≤ 10,000

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MEDIA_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $format: MediaFormat) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage total currentPage lastPage }
    media(type: ANIME, isAdult: false, sort: $sort, status: $status, format: $format) {
      id
      title { romaji english native }
      coverImage { large extraLarge color }
      bannerImage
      status format episodes duration
      genres averageScore popularity
      season seasonYear
      description(asHtml: false)
      studios(isMain: true) { nodes { name } }
    }
  }
}`;

function mapToCache(anime) {
  return {
    anilist_id:    anime.id,
    title_english: anime.title?.english   ?? null,
    title_romaji:  anime.title?.romaji    ?? null,
    title_native:  anime.title?.native    ?? null,
    cover_url:     anime.coverImage?.large ?? anime.coverImage?.extraLarge ?? null,
    banner_url:    anime.bannerImage       ?? null,
    cover_color:   anime.coverImage?.color ?? null,
    status:        anime.status            ?? null,
    format:        anime.format            ?? null,
    episodes:      anime.episodes          ?? null,
    duration:      anime.duration          ?? null,
    genres:        anime.genres            ?? [],
    average_score: anime.averageScore      ?? null,
    popularity:    anime.popularity        ?? null,
    season:        anime.season            ?? null,
    season_year:   anime.seasonYear        ?? null,
    studio:        anime.studios?.nodes?.[0]?.name ?? null,
    description:   anime.description?.replace(/<[^>]*>/g, "")?.slice(0, 2000) ?? null,
    updated_at:    new Date().toISOString(),
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function bar(done, total, width = 30) {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round((done / total) * width);
  return `[${"█".repeat(filled)}${"░".repeat(width - filled)}] ${pct}%`;
}

async function fetchPage(variables, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ANILIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: MEDIA_QUERY, variables }),
      });
      if (res.status === 429) {
        const wait = 65000;
        console.log(`\n  ⚠ Rate limited — waiting ${wait/1000}s...`);
        await sleep(wait);
        continue;
      }
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message);
      return json.data.Page;
    } catch (e) {
      if (attempt === retries) throw e;
      console.log(`  Retry ${attempt}/${retries}...`);
      await sleep(2000 * attempt);
    }
  }
}

async function runPass(label, sort, extraVars = {}, startPage = 1) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  PASS: ${label}`);
  console.log(`${"═".repeat(60)}`);

  let page     = startPage;
  let total    = 0;
  let errors   = 0;
  let hasNext  = true;

  while (hasNext && page <= MAX_PAGES) {
    const pageData = await fetchPage({ page, perPage: PER_PAGE, sort, ...extraVars });
    const items    = pageData?.media ?? [];
    hasNext        = pageData?.pageInfo?.hasNextPage ?? false;

    if (items.length === 0) break;

    const rows = items.map(mapToCache);
    const { error } = await supabase
      .from("anime_cache")
      .upsert(rows, { onConflict: "anilist_id", ignoreDuplicates: false });

    if (error) {
      errors++;
      process.stdout.write(`\r  Page ${page}: ERROR — ${error.message}\n`);
    } else {
      total += rows.length;
    }

    const progress = bar(page, Math.min(pageData?.pageInfo?.lastPage ?? MAX_PAGES, MAX_PAGES));
    process.stdout.write(`\r  ${progress} page ${page} | +${rows.length} | total ${total} | errors ${errors}   `);

    page++;
    if (hasNext && page <= MAX_PAGES) await sleep(DELAY_MS);
  }

  console.log(`\n  ✓ Done — ${total} anime upserted (${errors} errors)\n`);
  return total;
}

async function main() {
  const args      = process.argv.slice(2);
  const startPage = parseInt(args[0] ?? "1", 10) || 1;
  const doAll     = args.includes("all");

  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│  Kairo Anime Ingestion Pipeline                         │");
  console.log("│  Fetching from AniList → Supabase anime_cache           │");
  console.log(`│  Start page: ${String(startPage).padEnd(5)} | Mode: ${doAll ? "ALL passes    " : "Pass 1 only   "} │`);
  console.log("└─────────────────────────────────────────────────────────┘");

  const t0 = Date.now();
  let grand = 0;

  // Pass 1 — All anime sorted by popularity (10,000 entries max)
  grand += await runPass(
    "All Anime · Sorted by Popularity (10,000 max)",
    ["POPULARITY_DESC"],
    {},
    startPage
  );

  if (doAll) {
    // Pass 2 — Movies sorted by score
    grand += await runPass("Movies · Sorted by Score", ["SCORE_DESC"], { format: "MOVIE" });

    // Pass 3 — Currently airing
    grand += await runPass("Currently Airing", ["POPULARITY_DESC"], { status: "RELEASING" });

    // Pass 4 — Upcoming
    grand += await runPass("Upcoming", ["START_DATE"], { status: "NOT_YET_RELEASED" });

    // Pass 5 — Top scored all-time (catches deep cuts missed in popularity sort)
    grand += await runPass("Top Scored All-Time", ["SCORE_DESC"]);

    // Pass 6 — OVAs and specials
    grand += await runPass("OVAs & Specials", ["POPULARITY_DESC"], { format: "OVA" });
  }

  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log(`│  ✅ Ingestion complete!                                  │`);
  console.log(`│  Total upserted: ${String(grand).padEnd(8)} | Time: ${String(elapsed + "s").padEnd(8)}          │`);
  console.log("│  Your Supabase anime_cache is now populated!            │");
  console.log("└─────────────────────────────────────────────────────────┘");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Ingestion failed:", e.message);
  process.exit(1);
});
