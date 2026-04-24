"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import { showToast } from "@/components/ui/Toast";
import type { AniListAnime } from "@/types/anilist";

interface Props {
  onClose: () => void;
  initialAnimeId?: number; // if launched from detail page
}

export function LogWatchModal({ onClose, initialAnimeId }: Props) {
  const { addLog } = useWatchLogs();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AniListAnime[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AniListAnime | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [epStart, setEpStart] = useState<string>("");
  const [epEnd, setEpEnd] = useState<string>("");
  const [watchedOn, setWatchedOn] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialAnimeId) {
      // Fetch specific anime
      setSearching(true);
      fetch(`/api/anime/${initialAnimeId}`)
        .then((r) => r.json())
        .then((data) => setSelectedAnime(data))
        .finally(() => setSearching(false));
    }
  }, [initialAnimeId]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(val)}&limit=5`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSave = async () => {
    if (!selectedAnime) return;
    
    let start: number | undefined;
    let end: number | undefined;
    
    const isSeries = selectedAnime.format !== "MOVIE" && selectedAnime.format !== "SPECIAL";
    
    if (isSeries) {
      start = parseInt(epStart) || 1;
      end = parseInt(epEnd) || start;
      
      if (start < 1) {
        showToast("Start episode must be at least 1", "⚠");
        return;
      }
      if (end < start) {
        showToast("End episode cannot be before start episode", "⚠");
        return;
      }
      if (selectedAnime.episodes && end > selectedAnime.episodes) {
        showToast(`This anime only has ${selectedAnime.episodes} episodes`, "⚠");
        return;
      }
    }
    
    setSaving(true);
    try {
      const eps = isSeries ? (end! - start! + 1) : 1;
      const durationMin = (selectedAnime.duration || 24) * eps;

      await addLog({
        animeId: selectedAnime.id,
        title: selectedAnime.title.english || selectedAnime.title.romaji || "Unknown",
        coverUrl: selectedAnime.coverImage?.large ?? undefined,
        format: selectedAnime.format ?? undefined,
        epStart: start,
        epEnd: end,
        watchedOn,
        durationMin,
        notes,
      });

      showToast("Watch log saved", "📝");
      onClose();
    } catch (e) {
      console.error(e);
      showToast("Failed to save log", "⚠");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-[10%] sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 z-50 w-full max-w-md max-h-[80vh] overflow-y-auto border-2 border-[var(--border-color)] rounded-[var(--border-radius)] bg-[var(--bg-card)] p-5"
        style={{ boxShadow: "6px 6px 0px var(--border-color)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <div>
              <div className="text-xs section-header">log activity</div>
              <div className="text-lg font-bold font-mono-data leading-none" style={{ color: "var(--text-primary)" }}>
                Log Watch
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-2xl hover:opacity-60 cursor-pointer" style={{ color: "var(--text-muted)" }}>×</button>
        </div>

        {!selectedAnime ? (
          <div className="space-y-3">
            <input
              type="text" autoFocus
              placeholder="Search anime to log..."
              value={query} onChange={(e) => handleSearch(e.target.value)}
              className="w-full text-sm px-3 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] outline-none bg-transparent focus:border-[var(--accent)]"
              style={{ color: "var(--text-primary)" }}
            />
            {searching && <div className="text-xs font-mono-data text-center" style={{ color: "var(--text-muted)" }}>Searching...</div>}
            <div className="space-y-2">
              {results.map(anime => (
                <div key={anime.id} onClick={() => setSelectedAnime(anime)}
                  className="flex items-center gap-3 p-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:border-[var(--accent)] transition-colors"
                >
                  {anime.coverImage?.large ? (
                    <img src={anime.coverImage.large} alt="" className="w-10 h-14 object-cover rounded" />
                  ) : <div className="w-10 h-14 bg-gray-800 rounded" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {anime.title.english || anime.title.romaji}
                    </div>
                    <div className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
                      {anime.format?.replace("_", " ")} · {anime.seasonYear}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Anime Card */}
            <div className="flex flex-col gap-2">
              <div className="text-xs section-header">Selected Anime</div>
              <div className="flex items-center gap-3 p-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]">
                {selectedAnime.coverImage?.large && (
                  <img src={selectedAnime.coverImage.large} alt="" className="w-12 h-16 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {selectedAnime.title.english || selectedAnime.title.romaji}
                  </div>
                  <div className="text-xs font-mono-data text-emerald-500">
                    {selectedAnime.format?.replace("_", " ")}
                  </div>
                </div>
                <button onClick={() => setSelectedAnime(null)} className="text-xs px-2 py-1 border border-[var(--border-color)] rounded hover:opacity-70" style={{ color: "var(--text-muted)" }}>
                  Change
                </button>
              </div>
            </div>

            {selectedAnime.format !== "MOVIE" && selectedAnime.format !== "SPECIAL" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs section-header mb-1">From Ep</div>
                  <input type="number" min="1" max={selectedAnime.episodes || undefined} value={epStart} onChange={e => setEpStart(e.target.value)} placeholder="1"
                    className="w-full text-sm px-3 py-2 border-2 border-[var(--border-color)] rounded outline-none bg-transparent" />
                </div>
                <div>
                  <div className="text-xs section-header mb-1">
                    To Ep {selectedAnime.episodes && <span style={{ opacity: 0.6 }}>(Max: {selectedAnime.episodes})</span>}
                  </div>
                  <input type="number" min={epStart || 1} max={selectedAnime.episodes || undefined} value={epEnd} onChange={e => setEpEnd(e.target.value)} placeholder={epStart || "1"}
                    className="w-full text-sm px-3 py-2 border-2 border-[var(--border-color)] rounded outline-none bg-transparent" />
                </div>
              </div>
            )}

            <div>
              <div className="text-xs section-header mb-1">Date Watched</div>
              <input type="date" value={watchedOn} onChange={e => setWatchedOn(e.target.value)}
                className="w-full text-sm px-3 py-2 border-2 border-[var(--border-color)] rounded outline-none bg-transparent"
                style={{ color: "var(--text-primary)" }} />
            </div>

            <div>
              <div className="text-xs section-header mb-1">Notes (Optional)</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Thoughts..."
                className="w-full text-sm px-3 py-2 border-2 border-[var(--border-color)] rounded outline-none bg-transparent resize-none"
                style={{ color: "var(--text-primary)" }} />
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-2.5 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>
              {saving ? "Saving..." : "Save Log"}
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
