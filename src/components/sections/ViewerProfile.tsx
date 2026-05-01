"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { AnimeCard } from "@/components/cards/AnimeCard";
import { TasteRadar } from "@/components/charts/TasteRadar";
import { TopAnimeEditor } from "@/components/ui/TopAnimeEditor";
import { AchievementBadge } from "@/components/cards/AchievementBadge";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import type { KairoState, TopAnime, TasteProfile } from "@/types";

interface ViewerProfileProps {
  state: KairoState;
  language: "jp" | "en" | "both";
  isDemo?: boolean;
  onUpdateTopAnime?: (updated: TopAnime[]) => void;
  onUpdateTaste?: (updated: TasteProfile) => void;
}

const XP_TIERS = [
  { min: 0, label: "Curious Viewer", jp: "探求者", xpPerEp: 10 },
  { min: 500, label: "Initiate", jp: "入門者", xpPerEp: 10 },
  { min: 1500, label: "Enthusiast", jp: "熱狂者", xpPerEp: 10 },
  { min: 5000, label: "Otaku", jp: "オタク", xpPerEp: 10 },
  { min: 10000, label: "Connoisseur", jp: "目利き", xpPerEp: 10 },
  { min: 25000, label: "Sage", jp: "賢者", xpPerEp: 10 },
  { min: 50000, label: "Legend", jp: "伝説", xpPerEp: 10 },
  { min: 100000, label: "Myth", jp: "神話", xpPerEp: 10 },
];

function getXpTier(xp: number) {
  let tier = XP_TIERS[0];
  let next = XP_TIERS[1];
  for (let i = 0; i < XP_TIERS.length; i++) {
    if (xp >= XP_TIERS[i].min) {
      tier = XP_TIERS[i];
      next = XP_TIERS[i + 1] ?? XP_TIERS[i];
    }
  }
  const progress = next === tier ? 100 : Math.min(100, ((xp - tier.min) / (next.min - tier.min)) * 100);
  const xpToNext = next === tier ? 0 : next.min - xp;
  return { tier, next, progress, xpToNext };
}

