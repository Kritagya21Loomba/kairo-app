"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CountdownBox } from "@/components/cards/CountdownBox";
import { CountdownEditor } from "@/components/ui/CountdownEditor";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/lib/utils";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { CountdownTarget, KairoState } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface WatchTimelineProps {
  state: KairoState;
  language: "jp" | "en" | "both";
  onUpdateCountdowns?: (updated: CountdownTarget[]) => void;
}

export function WatchTimeline({ state, language, onUpdateCountdowns }: WatchTimelineProps) {
  const [countdownEditorOpen, setCountdownEditorOpen] = useState(false);
  const { logs } = useWatchLogs();

  // Compute activity chart data
  const chartData = useMemo(() => {
    if (logs.length === 0) {
      // Fallback dummy data if no logs
      return [
        { month: 'Jan', eps: 24 }, { month: 'Feb', eps: 12 }, { month: 'Mar', eps: 45 },
        { month: 'Apr', eps: 18 }, { month: 'May', eps: 60 }, { month: 'Jun', eps: 32 },
      ];
    }

    const monthCounts = new Map<string, number>();
    const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthCounts.set(`${monthsStr[d.getMonth()]}`, 0);
    }

    logs.forEach(log => {
      const d = new Date(log.watchedOn);
      const key = monthsStr[d.getMonth()];
      if (monthCounts.has(key)) {
        const eps = log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1;
        monthCounts.set(key, monthCounts.get(key)! + eps);
      }
    });

    return Array.from(monthCounts.entries()).map(([month, eps]) => ({ month, eps }));
  }, [logs]);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
        <motion.div variants={item} className="terminal-divider">✦ activity overview</motion.div>

        {/* Activity Chart */}
        <motion.div variants={item} className="card-base p-5">
          <div className="text-xs section-header mb-4">
            {language === "en" ? "Watch Activity" : language === "jp" ? "視聴アクティビティ" : "視聴アクティビティ · Watch Activity"}
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                <XAxis dataKey="month" stroke="var(--border-color)" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--border-color)" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: 0, padding: "8px", boxShadow: "2px 2px 0px var(--border-color)" }}
                  itemStyle={{ color: "var(--text-primary)", fontWeight: "bold", fontFamily: "var(--font-mono)" }}
                  labelStyle={{ color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "4px" }}
                />
                <Line type="monotone" dataKey="eps" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--bg-card)", stroke: "var(--accent)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "var(--accent)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="terminal-divider">✦ upcoming</motion.div>

        {/* Countdowns */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs section-header">
              {language === "en" ? "Upcoming" : language === "jp" ? "カウントダウン" : "カウントダウン · Countdown"}
            </div>
            {onUpdateCountdowns && (
              <button
                onClick={() => setCountdownEditorOpen(true)}
                className="text-xs px-2.5 py-1 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 font-mono-data"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}
              >
                ✎ Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.countdowns.map((cd) => (
              <CountdownBox key={cd.id} countdown={cd} language={language} />
            ))}
            {state.countdowns.length === 0 && (
              <div
                className="card-base p-5 text-sm text-center col-span-2"
                style={{ color: "var(--text-muted)" }}
              >
                No countdowns yet — click ✎ Edit to add one
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="terminal-divider">✦ arc timeline</motion.div>

        {/* Arc timeline (Horizontal) */}
        <motion.div variants={item} className="card-base p-5 overflow-hidden">
          <div className="text-xs section-header mb-5">
            {language === "en" ? "Watch Journey" : language === "jp" ? "視聴の旅" : "視聴の旅 · Watch Journey"}
          </div>
          <div className="relative pt-4 pb-2 overflow-x-auto scrollbar-hide">
            {/* The continuous horizontal line */}
            <div
              className="absolute left-0 right-0 top-8 h-px"
              style={{ backgroundColor: "var(--border-color)", opacity: 0.5 }}
            />
            <div className="flex gap-8 min-w-max px-4">
              {state.timeline.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="relative flex flex-col items-center text-center w-32 group"
                >
                  {/* Node */}
                  <div
                    className="w-4 h-4 rounded-full border-2 border-[var(--border-color)] relative z-10 mb-3"
                    style={{
                      backgroundColor:
                        entry.status === "completed"
                          ? "var(--text-primary)"
                          : entry.status === "in-progress"
                          ? "var(--accent-alt)"
                          : "var(--bg-card)",
                      boxShadow: "0 0 0 4px var(--bg-primary)"
                    }}
                  />
                  {/* Content */}
                  <div className="flex items-center gap-1 flex-wrap justify-center mb-1">
                    <span className="text-base leading-none">{entry.icon}</span>
                    <span className="text-xs font-bold leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>
                      {language === "jp" && entry.titleJP ? entry.titleJP : entry.title}
                    </span>
                  </div>
                  <div
                    className="text-[0.6rem] font-mono-data"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatDate(entry.date, language === "both" ? "en" : language)}
                  </div>
                  
                  {/* Hover tooltip for description */}
                  {entry.description && (
                    <div className="absolute top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-card)] border border-[var(--border-color)] p-2 rounded text-[0.65rem] w-48 z-20 pointer-events-none shadow-lg">
                      {entry.description}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {countdownEditorOpen && onUpdateCountdowns && (
        <CountdownEditor
          countdowns={state.countdowns}
          onSave={onUpdateCountdowns}
          onClose={() => setCountdownEditorOpen(false)}
        />
      )}
    </>
  );
}
