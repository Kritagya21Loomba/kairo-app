"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import type { KairoState } from "@/types";

interface WatchHabitsProps {
  state: KairoState;
  language: "jp" | "en" | "both";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function generateHeatmap(logs: ReturnType<typeof useWatchLogs>["logs"]) {
  // Generate last 60 days
  const data = new Map<string, number>();
  const today = new Date();
  
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.set(d.toISOString().split("T")[0], 0);
  }

  // Populate counts
  logs.forEach(log => {
    const date = log.watchedOn;
    if (data.has(date)) {
      data.set(date, data.get(date)! + (log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1));
    }
  });

  return Array.from(data.entries()).map(([date, count]) => ({ date, count }));
}

export function WatchHabits({ state, language }: WatchHabitsProps) {
  const { logs, loading } = useWatchLogs();

  const heatmap = useMemo(() => generateHeatmap(logs), [logs]);

  // Derived stats
  const totalEpsLogged = logs.reduce((sum, log) => sum + (log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1), 0);
  const activeDays = new Set(logs.map(l => l.watchedOn)).size;
  const avgPerActiveDay = activeDays > 0 ? (totalEpsLogged / activeDays).toFixed(1) : "0.0";
  const recentBinge = Math.max(...heatmap.map(h => h.count));

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "var(--bg-card)";
    if (count <= 2) return "var(--accent)44";
    if (count <= 5) return "var(--accent)88";
    return "var(--accent)";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
      <motion.div variants={item} className="terminal-divider">✦ tracking activity</motion.div>

      <div className="grid grid-cols-1 gap-4 h-full">
        {/* Streaks & Quests */}
        <motion.div variants={item} className="card-base p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs section-header">
              {language === "en" ? "Streaks & Quests" : language === "jp" ? "ストリークとクエスト" : "ストリークとクエスト · Quests"}
            </div>
          </div>
          
          {/* Active Streak */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-full bg-[var(--accent)] opacity-5" />
            <div className="text-3xl">🔥</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Current Streak</div>
              <div className="text-2xl font-bold font-mono-data leading-none text-[var(--text-primary)]">
                {activeDays} <span className="text-sm font-normal opacity-60">Days</span>
              </div>
            </div>
          </div>

          {/* Daily Quests */}
          <div className="flex-1">
            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Daily Objectives</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {recentBinge > 0 && <div className="w-3 h-3 bg-[var(--accent)] rounded-sm" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">Log an episode today</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Keep the flame alive (+10 XP)</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">Watch 3 episodes</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Progress: {recentBinge}/3 (+25 XP)</div>
                  <div className="w-full h-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded mt-1.5 overflow-hidden">
                    <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.min(100, (recentBinge / 3) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
