"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimePosterCard } from "@/components/discover/AnimePosterCard";
import { useLibrary } from "@/hooks/useLibrary";
import { showToast } from "@/components/ui/Toast";
import type { AniListAnime } from "@/types/anilist";

const GENRES = [
  "Action","Adventure","Comedy","Drama","Fantasy","Horror","Mecha",
  "Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller",
];
const FORMATS = ["TV","MOVIE","OVA","ONA","SPECIAL","TV_SHORT"];
const STATUSES = [
  { value: "RELEASING",         label: "Airing Now" },
  { value: "FINISHED",          label: "Finished" },
  { value: "NOT_YET_RELEASED",  label: "Upcoming" },
  { value: "CANCELLED",         label: "Cancelled" },
];
const SORTS = [
  { value: "popularity", label: "🔥 Popular" },
  { value: "score",      label: "★ Score"    },
  { value: "newest",     label: "🆕 Newest"  },
  { value: "title",      label: "A→Z Title"  },
];

interface BrowseResult {
  items: AniListAnime[];
  total: number;
  page: number;
  totalPages: number;
}

export function BrowseSection() {
  const [results, setResults]       = useState<BrowseResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormat,  setSelectedFormat] = useState("");
  const [selectedStatus,  setSelectedStatus] = useState("");
  const [sort,    setSort]    = useState("popularity");
  const [minScore, setMinScore] = useState(0);
  const [minYear,  setMinYear]  = useState(0);
  const [page,    setPage]    = useState(1);

  const { addToLibrary, libraryMap } = useLibrary();
  const abortRef = useRef<AbortController | null>(null);

  const buildUrl = useCallback((p = 1) => {
    const params = new URLSearchParams({ sort, page: String(p), limit: "24" });
    if (selectedGenres.length)  params.set("genres",   selectedGenres.join(","));
    if (selectedFormat)         params.set("format",   selectedFormat);
    if (selectedStatus)         params.set("status",   selectedStatus);
    if (minScore > 0)           params.set("minScore", String(minScore));
    if (minYear  > 0)           params.set("minYear",  String(minYear));
    return `/api/anime/browse?${params}`;
  }, [selectedGenres, selectedFormat, selectedStatus, sort, minScore, minYear]);

  const fetchResults = useCallback(async (p = 1) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res  = await fetch(buildUrl(p), { signal: abortRef.current.signal });
      const data = await res.json() as BrowseResult;
      setResults(data);
      setPage(p);
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") console.error(e);
    } finally { setLoading(false); }
  }, [buildUrl]);

  // Fetch on first render
  useEffect(() => { fetchResults(1); }, []); // eslint-disable-line

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const activeFilterCount = selectedGenres.length + (selectedFormat ? 1 : 0) + (selectedStatus ? 1 : 0) + (minScore > 0 ? 1 : 0) + (minYear > 0 ? 1 : 0);

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs section-header">データベース · Browse</div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {results ? `${results.total.toLocaleString()} anime` : "27,000+ anime"}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort */}
          <div className="flex gap-1">
            {SORTS.map(s => (
              <button key={s.value} onClick={() => { setSort(s.value); fetchResults(1); }}
                className="text-xs font-mono-data px-2.5 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
                style={{
                  backgroundColor: sort === s.value ? "var(--text-primary)" : "var(--bg-card)",
                  color:           sort === s.value ? "var(--bg-card)"      : "var(--text-muted)",
                  boxShadow:       sort === s.value ? "2px 2px 0px var(--border-color)" : "none",
                }}>
                {s.label}
              </button>
            ))}
          </div>
          {/* Filters toggle */}
          <button onClick={() => setFiltersOpen(v => !v)}
            className="flex items-center gap-1.5 text-xs font-mono-data px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
            style={{
              backgroundColor: filtersOpen || activeFilterCount > 0 ? "var(--text-primary)" : "var(--bg-card)",
              color:           filtersOpen || activeFilterCount > 0 ? "var(--bg-card)"      : "var(--text-muted)",
              boxShadow: "2px 2px 0px var(--border-color)",
            }}>
            ⚙ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={() => { setSelectedGenres([]); setSelectedFormat(""); setSelectedStatus(""); setMinScore(0); setMinYear(0); fetchResults(1); }}
              className="text-xs font-mono-data px-2 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
              style={{ color: "var(--accent)" }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-2 border-[var(--border-color)] rounded-[var(--border-radius)] p-4 space-y-4"
              style={{ backgroundColor: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>

              {/* Genre multi-select */}
              <div>
                <div className="text-xs section-header mb-2">Genres</div>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map(g => (
                    <button key={g} onClick={() => toggleGenre(g)}
                      className="text-xs px-2.5 py-1 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
                      style={{
                        backgroundColor: selectedGenres.includes(g) ? "var(--accent)" : "var(--bg-primary)",
                        color:           selectedGenres.includes(g) ? "#fff"          : "var(--text-muted)",
                        borderColor:     selectedGenres.includes(g) ? "var(--accent)"  : "var(--border-color)",
                      }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Format */}
                <div>
                  <div className="text-xs section-header mb-1.5">Format</div>
                  <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}
                    className="w-full text-xs border-2 border-[var(--border-color)] rounded-[var(--border-radius)] px-2 py-1.5 cursor-pointer outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
                    <option value="">All formats</option>
                    {FORMATS.map(f => <option key={f} value={f}>{f.replace("_", " ")}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div>
                  <div className="text-xs section-header mb-1.5">Status</div>
                  <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full text-xs border-2 border-[var(--border-color)] rounded-[var(--border-radius)] px-2 py-1.5 cursor-pointer outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
                    <option value="">All statuses</option>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                {/* Min score */}
                <div>
                  <div className="text-xs section-header mb-1.5">Min Score: {minScore > 0 ? minScore : "Any"}</div>
                  <input type="range" min={0} max={90} step={5} value={minScore}
                    onChange={e => setMinScore(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-[var(--accent)]" />
                  <div className="flex justify-between text-xs font-mono-data mt-0.5" style={{ color: "var(--text-muted)", fontSize: "0.55rem" }}>
                    <span>0</span><span>90</span>
                  </div>
                </div>
                {/* Min year */}
                <div>
                  <div className="text-xs section-header mb-1.5">From Year: {minYear > 0 ? minYear : "Any"}</div>
                  <input type="range" min={1960} max={2025} step={1} value={minYear || 1960}
                    onChange={e => setMinYear(parseInt(e.target.value) === 1960 ? 0 : parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-[var(--accent)]" />
                  <div className="flex justify-between text-xs font-mono-data mt-0.5" style={{ color: "var(--text-muted)", fontSize: "0.55rem" }}>
                    <span>1960</span><span>2025</span>
                  </div>
                </div>
              </div>

              <button onClick={() => fetchResults(1)}
                className="w-full py-2 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
                style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-full rounded-[var(--border-radius)] animate-pulse"
              style={{ height: "225px", backgroundColor: "var(--bg-card)", border: "2px solid var(--border-color)" }} />
          ))}
        </div>
      ) : results && results.items.length > 0 ? (
        <>
          <motion.div key={page}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {results.items.map((anime, i) => (
              <motion.div key={anime.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}>
                <AnimePosterCard
                  anime={anime}
                  onAddToLibrary={(a) => { addToLibrary(a); showToast(`Added "${a.title.english ?? a.title.romaji}"`, "📚"); }}
                  libraryEntry={libraryMap.get(anime.id) ?? null}
                  size="md"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => fetchResults(page - 1)} disabled={page <= 1 || loading}
              className="text-xs font-mono-data px-4 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
              ← Prev
            </button>
            <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
              Page {page} of {results.totalPages.toLocaleString()}
            </span>
            <button onClick={() => fetchResults(page + 1)} disabled={page >= results.totalPages || loading}
              className="text-xs font-mono-data px-4 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
              Next →
            </button>
          </div>
        </>
      ) : results ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-3xl">🔍</div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>No anime match these filters.</div>
          <button onClick={() => { setSelectedGenres([]); setSelectedFormat(""); setSelectedStatus(""); setMinScore(0); setMinYear(0); fetchResults(1); }}
            className="text-xs font-mono-data px-4 py-2 border-2 border-[var(--border-color)] rounded cursor-pointer hover:opacity-70"
            style={{ color: "var(--accent)" }}>Clear filters</button>
        </div>
      ) : null}
    </div>
  );
}
