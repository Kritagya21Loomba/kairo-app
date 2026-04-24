"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { AniListAnime, LibraryEntry } from "@/types/anilist";
import { getDisplayTitle, getJPTitle, formatScore, getStatusColor, getStatusLabel } from "@/lib/anilist";

interface AnimePosterCardProps {
  anime: AniListAnime;
  onAddToLibrary?: (anime: AniListAnime) => void;
  libraryEntry?: LibraryEntry | null;
  size?: "sm" | "md" | "lg";
}

const STATUS_COLORS: Record<string, string> = {
  Airing: "#16A34A",
  Finished: "#6B7280",
  Upcoming: "#D97706",
  Cancelled: "#DC2626",
  Hiatus: "#7C3AED",
};

const LIBRARY_STATUS_LABELS: Record<string, string> = {
  watching: "Watching",
  completed: "✓ Done",
  plan: "Plan",
  dropped: "Dropped",
  hold: "On Hold",
};

export function AnimePosterCard({ anime, onAddToLibrary, libraryEntry, size = "md" }: AnimePosterCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const title = getDisplayTitle(anime);
  const titleJP = getJPTitle(anime);
  const score = formatScore(anime.averageScore);
  const statusLabel = getStatusLabel(anime.status);
  const statusColor = getStatusColor(anime.status);
  const studio = anime.studios?.nodes?.[0]?.name;
  const accentColor = anime.coverImage?.color ?? "#B91C1C";

  const sizeClasses = {
    sm: "w-[120px]",
    md: "w-[160px]",
    lg: "w-[200px]",
  };
  const heightClasses = {
    sm: "h-[170px]",
    md: "h-[225px]",
    lg: "h-[285px]",
  };

  const coverUrl = anime.coverImage?.large ?? anime.coverImage?.extraLarge;

  return (
    <Link href={`/anime/${anime.id}`} className="block">
    <motion.div
      className={`relative flex-shrink-0 ${sizeClasses[size]} cursor-pointer group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* ── Sketch frame (the Kairo aesthetic wrapper) ── */}
      <div
        className={`relative ${heightClasses[size]} w-full overflow-hidden`}
        style={{
          border: "2px solid var(--border-color)",
          borderRadius: "var(--border-radius)",
          boxShadow: hovered
            ? `5px 5px 0px var(--border-color), 0 0 0 1px ${accentColor}33`
            : "3px 3px 0px var(--border-color)",
          transition: "box-shadow 0.2s ease",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {/* Poster image */}
        {coverUrl && !imgError ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 160px, 200px"
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized // AniList images from CDN — skip Next.js optimization
          />
        ) : (
          // Fallback placeholder
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
            }}
          >
            <span className="text-4xl opacity-30">📺</span>
          </div>
        )}

        {/* Score badge — top right */}
        {anime.averageScore && (
          <div
            className="absolute top-1.5 right-1.5 text-xs font-bold font-mono-data px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              color: anime.averageScore >= 80 ? "#4ADE80" : anime.averageScore >= 70 ? "#FCD34D" : "#F87171",
              backdropFilter: "blur(4px)",
              fontSize: "0.65rem",
              letterSpacing: "0.05em",
            }}
          >
            ★ {score}
          </div>
        )}

        {/* Status ribbon — top left */}
        <div
          className="absolute top-1.5 left-1.5 text-xs font-mono-data px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `${statusColor}dd`,
            color: "#FFFFFF",
            fontSize: "0.55rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {statusLabel}
        </div>

        {/* Library badge — if in library */}
        {libraryEntry && (
          <div
            className="absolute bottom-1.5 left-1.5 text-xs font-mono-data px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              color: "#F5F0E8",
              fontSize: "0.55rem",
              letterSpacing: "0.05em",
              backdropFilter: "blur(4px)",
            }}
          >
            {LIBRARY_STATUS_LABELS[libraryEntry.status] ?? libraryEntry.status}
          </div>
        )}

        {/* Hover overlay — slides up from bottom */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 p-3"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)",
              }}
            >
              <div className="text-xs font-semibold leading-tight text-white mb-1 line-clamp-2">
                {title}
              </div>
              {studio && (
                <div className="text-xs opacity-60 text-white truncate" style={{ fontSize: "0.6rem" }}>
                  {studio}
                </div>
              )}
              {/* Genre tags */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {anime.genres?.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-white opacity-70 rounded px-1"
                    style={{
                      fontSize: "0.55rem",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
              {/* Add to library button */}
              {onAddToLibrary && !libraryEntry && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); onAddToLibrary(anime); }}
                  className="mt-2 w-full text-xs font-semibold py-1 rounded cursor-pointer"
                  style={{
                    backgroundColor: accentColor,
                    color: "#FFFFFF",
                    fontSize: "0.65rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  + Add to Library
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Title below poster (themed) ── */}
      <div className="mt-2 px-0.5">
        <div
          className="text-xs font-semibold leading-tight line-clamp-2"
          style={{ color: "var(--text-primary)", fontSize: "0.72rem" }}
        >
          {title}
        </div>
        {titleJP && (
          <div
            className="text-xs mt-0.5 font-jp truncate"
            style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}
          >
            {titleJP}
          </div>
        )}
        {anime.seasonYear && (
          <div
            className="text-xs mt-0.5 font-mono-data"
            style={{ color: "var(--text-muted)", fontSize: "0.6rem", opacity: 0.7 }}
          >
            {anime.season ? `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ` : ""}
            {anime.seasonYear}
            {anime.episodes ? ` · ${anime.episodes} ep` : ""}
          </div>
        )}
      </div>
    </motion.div>
    </Link>
  );
}
