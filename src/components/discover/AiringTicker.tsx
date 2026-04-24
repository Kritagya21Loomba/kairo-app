"use client";
import { useEffect, useRef, useState } from "react";
import type { AniListAnime } from "@/types/anilist";
import { getDisplayTitle } from "@/lib/anilist";
import Link from "next/link";

export function AiringTicker() {
  const [airing, setAiring] = useState<AniListAnime[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef  = useRef<Animation | null>(null);

  useEffect(() => {
    fetch("/api/anime/airing")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setAiring(d); });
  }, []);

  useEffect(() => {
    if (!airing.length || !trackRef.current) return;
    const track = trackRef.current;

    // Wait a frame for layout
    const raf = requestAnimationFrame(() => {
      const singleWidth = track.scrollWidth / 2;
      animRef.current = track.animate(
        [{ transform: "translateX(0)" }, { transform: `translateX(-${singleWidth}px)` }],
        { duration: singleWidth * 38, iterations: Infinity, easing: "linear" }
      );
    });

    return () => {
      cancelAnimationFrame(raf);
      animRef.current?.cancel();
    };
  }, [airing]);

  if (!airing.length) return null;

  const items = [...airing, ...airing];

  return (
    <div
      className="flex items-center border-b-2 border-[var(--border-color)] overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)", height: "36px" }}
    >
      {/* Fixed AIRING NOW label — sits outside overflow:hidden track area */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 h-full px-3 border-r-2 border-[var(--border-color)]"
        style={{ color: "#16A34A", backgroundColor: "var(--bg-primary)", zIndex: 2, minWidth: "max-content" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
        <span className="font-mono-data font-bold" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          AIRING NOW
        </span>
      </div>

      {/* Scrolling track container — clips overflow */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{ height: "100%" }}
        onMouseEnter={() => animRef.current?.pause()}
        onMouseLeave={() => animRef.current?.play()}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--bg-primary), transparent)" }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--bg-primary), transparent)" }}
        />

        {/* Scrolling track */}
        <div
          ref={trackRef}
          className="flex items-center gap-6 h-full px-4"
          style={{ width: "max-content" }}
        >
          {items.map((anime, i) => (
            <Link
              key={`${anime.id}-${i}`}
              href={`/anime/${anime.id}`}
              className="flex items-center gap-2 flex-shrink-0 hover:opacity-70 transition-opacity"
              style={{ textDecoration: "none" }}
            >
              <span style={{ color: anime.coverImage?.color ?? "var(--accent)", fontSize: "0.5rem" }}>◆</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                {getDisplayTitle(anime)}
              </span>
              {anime.nextAiringEpisode && (
                <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem", whiteSpace: "nowrap" }}>
                  Ep {anime.nextAiringEpisode.episode}
                </span>
              )}
              {anime.averageScore && (
                <span className="font-mono-data font-bold" style={{ color: anime.coverImage?.color ?? "var(--accent)", fontSize: "0.6rem" }}>
                  ★{(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
