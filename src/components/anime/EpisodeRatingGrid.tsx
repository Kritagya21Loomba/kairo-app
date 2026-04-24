"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/components/ui/Toast";

interface EpisodeRating {
  ep: number;
  rating: number | null;
  note: string;
}

interface Props {
  totalEpisodes: number;
  animeId: number;
  communityScore?: number; // AniList averageScore 0-100
}

// Returns a subtle tint colour for unrated episodes based on community score
function communityBaseline(score: number | undefined): string {
  if (!score) return "transparent";
  if (score >= 80) return "#16A34A18";  // green tint — great show
  if (score >= 65) return "#D9770618";  // amber tint — decent
  return "#DC262618";                   // red tint — poor
}

function communityBorder(score: number | undefined): string {
  if (!score) return "var(--border-color)";
  if (score >= 80) return "#16A34A44";
  if (score >= 65) return "#D9770644";
  return "#DC262644";
}

const RATING_COLORS = [
  null, "#DC2626", "#EA580C", "#D97706", "#CA8A04", "#A3A300",
  "#65A30D", "#16A34A", "#15803D", "#0D9488", "#0369A1",
];

function getRatingColor(rating: number | null): string {
  if (rating === null) return "var(--bg-card)";
  return RATING_COLORS[Math.round(rating)] ?? "var(--bg-card)";
}