// Milestones that incentivize watching more
const NEXT_MILESTONES = [
  { eps: 10, icon: "🌱", label: "10 Episodes", reward: "Initiate badge" },
  { eps: 50, icon: "⚡", label: "50 Episodes", reward: "Binge Starter trophy" },
  { eps: 100, icon: "💯", label: "Century Viewer", reward: "Century badge unlocked" },
  { eps: 250, icon: "🌊", label: "250 Episodes", reward: "Tide Rider rank" },
  { eps: 500, icon: "🔥", label: "500 Episodes", reward: "Obsessed title" },
  { eps: 1000, icon: "⭐", label: "1000 Episodes", reward: "1K Milestone + Sage class" },
  { eps: 2500, icon: "🏆", label: "2500 Episodes", reward: "Legend tier unlocked" },
  { eps: 5000, icon: "🌟", label: "5000 Episodes", reward: "Myth — rarest rank" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ViewerProfile({ state, language, isDemo, onUpdateTopAnime, onUpdateTaste }: ViewerProfileProps) {
  const [animeEditorOpen, setAnimeEditorOpen] = useState(false);
  const { logs } = useWatchLogs();

  // Compute real data from watch logs (or use demo state values)
  const totalEpisodesWatched = isDemo
    ? state.profile.totalEpisodesWatched
    : logs.reduce((sum, log) => sum + (log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1), 0);

  const totalShowsCompleted = isDemo
    ? state.profile.totalShowsCompleted
    : new Set(logs.map(l => l.animeId)).size;

  const activeDays = isDemo ? Math.floor(state.profile.yearsWatching * 365) : new Set(logs.map(l => l.watchedOn)).size;
  const avgEpisodesPerDay = activeDays > 0 ? Number((totalEpisodesWatched / activeDays).toFixed(1)) : 0;

  const realProfile = {
    ...state.profile,
    totalEpisodesWatched,
    totalShowsCompleted,
    avgEpisodesPerDay,
    yearsWatching: activeDays > 0 ? Number((activeDays / 365).toFixed(1)) : 0,
  };

  // XP system: 10 XP per episode
  const totalXP = totalEpisodesWatched * 10;
  const { tier, next, progress, xpToNext } = getXpTier(totalXP);

  // Next milestone
  const nextMilestone = NEXT_MILESTONES.find(m => m.eps > totalEpisodesWatched) ?? NEXT_MILESTONES[NEXT_MILESTONES.length - 1];
  const milestoneProgress = Math.min(100, (totalEpisodesWatched / nextMilestone.eps) * 100);
  const epsToMilestone = Math.max(0, nextMilestone.eps - totalEpisodesWatched);

  const unlockedAchievements = state.achievements.filter(a => a.unlocked);

  // Auto-compute genre dominance from taste
  const tasteEntries = Object.entries(state.taste) as [string, number][];
  const topGenre = tasteEntries.sort((a, b) => b[1] - a[1])[0];

  const estHours = Math.round((totalEpisodesWatched * 24) / 60);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">

        {/* ── HERO ROW: Profile Card + XP Panel ── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Card - takes 2 cols */}
          <div className="lg:col-span-2">
            <ProfileCard profile={realProfile} language={language} />
          </div>

          {/* XP & Level Panel */}
          <div className="card-base p-5 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="text-xs section-header">
                {language === "en" ? "Viewer Rank" : language === "jp" ? "ランク" : "ランク · Rank"}
              </div>
              <span className="text-xs font-mono-data px-2 py-0.5 border border-[var(--accent)] rounded-full" style={{ color: "var(--accent)", fontSize: "0.6rem" }}>
                {totalXP.toLocaleString()} XP
              </span>
            </div>

            {/* Current rank display */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-[var(--border-radius)] border-2 border-[var(--border-color)] flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-alt))" }}
              >
                {tier.min >= 50000 ? "🌟" : tier.min >= 25000 ? "⭐" : tier.min >= 10000 ? "🏆" : tier.min >= 5000 ? "🔥" : tier.min >= 1500 ? "⚡" : tier.min >= 500 ? "✨" : "🌱"}
              </div>
              <div>
                <div className="text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{tier.label}</div>
                <div className="text-sm font-jp" style={{ color: "var(--text-muted)" }}>{tier.jp}</div>
              </div>
            </div>

            {/* XP progress to next rank */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>→ {next.label}</span>
                {xpToNext > 0 && (
                  <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
                    {xpToNext.toLocaleString()} XP left
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-alt))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs font-mono-data mt-1.5" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                {Math.round(progress)}% · {totalEpisodesWatched} eps logged
              </p>
            </div>

            {/* Estimated hours stat */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Time invested: <span className="font-bold font-mono-data" style={{ color: "var(--text-primary)" }}>{estHours.toLocaleString()}h</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── NEXT MILESTONE incentive panel ── */}
        <motion.div variants={item} className="card-base p-4 border-2" style={{ borderColor: "var(--accent)", borderStyle: "dashed" }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-3xl">{nextMilestone.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>NEXT MILESTONE</span>
                  <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>— {nextMilestone.label}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
                    {totalEpisodesWatched} / {nextMilestone.eps} eps
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                    {epsToMilestone > 0 ? `${epsToMilestone} eps to go` : "Complete! 🎉"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-left sm:text-right">
              <div className="text-xs font-mono-data mb-1" style={{ color: "var(--text-muted)" }}>REWARD</div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{nextMilestone.reward}</div>
            </div>
          </div>
        </motion.div>

        {/* ── CONTENT ROW: Taste + Trophy + Top Anime ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Taste Radar */}
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

              {/* Taste insights */}
              <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-2">
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Top Genre</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)] capitalize">{topGenre?.[0] ?? "—"}</div>
                </div>
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Affinity</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">{topGenre?.[1] ?? 0}%</div>
                </div>
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Shows Done</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">{totalShowsCompleted}</div>
                </div>
                <div className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                  <div className="text-[0.6rem] uppercase text-[var(--text-muted)] font-bold mb-1">Pace</div>
                  <div className="text-sm font-mono-data font-bold text-[var(--text-primary)]">{avgEpisodesPerDay} ep/d</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right 2 cols: Trophy + Top Anime */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Trophy Case */}
            <motion.div variants={item} className="card-base p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs section-header">
                  {language === "en" ? "Trophy Case" : language === "jp" ? "実績バッジ" : "実績バッジ · Trophy Case"}
                </div>
                <div className="text-xs font-mono-data" style={{ color: "var(--accent)" }}>
                  {unlockedAchievements.length}/{state.achievements.length} unlocked
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {state.achievements.slice(0, 4).map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} language={language} />
                ))}
              </div>
              {unlockedAchievements.length === 0 && !isDemo && (
                <p className="text-xs text-center mt-3 font-mono-data" style={{ color: "var(--text-muted)" }}>
                  Log episodes to start unlocking badges 👆
                </p>
              )}
            </motion.div>

            {/* Top Anime */}
            <motion.div variants={item} className="card-base p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs section-header">
                  {language === "en" ? "Top Anime" : language === "jp" ? "トップ作品" : "トップ作品 · Top Anime"}
                  <span className="ml-2 font-mono-data" style={{ color: "var(--accent)" }}>({state.topAnime.length})</span>
                </div>
                {!isDemo && onUpdateTopAnime && (
                  <button
                    onClick={() => setAnimeEditorOpen(true)}
                    className="text-[0.65rem] px-2 py-0.5 border-2 border-[var(--border-color)] rounded uppercase tracking-wider font-bold hover:opacity-70 transition-opacity"
                    style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)", boxShadow: "1px 1px 0px var(--border-color)" }}
                  >
                    Edit List
                  </button>
                )}
              </div>
              {state.topAnime.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {state.topAnime.slice(0, 6).map((anime, i) => (
                    <AnimeCard key={anime.id} anime={anime} rank={i + 1} language={language} delay={i * 0.06} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="text-3xl">🎌</div>
                  <p className="text-xs text-center font-mono-data" style={{ color: "var(--text-muted)" }}>
                    Your all-time favourites go here.<br />Click Edit List to add your top shows.
                  </p>
                  {onUpdateTopAnime && (
                    <button
                      onClick={() => setAnimeEditorOpen(true)}
                      className="text-xs font-bold px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}
                    >
                      + Add Top Anime
                    </button>
                  )}
                </div>
              )}
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