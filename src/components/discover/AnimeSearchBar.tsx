"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AniListAnime } from "@/types/anilist";
import { getDisplayTitle, getJPTitle, formatScore, getStatusLabel, getStatusColor } from "@/lib/anilist";

interface AnimeSearchBarProps {
  onAddToLibrary?: (anime: AniListAnime) => void;
  libraryIds?: Set<number>;
}

export function AnimeSearchBar({ onAddToLibrary, libraryIds = new Set() }: AnimeSearchBarProps) {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<AniListAnime[]>([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const router      = useRouter();

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/anime/search?q=${encodeURIComponent(value)}&limit=18`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      router.push(`/anime/${results[activeIdx].id}`);
      setOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Input box */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
        style={{
          backgroundColor: "var(--bg-card)",
          boxShadow: open
            ? "0 0 0 3px var(--accent)33, 4px 4px 0px var(--border-color)"
            : "4px 4px 0px var(--border-color)",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search 27,000+ anime... · アニメを検索"
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-inter), sans-serif" }}
        />
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 rounded-full border-2 flex-shrink-0"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        ) : query ? (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="text-lg leading-none cursor-pointer hover:opacity-60 flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >×</button>
        ) : (
          <kbd
            className="text-xs px-1.5 py-0.5 border rounded font-mono-data hidden sm:block flex-shrink-0"
            style={{ color: "var(--text-muted)", borderColor: "var(--border-color)", fontSize: "0.6rem" }}
          >⌘K</kbd>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              boxShadow: "6px 6px 0px var(--border-color)",
              maxHeight: "65vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-2 border-b-2 border-[var(--border-color)] flex items-center justify-between sticky top-0"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                {loading ? "Searching cache..." : `${results.length} results · Click to open`}
              </span>
              <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.55rem" }}>
                ↑↓ navigate · Enter to open · Esc close
              </span>
            </div>

            {/* Result rows — each row IS a Link */}
            {results.map((anime, i) => {
              const inLibrary = libraryIds.has(anime.id);
              const cover     = anime.coverImage?.large;
              const isActive  = i === activeIdx;
              return (
                <div
                  key={anime.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "var(--border-color)" }}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  {/*
                    The entire row is a <Link> for navigation.
                    The "+ Add" button sits inside with stopPropagation.
                  */}
                  <Link
                    href={`/anime/${anime.id}`}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 w-full transition-colors"
                    style={{
                      backgroundColor: isActive ? "var(--bg-primary)" : "var(--bg-card)",
                      textDecoration: "none",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="flex-shrink-0 rounded overflow-hidden border-2 border-[var(--border-color)]"
                      style={{ width: 36, height: 52, boxShadow: "2px 2px 0px var(--border-color)" }}
                    >
                      {cover
                        ? <Image src={cover} alt="" width={36} height={52} className="object-cover w-full h-full" unoptimized />
                        : <div className="w-full h-full flex items-center justify-center text-base" style={{ backgroundColor: "var(--bg-primary)" }}>📺</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {getDisplayTitle(anime)}
                      </div>
                      {getJPTitle(anime) && (
                        <div className="font-jp truncate" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                          {getJPTitle(anime)}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {anime.seasonYear && (
                          <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                            {anime.seasonYear}
                          </span>
                        )}
                        {anime.format && (
                          <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                            {anime.format.replace("_", " ")}
                          </span>
                        )}
                        {anime.genres?.slice(0, 2).map((g) => (
                          <span key={g} className="px-1 border rounded"
                            style={{ color: "var(--text-muted)", borderColor: "var(--border-color)", fontSize: "0.55rem" }}>
                            {g}
                          </span>
                        ))}
                        {anime.averageScore && (
                          <span className="font-mono-data font-bold" style={{ color: "var(--accent)", fontSize: "0.65rem" }}>
                            ★ {formatScore(anime.averageScore)}
                          </span>
                        )}
                        {anime.status && (
                          <span className="rounded px-1"
                            style={{ color: getStatusColor(anime.status), fontSize: "0.55rem", border: `1px solid ${getStatusColor(anime.status)}55` }}>
                            {getStatusLabel(anime.status)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Library button — stopPropagation prevents Link navigation */}
                    {onAddToLibrary && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddToLibrary(anime);
                        }}
                        className="flex-shrink-0 text-xs px-2.5 py-1 border-2 rounded-[var(--border-radius)] cursor-pointer font-semibold"
                        style={{
                          borderColor:       inLibrary ? "var(--text-muted)" : "var(--border-color)",
                          backgroundColor:   inLibrary ? "var(--bg-primary)" : "var(--text-primary)",
                          color:             inLibrary ? "var(--text-muted)" : "var(--bg-card)",
                          fontSize:          "0.65rem",
                          boxShadow:         inLibrary ? "none" : "2px 2px 0px var(--border-color)",
                        }}
                      >
                        {inLibrary ? "✓" : "+ Add"}
                      </button>
                    )}
                  </Link>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop — closes dropdown on outside click */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
