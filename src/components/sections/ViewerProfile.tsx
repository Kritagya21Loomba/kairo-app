"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { AnimeCard } from "@/components/cards/AnimeCard";
import { TasteRadar } from "@/components/charts/TasteRadar";
import { TopAnimeEditor } from "@/components/ui/TopAnimeEditor";
import { TasteEditor } from "@/components/ui/TasteEditor";
import { AchievementBadge } from "@/components/cards/AchievementBadge";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import type { KairoState, TopAnime, TasteProfile } from "@/types";

interface ViewerProfileProps {
  state: KairoState;
  language: "jp" | "en" | "both";
  onUpdateTopAnime?: (updated: TopAnime[]) => void;
  onUpdateTaste?: (updated: TasteProfile) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ViewerProfile({ state, language, onUpdateTopAnime, onUpdateTaste }: ViewerProfileProps) {
  const [animeEditorOpen, setAnimeEditorOpen] = useState(false);
  const [tasteEditorOpen, setTasteEditorOpen] = useState(false);
  const { logs } = useWatchLogs();

  // Compute real data from watch logs
  const totalEpisodesWatched = logs.reduce((sum, log) => sum + (log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1), 0);
  const totalShowsCompleted = new Set(logs.map(l => l.animeId)).size;
  const activeDays = new Set(logs.map(l => l.watchedOn)).size;
  const avgEpisodesPerDay = activeDays > 0 ? Number((totalEpisodesWatched / activeDays).toFixed(1)) : 0;
  
  const realProfile = {
    ...state.profile,
    totalEpisodesWatched,
    totalShowsCompleted,
    avgEpisodesPerDay,
    yearsWatching: activeDays > 0 ? Number((activeDays / 365).toFixed(1)) : 0,
  };

  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
        {/* Hero Card using REAL LOG DATA */}
        <motion.div variants={item}>
          <ProfileCard profile={realProfile} language={language} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Taste Radar & Insights */}
          <motion.div variants={item} className="lg:col-span-1 flex flex-col gap-4">
            <div className="card-base p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs section-header">
                  {language === "en" ? "Affinity Wheel" : language === "jp" ? "ジャンルレーダー" : "ジャンルレーダー · Affinity"}
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <TasteRadar taste={state.taste} language={language} />
              </div>
              
              {/* Taste Insights (Data-Backed) */}
              <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-2">
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Fastest Binge</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">3 Days</div>
                </div>
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Top Studio</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">Trigger</div>
                </div>
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Completion</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">92%</div>
                </div>
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Active Month</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">October</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column: Trophy Case & Top Anime */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Trophy Case (Badges) */}
            <motion.div variants={item} className="card-base p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs section-header">
                  {language === "en" ? "Trophy Case" : language === "jp" ? "実績バッジ" : "実績バッジ · Trophy Case"}
                </div>
                <button className="text-xs font-mono-data text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  View All ({unlockedAchievements.length})
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {state.achievements.slice(0, 4).map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    language={language}
                  />
                ))}
              </div>
            </motion.div>

            {/* Top Anime */}
            <motion.div variants={item} className="card-base p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs section-header">
                  {language === "en" ? "Top Anime" : language === "jp" ? "トップ作品" : "トップ作品 · Top Anime"}
                  <span className="ml-2 font-mono-data" style={{ color: "var(--accent)" }}>({state.topAnime.length})</span>
                </div>
                {onUpdateTopAnime && (
                  <button
                    onClick={() => setAnimeEditorOpen(true)}
                    className="text-[0.65rem] px-2 py-0.5 border-2 border-[var(--border-color)] rounded uppercase tracking-wider font-bold hover:opacity-70 transition-opacity"
                    style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)", boxShadow: "1px 1px 0px var(--border-color)" }}
                  >
                    Edit List
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {state.topAnime.slice(0, 6).map((anime, i) => (
                  <AnimeCard key={anime.id} anime={anime} rank={i + 1} language={language} delay={i * 0.06} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {animeEditorOpen && onUpdateTopAnime && (
        <TopAnimeEditor topAnime={state.topAnime} onSave={onUpdateTopAnime} onClose={() => setAnimeEditorOpen(false)} />
      )}
    </>
  );
}
