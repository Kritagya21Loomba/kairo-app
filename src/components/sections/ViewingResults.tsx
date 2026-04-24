"use client";
import { motion } from "framer-motion";
import { AchievementBadge } from "@/components/cards/AchievementBadge";
import type { KairoState } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface ViewingResultsProps {
  state: KairoState;
  language: "jp" | "en" | "both";
}

export function ViewingResults({ state, language }: ViewingResultsProps) {
  const unlockedCount = state.achievements.filter((a) => a.unlocked).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">



      {/* Arc Ranking */}
      <motion.div variants={item} className="card-base p-5">
        <div className="text-xs section-header mb-6 flex items-center justify-between">
          <span>{language === "en" ? "Arc Ranking" : language === "jp" ? "アークランキング" : "アークランキング · Arc Ranking"}</span>
          <span className="font-mono-data opacity-60">S-Tier to D-Tier</span>
        </div>
        <div className="space-y-4">
          {state.arcRatings.map((arc, index) => (
            <div key={arc.id} className="flex items-center gap-4 p-3 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] bg-[var(--bg-primary)]">
              <div className="text-xl font-bold font-mono-data w-8 text-center" style={{ color: "var(--accent)" }}>
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                  {arc.arcName}
                </div>
                <div className="text-xs truncate font-mono-data" style={{ color: "var(--text-muted)" }}>
                  {arc.animeTitle}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border transition-colors"
                    style={{
                      backgroundColor: i < arc.difficulty ? "var(--accent)" : "transparent",
                      borderColor: i < arc.difficulty ? "var(--accent)" : "var(--border-color)",
                      opacity: i < arc.difficulty ? 1 : 0.35,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="terminal-divider">✦ achievements</motion.div>

      {/* Achievements */}
      <motion.div variants={item} className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs section-header">
            {language === "en" ? "Achievements" : language === "jp" ? "実績バッジ" : "実績バッジ · Achievements"}
          </div>
          <span className="text-xs font-mono-data" style={{ color: "var(--accent)", opacity: 0.8 }}>
            {unlockedCount}/{state.achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {state.achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              language={language}
            />
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
