"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { AnimePosterCard } from "./AnimePosterCard";
import type { AniListAnime, LibraryEntry } from "@/types/anilist";

interface AnimeScrollRowProps {
  title: string;
  titleJP: string;
  anime: AniListAnime[];
  loading?: boolean;
  onAddToLibrary?: (anime: AniListAnime) => void;
  libraryMap?: Map<number, LibraryEntry>;
  badge?: string;
  badgeColor?: string;
}

export function AnimeScrollRow({
  title,
  titleJP,
  anime,
  loading,
  onAddToLibrary,
  libraryMap,
  badge,
  badgeColor = "var(--accent)",
}: AnimeScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <section className="space-y-3">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {badge && (
            <span
              className="text-xs font-mono-data px-2 py-0.5 border rounded-full"
              style={{ color: badgeColor, borderColor: badgeColor, fontSize: "0.6rem", opacity: 0.9 }}
            >
              {badge}
            </span>
          )}
          <div>
            <span className="text-xs section-header mr-2">{titleJP}</span>
            <span className="text-base font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
              {title}
            </span>
          </div>
        </div>
        {/* Scroll arrows */}
        <div className="flex gap-1">
          <button
            onClick={() => scrollBy(-1)}
            className="w-7 h-7 flex items-center justify-center border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 transition-opacity text-sm"
            style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="w-7 h-7 flex items-center justify-center border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 transition-opacity text-sm"
            style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] h-[225px] rounded-[var(--border-radius)] animate-pulse"
                style={{ backgroundColor: "var(--bg-card)", border: "2px solid var(--border-color)" }}
              />
            ))
          : anime.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <AnimePosterCard
                  anime={a}
                  onAddToLibrary={onAddToLibrary}
                  libraryEntry={libraryMap?.get(a.id) ?? null}
                  size="md"
                />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
