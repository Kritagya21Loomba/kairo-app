"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EpisodeRatingGrid } from "@/components/anime/EpisodeRatingGrid";
import { useLibrary } from "@/hooks/useLibrary";
import { showToast } from "@/components/ui/Toast";
import {
  getDisplayTitle, getJPTitle, formatScore,
  getStatusLabel, getStatusColor, formatTimeUntilAiring,
} from "@/lib/anilist";
import type { AniListAnimeDetail } from "@/lib/anilist";
import type { LibraryStatus } from "@/types/anilist";

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: "watching",  label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan",      label: "Plan to Watch" },
  { value: "hold",      label: "On Hold" },
  { value: "dropped",   label: "Dropped" },
];

const FORMAT_IS_SERIES = new Set(["TV", "TV_SHORT", "ONA", "OVA"]);

function MetaPill({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs section-header">{label}</span>
      <span className="text-sm font-semibold" style={{ color: accent ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AniListAnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [libraryMenuOpen, setLibraryMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"episodes" | "staff" | "links">("episodes");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(8);

  const { addToLibrary, removeFromLibrary, getEntry, libraryIds } = useLibrary();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/anime/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAnime(d as AniListAnimeDetail);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-mono-data" style={{ color: "var(--text-muted)" }}>
          読み込み中... Loading
        </motion.div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-2xl">⚠️</div>
        <div className="text-sm font-mono-data" style={{ color: "var(--text-muted)" }}>
          {error ?? "Anime not found"}
        </div>
        <Link href="/" className="text-xs underline" style={{ color: "var(--accent)" }}>← Back to Discover</Link>
      </div>
    );
  }

  const title = getDisplayTitle(anime);
  const titleJP = getJPTitle(anime);
  const score = formatScore(anime.averageScore);
  const statusColor = getStatusColor(anime.status);
  const isSeries = anime.format ? FORMAT_IS_SERIES.has(anime.format) : true;
  const inLibrary = libraryIds.has(anime.id);
  const libraryEntry = getEntry(anime.id);
  const studio = anime.studios?.nodes?.[0]?.name;
  const accentColor = anime.coverImage?.color ?? "var(--accent)";

  const description = anime.description?.replace(/<[^>]*>/g, "") ?? "";
  const shortDesc = description.length > 320 ? description.slice(0, 320) + "…" : description;

  return (
    <div className="min-h-screen">
      {/* ── Banner ── */}
      <div className="relative h-48 sm:h-64 overflow-hidden border-b-2 border-[var(--border-color)]">
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }} />
        )}
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, var(--bg-primary) 100%)" }} />
        {/* Back link */}
        <Link href="/" className="absolute top-4 left-4 text-xs font-mono-data px-3 py-1.5 border-2 rounded-[var(--border-radius)] hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", borderColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
          ← Discover
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 pb-16 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* ── Poster ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex-shrink-0 w-36 sm:w-44"
          >
            <div className="relative overflow-hidden rounded-[var(--border-radius)] border-2 border-[var(--border-color)]"
              style={{ aspectRatio: "2/3", boxShadow: `6px 6px 0px var(--border-color), 0 0 0 1px ${accentColor}44` }}>
              {anime.coverImage?.large ? (
                <Image src={anime.coverImage.large} alt={title} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }}>
                  <span className="text-4xl">📺</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Main info ── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 min-w-0 space-y-3 pt-20 sm:pt-0"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{title}</h1>
              {titleJP && <div className="text-base font-jp mt-0.5" style={{ color: "var(--text-muted)" }}>{titleJP}</div>}
            </div>

            {/* Score + Status */}
            <div className="flex items-center gap-3 flex-wrap">
              {anime.averageScore && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
                  style={{ backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}>
                  <span style={{ color: "#FCD34D" }}>★</span>
                  <span className="text-base font-bold font-mono-data" style={{ color: "var(--text-primary)" }}>{score}</span>
                  <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>/10</span>
                </div>
              )}
              <div className="px-2.5 py-1 rounded text-xs font-mono-data font-bold"
                style={{ backgroundColor: statusColor + "22", color: statusColor, border: `1.5px solid ${statusColor}55` }}>
                {getStatusLabel(anime.status)}
              </div>
              {anime.nextAiringEpisode && (
                <div className="text-xs font-mono-data px-2.5 py-1 border-2 rounded-[var(--border-radius)]"
                  style={{ color: "#16A34A", borderColor: "#16A34A55", backgroundColor: "#16A34A11" }}>
                  Ep {anime.nextAiringEpisode.episode} in {formatTimeUntilAiring(anime.nextAiringEpisode.timeUntilAiring)}
                </div>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-6 gap-y-3 py-3 border-y-2 border-[var(--border-color)]">
              {studio && <MetaPill label="Studio" value={studio} />}
              {anime.format && <MetaPill label="Format" value={anime.format.replace("_", " ")} />}
              {anime.episodes && <MetaPill label="Episodes" value={String(anime.episodes)} />}
              {anime.seasonYear && <MetaPill label="Year" value={`${anime.season ? anime.season.charAt(0) + anime.season.slice(1).toLowerCase() + " " : ""}${anime.seasonYear}`} />}
              {anime.duration && <MetaPill label="Duration" value={`${anime.duration} min`} />}
              {anime.source && <MetaPill label="Source" value={anime.source.replace(/_/g, " ")} />}
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5">
              {anime.genres?.map((g) => (
                <Link key={g} href={`/?genre=${encodeURIComponent(g)}`}
                  className="tag-pill text-xs hover:opacity-80">{g}</Link>
              ))}
            </div>

            {/* Library CTA */}
            <div className="flex gap-2 relative">
              {inLibrary ? (
                <>
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
                    style={{ backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {STATUS_OPTIONS.find(s => s.value === libraryEntry?.status)?.label ?? "In Library"} ✓
                    </span>
                  </div>
                  <button onClick={() => setLibraryMenuOpen(v => !v)}
                    className="px-3 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 font-mono-data text-xs"
                    style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
                    ▾ Change
                  </button>
                  <button onClick={() => { removeFromLibrary(anime.id); showToast("Removed from Library", "🗑"); }}
                    className="px-3 py-2 border-2 rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 text-xs"
                    style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLibraryMenuOpen(v => !v)}
                  className="flex-1 py-2.5 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>
                  + Add to Library
                </button>
              )}

              {libraryMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLibraryMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-full mt-1 z-50 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
                    style={{ backgroundColor: "var(--bg-card)", boxShadow: "4px 4px 0px var(--border-color)", minWidth: "180px" }}>
                    {STATUS_OPTIONS.map((opt) => (
                      <button key={opt.value}
                        onClick={() => {
                          if (inLibrary) { /* update status */ }
                          else addToLibrary(anime as any, opt.value);
                          showToast(`Added as "${opt.label}"`, "📚");
                          setLibraryMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-semibold hover:opacity-70 border-b last:border-0 cursor-pointer"
                        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Description ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 space-y-2">
          <div className="terminal-divider">✦ synopsis</div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {showFullDesc ? description : shortDesc}
          </p>
          {description.length > 320 && (
            <button onClick={() => setShowFullDesc(v => !v)} className="text-xs font-semibold cursor-pointer hover:opacity-70"
              style={{ color: "var(--accent)" }}>
              {showFullDesc ? "Show less" : "Read more"}
            </button>
          )}
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 space-y-6">
          {/* Tab switcher */}
          <div className="flex gap-2 border-b-2 border-[var(--border-color)] pb-3">
            {(isSeries ? ["episodes", "staff", "links"] as const : ["staff", "links"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className="text-xs font-mono-data px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer capitalize"
                style={{
                  backgroundColor: activeTab === tab ? "var(--text-primary)" : "var(--bg-card)",
                  color: activeTab === tab ? "var(--bg-card)" : "var(--text-muted)",
                  boxShadow: activeTab === tab ? "2px 2px 0px var(--border-color)" : "none",
                }}>
                {tab === "episodes" ? "📊 Episode Ratings" : tab === "staff" ? "👤 Staff" : "🔗 Watch"}
              </button>
            ))}
          </div>

          {/* Episodes tab */}
          {activeTab === "episodes" && isSeries && anime.episodes && (
            <EpisodeRatingGrid
              totalEpisodes={anime.episodes}
              animeId={anime.id}
              communityScore={anime.averageScore ?? undefined}
            />
          )}

          {/* Movie review */}
          {activeTab === "episodes" && !isSeries && (
            <div className="space-y-4">
              <div className="text-xs section-header">Your Review</div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                  <button key={v} onClick={() => setReviewRating(v)}
                    className="flex-1 py-2 border-2 rounded cursor-pointer text-xs font-bold transition-all"
                    style={{
                      backgroundColor: v <= reviewRating ? "#16A34A33" : "var(--bg-primary)",
                      borderColor: v <= reviewRating ? "#16A34A" : "var(--border-color)",
                      color: v <= reviewRating ? "#16A34A" : "var(--text-muted)",
                    }}>
                    {v}
                  </button>
                ))}
              </div>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..." rows={4}
                className="w-full text-sm p-3 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] resize-none outline-none bg-transparent"
                style={{ color: "var(--text-primary)" }} />
              <button className="px-6 py-2 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
                style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}
                onClick={() => showToast("Review saved! (Sign in to persist)", "✓")}>
                Save Review
              </button>
            </div>
          )}

          {/* Staff tab */}
          {activeTab === "staff" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {anime.staff?.edges?.map((edge, i) => (
                <div key={i} className="card-base p-3">
                  <div className="text-xs section-header">{edge.role}</div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {edge.node.name.full}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Watch / links tab */}
          {activeTab === "links" && (
            <div className="space-y-4">
              {anime.streamingEpisodes?.length > 0 && (
                <div>
                  <div className="text-xs section-header mb-3">Streaming Episodes</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {anime.streamingEpisodes.slice(0, 8).map((ep, i) => (
                      <a key={i} href={ep.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}>
                        {ep.thumbnail && <img src={ep.thumbnail} alt="" className="w-16 h-10 object-cover rounded border border-[var(--border-color)]" />}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{ep.title}</div>
                          <div className="text-xs font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>{ep.site}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {anime.externalLinks?.length > 0 && (
                <div>
                  <div className="text-xs section-header mb-3">External Links</div>
                  <div className="flex flex-wrap gap-2">
                    {anime.externalLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono-data px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: link.color ? link.color + "22" : "var(--bg-card)", color: link.color ?? "var(--text-muted)", borderColor: link.color ? link.color + "55" : "var(--border-color)", boxShadow: "2px 2px 0px var(--border-color)" }}>
                        {link.site}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Recommendations ── */}
        {anime.recommendations?.nodes?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 space-y-4">
            <div className="terminal-divider">✦ you might also like</div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {anime.recommendations.nodes
                .filter((n) => n.mediaRecommendation)
                .map(({ mediaRecommendation: rec }) => (
                  <Link key={rec!.id} href={`/anime/${rec!.id}`}
                    className="flex-shrink-0 w-[120px] hover:opacity-80 transition-opacity">
                    <div className="relative h-[170px] rounded-[var(--border-radius)] overflow-hidden border-2 border-[var(--border-color)]"
                      style={{ boxShadow: "3px 3px 0px var(--border-color)" }}>
                      {rec!.coverImage?.large && (
                        <Image src={rec!.coverImage.large} alt="" fill className="object-cover" unoptimized />
                      )}
                      {rec!.averageScore && (
                        <div className="absolute top-1 right-1 text-xs font-bold px-1 rounded"
                          style={{ backgroundColor: "rgba(0,0,0,0.75)", color: "#4ADE80", fontSize: "0.55rem" }}>
                          ★ {(rec!.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 text-xs font-semibold leading-tight line-clamp-2" style={{ color: "var(--text-primary)", fontSize: "0.7rem" }}>
                      {rec!.title.english ?? rec!.title.romaji}
                    </div>
                  </Link>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
