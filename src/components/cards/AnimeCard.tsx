"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { TopAnime } from "@/types";

interface AnimeCardProps {
  anime: TopAnime;
  rank: number;
  language?: "jp" | "en" | "both";
  delay?: number;
}

export function AnimeCard({ anime, rank, language = "both", delay = 0 }: AnimeCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover="hover"
      className="relative group rounded-[var(--border-radius)] overflow-hidden border-2 border-[var(--border-color)] bg-black cursor-pointer"
      style={{
        aspectRatio: "2/3",
        boxShadow: "3px 3px 0px var(--border-color)",
      }}
    >
      {/* Cover Image */}
      {anime.coverUrl ? (
        <Image
          src={anime.coverUrl}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-40"
          unoptimized
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${anime.colorAccent}44, ${anime.colorAccent}11)`,
          }}
        />
      )}

      {/* Rank Overlay */}
      <div
        className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-bold font-mono-data z-10"
        style={{ color: anime.colorAccent, boxShadow: "2px 2px 0px var(--border-color)" }}
      >
        #{rank}
      </div>

      {/* Hover Info */}
      <motion.div
        variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
        initial="initial"
        className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none"
      >
        <div className="text-sm font-bold text-white line-clamp-2 leading-tight">
          {anime.title}
        </div>
        {anime.titleJP && language !== "en" && (
          <div className="text-xs font-jp text-white/70 line-clamp-1 mt-0.5">
            {anime.titleJP}
          </div>
        )}
        {anime.rating && (
          <div className="text-xs font-bold font-mono-data mt-1" style={{ color: anime.colorAccent }}>
            ★ {anime.rating}/10
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (anime.animeId) {
    return (
      <Link href={`/anime/${anime.animeId}`} className="block w-full h-full">
        {content}
      </Link>
    );
  }

  return content;
}