export function EpisodeRatingGrid({ totalEpisodes, animeId, communityScore }: Props) {
  const { user } = useAuth();
  const [ratings, setRatings]     = useState<Map<number, EpisodeRating>>(new Map());
  const [selected, setSelected]   = useState<number | null>(null);
  const [noteInput, setNoteInput]  = useState("");
  const [ratingInput, setRatingInput] = useState<number>(8);
  const [saving, setSaving]        = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Load ratings from Supabase (if signed in)
  useEffect(() => {
    if (!user || !animeId) return;
    setLoadingData(true);
    fetch(`/api/ratings/episodes?animeId=${animeId}`)
      .then(r => r.json())
      .then((rows) => {
        if (!Array.isArray(rows)) return;
        const map = new Map<number, EpisodeRating>();
        rows.forEach((row: { episode_num: number; rating: number; note: string }) => {
          map.set(row.episode_num, { ep: row.episode_num, rating: row.rating, note: row.note ?? "" });
        });
        setRatings(map);
      })
      .finally(() => setLoadingData(false));
  }, [user, animeId]);

  // Load from localStorage if not signed in
  useEffect(() => {
    if (user) return;
    try {
      const stored = localStorage.getItem(`kairo-ep-ratings-${animeId}`);
      if (stored) {
        const obj = JSON.parse(stored) as Record<string, EpisodeRating>;
        setRatings(new Map(Object.entries(obj).map(([k, v]) => [parseInt(k), v])));
      }
    } catch { /* ignore */ }
  }, [user, animeId]);

  const openEpisode = (ep: number) => {
    const existing = ratings.get(ep);
    setSelected(ep);
    setRatingInput(existing?.rating ?? 8);
    setNoteInput(existing?.note ?? "");
  };

  const saveRating = async () => {
    if (selected === null) return;
    setSaving(true);
    const entry: EpisodeRating = { ep: selected, rating: ratingInput, note: noteInput };
    const updated = new Map(ratings);
    updated.set(selected, entry);
    setRatings(updated);

    if (user) {
      // Persist to Supabase
      try {
        const res = await fetch("/api/ratings/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ animeId, episodeNum: selected, rating: ratingInput, note: noteInput }),
        });
        if (!res.ok) throw new Error("Save failed");
        showToast(`Episode ${selected} rated ★${ratingInput}`, "⭐");
      } catch {
        showToast("Failed to save — stored locally", "⚠");
      }
    } else {
      // localStorage fallback
      const obj: Record<string, EpisodeRating> = {};
      updated.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(`kairo-ep-ratings-${animeId}`, JSON.stringify(obj));
      showToast(`Episode ${selected} rated ★${ratingInput} (sign in to sync)`, "⭐");
    }

    setSaving(false);
    setSelected(null);
  };

  const clearRating = async () => {
    if (selected === null) return;
    const updated = new Map(ratings);
    updated.delete(selected);
    setRatings(updated);

    if (user) {
      await fetch(`/api/ratings/episodes?animeId=${animeId}&episodeNum=${selected}`, { method: "DELETE" });
    } else {
      const obj: Record<string, EpisodeRating> = {};
      updated.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(`kairo-ep-ratings-${animeId}`, JSON.stringify(obj));
    }
    setSelected(null);
  };

  const ratedCount = ratings.size;
  const avgRating  = ratedCount > 0
    ? Array.from(ratings.values()).reduce((s, r) => s + (r.rating ?? 0), 0) / ratedCount
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs section-header">エピソード評価 · Episode Ratings</span>
          <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
            {loadingData ? "Loading..." : `${ratedCount}/${totalEpisodes} rated`}
          </span>
          {communityScore && (
            <span className="text-xs font-mono-data px-2 py-0.5 rounded border"
              style={{ color: communityBorder(communityScore), borderColor: communityBorder(communityScore), fontSize: "0.6rem" }}>
              Community ★{(communityScore / 10).toFixed(1)}
            </span>
          )}
          {avgRating !== null && (
            <span className="text-xs font-bold font-mono-data" style={{ color: "#16A34A" }}>
              Your avg ★{avgRating.toFixed(1)}
            </span>
          )}
          {!user && (
            <span className="text-xs font-mono-data px-2 py-0.5 rounded border border-[var(--border-color)]"
              style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
              Sign in to sync
            </span>
          )}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1">
          {[1, 4, 7, 10].map((r) => (
            <div key={r} className="flex items-center gap-0.5">
              <div className="w-3 h-3 rounded-sm border border-[var(--border-color)]"
                style={{ backgroundColor: getRatingColor(r) }} />
              <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.55rem" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Episode grid */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))" }}>
        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
          const r       = ratings.get(ep);
          const color   = getRatingColor(r?.rating ?? null);
          const isRated = r !== undefined;
          return (
            <motion.button
              key={ep}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openEpisode(ep)}
              className="relative flex flex-col items-center justify-center border-2 rounded-[var(--border-radius)] cursor-pointer py-2"
              style={{
                backgroundColor: isRated ? color + "22" : communityBaseline(communityScore),
                borderColor:     isRated ? color : communityBorder(communityScore),
                boxShadow:       isRated ? `2px 2px 0px ${color}55` : "2px 2px 0px var(--border-color)",
              }}
            >
              <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.55rem" }}>EP</span>
              <span className="font-bold font-mono-data" style={{ color: isRated ? color : "var(--text-primary)", fontSize: "0.75rem" }}>
                {ep}
              </span>
              {isRated && (
                <span className="font-bold" style={{ color, fontSize: "0.55rem" }}>{r.rating}</span>
              )}
              {r?.note && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Rating modal */}
      <AnimatePresence>
        {selected !== null && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md border-2 border-[var(--border-color)] rounded-[var(--border-radius)] p-6 space-y-5"
              style={{ backgroundColor: "var(--bg-card)", boxShadow: "6px 6px 0px var(--border-color)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs section-header">Rate Episode</div>
                  <div className="text-lg font-bold font-mono-data" style={{ color: "var(--text-primary)" }}>
                    Episode {selected}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-2xl cursor-pointer hover:opacity-60"
                  style={{ color: "var(--text-muted)" }}>×</button>
              </div>

              {/* Rating buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs section-header">Rating</span>
                  <span className="text-2xl font-bold font-mono-data" style={{ color: getRatingColor(ratingInput) }}>
                    {ratingInput} / 10
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                    <button key={v} onClick={() => setRatingInput(v)}
                      className="flex-1 py-2 border-2 rounded cursor-pointer text-xs font-bold font-mono-data transition-all"
                      style={{
                        backgroundColor: v <= ratingInput ? getRatingColor(v) + "33" : "var(--bg-primary)",
                        borderColor:     v <= ratingInput ? getRatingColor(ratingInput) : "var(--border-color)",
                        color:           v <= ratingInput ? getRatingColor(ratingInput) : "var(--text-muted)",
                      }}
                    >{v}</button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <span className="text-xs section-header">Note (optional)</span>
                <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Thoughts on this episode..."
                  rows={2}
                  className="w-full text-sm p-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] resize-none outline-none bg-transparent"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-inter), sans-serif" }}
                />
              </div>

              <div className="flex gap-2">
                <button onClick={saveRating} disabled={saving}
                  className="flex-1 py-2 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer disabled:opacity-60"
                  style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>
                  {saving ? "Saving..." : "Save Rating"}
                </button>
                {ratings.has(selected) && (
                  <button onClick={clearRating}
                    className="px-4 py-2 text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
                    style={{ color: "var(--accent)" }}>
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
