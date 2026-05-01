"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import type { KairoState } from "@/types";

interface WatchHabitsProps {
  state: KairoState;
  language: "jp" | "en" | "both";
  isDemo?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function computeStreaks(activeDates: Set<string>): { current: number; longest: number } {
  if (activeDates.size === 0) return { current: 0, longest: 0 };
  const sorted = Array.from(activeDates).sort();
  let current = 0;
  let longest = 0;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  // Check if streak is still active (includes today or yesterday)
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const lastDate = sorted[sorted.length - 1];
  if (lastDate === today || lastDate === yesterday) {
    current = streak;
  } else {
    current = 0;
  }

  return { current, longest };
}

function generateHeatmap(logs: ReturnType<typeof useWatchLogs>["logs"]) {
  const data = new Map<string, number>();
  const today = new Date();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.set(d.toISOString().split("T")[0], 0);
  }
  logs.forEach(log => {
    const date = log.watchedOn;
    if (data.has(date)) {
      data.set(date, data.get(date)! + (log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1));
    }
  });
  return Array.from(data.entries()).map(([date, count]) => ({ date, count }));
}

// Weekly quests — seed from current ISO week
function getWeeklyQuests(totalEps: number, activeDays: number, longestStreak: number) {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  // Different quest sets per week
  const sets = [
    [
      { icon: "🔥", label: "7-day streak", desc: "Watch something every day this week", xp: 100, done: longestStreak >= 7 },
      { icon: "⚡", label: "Binge 5 eps in a day", desc: "Go full couch-potato mode", xp: 50, done: false },
      { icon: "🌸", label: "Try a new genre", desc: "Log something outside your top genre", xp: 30, done: false },
    ],
    [
      { icon: "📚", label: "Complete a series", desc: "Finish any show in your library", xp: 80, done: false },
      { icon: "🌙", label: "Late-night session", desc: "Log an episode after 10pm", xp: 25, done: false },
      { icon: "🔁", label: "3-day streak", desc: "Watch three days in a row", xp: 40, done: longestStreak >= 3 },
    ],
    [
      { icon: "🎯", label: "10 episodes this week", desc: "Stay consistent throughout the week", xp: 60, done: totalEps >= 10 },
      { icon: "🤝", label: "Add 3 to Library", desc: "Find shows to watch on Discover", xp: 20, done: false },
      { icon: "⭐", label: "Rate 5 episodes", desc: "Leave detailed episode ratings", xp: 35, done: false },
    ],
  ];
  return sets[week % sets.length];
}

// Demo heatmap data
const DEMO_HEATMAP = (() => {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Simulate somewhat active pattern for demo
    const rand = Math.random();
    const count = rand > 0.55 ? (rand > 0.8 ? Math.floor(Math.random() * 8) + 3 : Math.floor(Math.random() * 3) + 1) : 0;
    data.push({ date: d.toISOString().split("T")[0], count });
  }
  return data;
})();

