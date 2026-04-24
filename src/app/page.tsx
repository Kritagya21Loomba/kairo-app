"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimeScrollRow } from "@/components/discover/AnimeScrollRow";
import { AnimeSearchBar } from "@/components/discover/AnimeSearchBar";
import { AiringTicker } from "@/components/discover/AiringTicker";
import { BrowseSection } from "@/components/discover/BrowseSection";
import { AnimePosterCard } from "@/components/discover/AnimePosterCard";
import { useLibrary } from "@/hooks/useLibrary";
import { showToast } from "@/components/ui/Toast";
import type { AniListAnime } from "@/types/anilist";

export default function DiscoverPage() {
  const [airing, setAiring]       = useState<AniListAnime[]>([]);
  const [trending, setTrending]   = useState<AniListAnime[]>([]);
  const [upcoming, setUpcoming]   = useState<AniListAnime[]>([]);
  const [surpriseAnime, setSurpriseAnime] = useState<AniListAnime[]>([]);
  const [loadingAiring, setLoadingAiring]     = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingSurprise, setLoadingSurprise] = useState(false);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  const { addToLibrary, libraryIds, libraryMap } = useLibrary();

  // anime.js-style stagger on hero title
  useEffect(() => {
    const el = heroTitleRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    el.innerHTML = text.split("").map((ch) =>
      ch === " "
        ? "<span>&nbsp;</span>"
        : `<span style="display:inline-block;opacity:0;transform:translateY(12px)">${ch}</span>`
    ).join("");
    const spans = el.querySelectorAll<HTMLSpanElement>("span");
    spans.forEach((span, i) => {
      setTimeout(() => {
        span.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        span.style.transform  = "translateY(0)";
        span.style.opacity    = "1";
      }, i * 40);
    });
  }, []);

  const handleAddToLibrary = useCallback((anime: AniListAnime) => {
    addToLibrary(anime);
    showToast(`Added "${anime.title.english ?? anime.title.romaji}" to Library`, "📚");
  }, [addToLibrary]);

  // Fetch scroll-row data
  useEffect(() => {
    fetch("/api/anime/airing")
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setAiring(d); })
      .finally(() => setLoadingAiring(false));
    fetch("/api/anime/trending")
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setTrending(d); })
      .finally(() => setLoadingTrending(false));
    fetch("/api/anime/upcoming")
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setUpcoming(d); })
      .finally(() => setLoadingUpcoming(false));
  }, []);

  const fetchSurprise = useCallback(async () => {
    setLoadingSurprise(true);
    try {
      const data = await fetch("/api/anime/random?count=12&minScore=65").then(r => r.json());
      if (Array.isArray(data)) setSurpriseAnime(data);
    } finally { setLoadingSurprise(false); }
  }, []);

  return (
    <div className="min-h-screen relative z-10">

      {/* Live airing ticker */}
      <AiringTicker />

      {/* Hero */}
      <section
        className="border-b-2 border-[var(--border-color)] scan-line-bg"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center gap-5">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-xs section-header mb-2">発見システム · Discover</div>
            <h1
              ref={heroTitleRef}
              className="text-3xl sm:text-5xl font-jp font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              今日は何を観る？
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              27,000+ anime · Search instantly · Track your journey
            </p>
          </motion.div>

          <motion.div className="w-full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AnimeSearchBar onAddToLibrary={handleAddToLibrary} libraryIds={libraryIds} />
          </motion.div>

          {/* Stats + Surprise Me */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-3 flex-wrap justify-center"
          >
            {[
              { label: "27k+ Anime in DB", icon: "🗄" },
              { label: "Live Airing Data",  icon: "●", color: "#16A34A" },
              { label: "Episode Ratings",   icon: "★" },
            ].map(({ label, icon, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-mono-data"
                style={{ color: color ?? "var(--text-muted)", opacity: 0.8 }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
            <div className="w-px h-4 mx-1" style={{ backgroundColor: "var(--border-color)" }} />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchSurprise}
              disabled={loadingSurprise}
              className="flex items-center gap-1.5 text-xs font-mono-data px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-card)",
                boxShadow: "2px 2px 0px var(--border-color)",
                opacity: loadingSurprise ? 0.6 : 1,
              }}
            >
              {loadingSurprise ? "Shuffling..." : "🎲 Surprise Me"}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Surprise Me results */}
      <AnimatePresence>
        {surpriseAnime.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b-2 border-[var(--border-color)] overflow-hidden"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-base">🎲</span>
                  <div>
                    <div className="text-xs section-header">Surprise Pick</div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Random Discovery</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchSurprise} disabled={loadingSurprise}
                    className="text-xs font-mono-data px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}
                  >🔄 Reshuffle</button>
                  <button
                    onClick={() => setSurpriseAnime([])}
                    className="text-xs font-mono-data px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}
                  >×</button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {surpriseAnime.map((anime, i) => (
                  <motion.div key={anime.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}>
                    <AnimePosterCard
                      anime={anime}
                      onAddToLibrary={handleAddToLibrary}
                      libraryEntry={libraryMap.get(anime.id) ?? null}
                      size="md"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Scroll rows */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <AnimeScrollRow
          title="Currently Airing" titleJP="現在放送中"
          anime={airing} loading={loadingAiring}
          onAddToLibrary={handleAddToLibrary} libraryMap={libraryMap}
          badge="● LIVE" badgeColor="#16A34A"
        />
        <AnimeScrollRow
          title="Trending Now" titleJP="急上昇"
          anime={trending} loading={loadingTrending}
          onAddToLibrary={handleAddToLibrary} libraryMap={libraryMap}
          badge="🔥 HOT" badgeColor="var(--accent)"
        />
        <AnimeScrollRow
          title="Coming Soon" titleJP="まもなく放送"
          anime={upcoming} loading={loadingUpcoming}
          onAddToLibrary={handleAddToLibrary} libraryMap={libraryMap}
          badge="📅 UPCOMING" badgeColor="#D97706"
        />

        {/* Browse database */}
        <div className="space-y-5">
          <div className="terminal-divider">✦ browse the database</div>
          <BrowseSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border-color)] mt-8" style={{ backgroundColor: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs"
          style={{ color: "var(--text-muted)" }}>
          <span className="font-jp">カイロ — アニメ発見システム</span>
          <span className="font-mono-data">27,202 anime cached · Data by AniList · kairo.sys v2.1</span>
        </div>
      </footer>
    </div>
  );
}