export function WatchHabits({ state, language, isDemo }: WatchHabitsProps) {
  const { logs } = useWatchLogs();

  const heatmap = useMemo(() => isDemo ? DEMO_HEATMAP : generateHeatmap(logs), [logs, isDemo]);

  const totalEpsLogged = isDemo
    ? state.profile.totalEpisodesWatched
    : logs.reduce((sum, log) => sum + (log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1), 0);

  const activeDateSet = useMemo(() => {
    if (isDemo) {
      const s = new Set<string>();
      DEMO_HEATMAP.filter(h => h.count > 0).forEach(h => s.add(h.date));
      return s;
    }
    return new Set(logs.map(l => l.watchedOn));
  }, [logs, isDemo]);

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => computeStreaks(activeDateSet),
    [activeDateSet]
  );

  const todaysEps = isDemo ? 3 : (heatmap.find(h => h.date === new Date().toISOString().split("T")[0])?.count ?? 0);
  const weeklyQuests = getWeeklyQuests(totalEpsLogged, activeDateSet.size, longestStreak);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "var(--bg-primary)";
    if (count <= 2) return "var(--accent)55";
    if (count <= 5) return "var(--accent)99";
    return "var(--accent)";
  };

  const streakFlame = currentStreak >= 7 ? "🔥🔥" : currentStreak >= 3 ? "🔥" : currentStreak >= 1 ? "✨" : "💤";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4 h-full">
      <motion.div variants={item} className="terminal-divider">✦ activity tracker</motion.div>

      <motion.div variants={item} className="card-base p-5 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs section-header">
            {language === "en" ? "Streaks & Quests" : language === "jp" ? "ストリークとクエスト" : "ストリークとクエスト · Quests"}
          </div>
          <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
            Week {new Date().toISOString().slice(0, 10)}
          </span>
        </div>

        {/* Streak Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-[var(--border-radius)] border-2 relative overflow-hidden" style={{ borderColor: currentStreak > 0 ? "var(--accent)" : "var(--border-color)", backgroundColor: "var(--bg-primary)" }}>
            <div className="absolute top-0 right-0 h-full w-16 opacity-5" style={{ background: "var(--accent)" }} />
            <div className="text-xl mb-1">{streakFlame}</div>
            <div className="text-2xl font-bold font-mono-data leading-none" style={{ color: "var(--text-primary)" }}>
              {currentStreak}
              <span className="text-xs font-normal ml-1 opacity-60">days</span>
            </div>
            <div className="text-[0.6rem] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>Current Streak</div>
          </div>
          <div className="p-3 rounded-[var(--border-radius)] border border-[var(--border-color)] relative overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
            <div className="text-xl mb-1">🏅</div>
            <div className="text-2xl font-bold font-mono-data leading-none" style={{ color: "var(--text-primary)" }}>
              {longestStreak}
              <span className="text-xs font-normal ml-1 opacity-60">days</span>
            </div>
            <div className="text-[0.6rem] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>Best Streak</div>
          </div>
        </div>

        {/* Heatmap */}
        <div>
          <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Last 56 Days
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
            {heatmap.slice(0, 56).map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className="aspect-square rounded-sm cursor-default"
                style={{
                  backgroundColor: getHeatmapColor(day.count),
                  border: "1px solid var(--border-color)",
                  opacity: day.count === 0 ? 0.5 : 1,
                }}
                title={`${day.date}: ${day.count} eps`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[0.55rem] font-mono-data" style={{ color: "var(--text-muted)" }}>None</span>
            {[0.3, 0.6, 1].map((opacity, i) => (
              <div key={i} className="w-3 h-3 rounded-sm border" style={{ backgroundColor: `var(--accent)`, opacity, borderColor: "var(--border-color)" }} />
            ))}
            <span className="text-[0.55rem] font-mono-data" style={{ color: "var(--text-muted)" }}>Lots</span>
          </div>
        </div>

        {/* Weekly Quests */}
        <div>
          <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-3 flex items-center justify-between" style={{ color: "var(--text-muted)" }}>
            <span>Weekly Quests</span>
            <span>Resets Sunday</span>
          </div>
          <div className="space-y-2">
            {weeklyQuests.map((quest, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-[var(--border-radius)] border transition-all"
                style={{
                  borderColor: quest.done ? "var(--accent)" : "var(--border-color)",
                  backgroundColor: quest.done ? "var(--bg-primary)" : "transparent",
                  opacity: quest.done ? 0.7 : 1,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs"
                  style={{
                    borderColor: quest.done ? "var(--accent)" : "var(--border-color)",
                    backgroundColor: quest.done ? "var(--accent)" : "transparent",
                    color: quest.done ? "var(--bg-card)" : "var(--text-muted)",
                  }}
                >
                  {quest.done ? "✓" : quest.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold leading-tight" style={{ color: "var(--text-primary)", textDecoration: quest.done ? "line-through" : "none" }}>
                    {quest.label}
                  </div>
                  <div className="text-xs opacity-60 mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {quest.desc}
                  </div>
                </div>
                <div className="text-xs font-mono-data font-bold flex-shrink-0" style={{ color: "var(--accent)" }}>
                  +{quest.xp} XP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's progress */}
        <div className="pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.6rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Today</span>
            <span className="text-xs font-mono-data font-bold" style={{ color: "var(--text-primary)" }}>{todaysEps} eps logged</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (todaysEps / 5) * 100)}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="text-[0.55rem] font-mono-data mt-1" style={{ color: "var(--text-muted)" }}>
            Daily goal: 5 episodes
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}