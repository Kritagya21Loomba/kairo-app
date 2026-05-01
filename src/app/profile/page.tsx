"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalShell } from "@/components/layout/TerminalShell";
import { useKairoState } from "@/hooks/useKairoState";
import { useTweaksContext } from "@/contexts/TweaksContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchLogs } from "@/hooks/useWatchLogs";
import { DEMO_STATE } from "@/data/demoState";
import type { WatchLogEntry } from "@/hooks/useWatchLogs";
import { TasteRadar } from "@/components/charts/TasteRadar";
import { AchievementBadge } from "@/components/cards/AchievementBadge";
import { LogWatchModal } from "@/components/ui/LogWatchModal";
import Image from "next/image";
import Link from "next/link";
import type { KairoState } from "@/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

const XP_TIERS = [
  { min: 0, label: "New Viewer", jp: "新参者", icon: "🌱" },
  { min: 500, label: "Initiate", jp: "入門者", icon: "✨" },
  { min: 1500, label: "Enthusiast", jp: "熱狂者", icon: "⚡" },
  { min: 5000, label: "Otaku", jp: "オタク", icon: "🔥" },
  { min: 10000, label: "Connoisseur", jp: "目利き", icon: "🏆" },
  { min: 25000, label: "Sage", jp: "賢者", icon: "⭐" },
  { min: 50000, label: "Legend", jp: "伝説", icon: "🌟" },
  { min: 100000, label: "Myth", jp: "神話", icon: "🔮" },
];

function getXpInfo(xp: number) {
  let tier = XP_TIERS[0], next = XP_TIERS[1];
  for (let i = 0; i < XP_TIERS.length; i++) {
    if (xp >= XP_TIERS[i].min) { tier = XP_TIERS[i]; next = XP_TIERS[i + 1] ?? XP_TIERS[i]; }
  }
  const progress = next === tier ? 100 : Math.min(100, ((xp - tier.min) / (next.min - tier.min)) * 100);
  return { tier, next, progress, xpToNext: Math.max(0, next.min - xp) };
}

function computeStreak(activeDates: Set<string>) {
  if (!activeDates.size) return { current: 0, longest: 0 };
  const sorted = Array.from(activeDates).sort();
  let streak = 1, longest = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const last = sorted[sorted.length - 1];
  return { current: (last === today || last === yesterday) ? streak : 0, longest };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// ─── Demo static wrapper ──────────────────────────────────────────────────────
function DemoPage({ onBack }: { onBack: () => void }) {
  const { tweaks } = useTweaksContext();
  const demoLogs: WatchLogEntry[] = useMemo(() => [
    { id: "d1", animeId: 30, title: "Neon Genesis Evangelion", coverUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-j01r45d9uI4c.png", epStart: 24, epEnd: 26, watchedOn: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], durationMin: 72 },
    { id: "d2", animeId: 5114, title: "Fullmetal Alchemist: Brotherhood", coverUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-Kz9BsbIADi4q.png", epStart: 60, epEnd: 64, watchedOn: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], durationMin: 120 },
    { id: "d3", animeId: 9253, title: "Steins;Gate", coverUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-1Q38cE12B7t3.jpg", epStart: 22, epEnd: 24, watchedOn: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0], durationMin: 72 },
    { id: "d4", animeId: 101348, title: "Vinland Saga", coverUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-1i2Q5o3T087Y.png", epStart: 20, epEnd: 24, watchedOn: new Date(Date.now() - 86400000 * 8).toISOString().split("T")[0], durationMin: 120 },
  ], []);

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 pt-4 pb-16">
      <div className="w-full mb-5 p-2 text-center text-xs font-mono-data font-bold tracking-wider flex items-center justify-center gap-4"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)" }}>
        <span>👁 DEMO PROFILE — VIEW ONLY</span>
        <button onClick={onBack} className="underline cursor-pointer hover:opacity-70">← Sign in to create yours</button>
      </div>
      <ProfileContent state={DEMO_STATE} logs={demoLogs} language={tweaks.language} isDemo />
    </div>
  );
}

// ─── Sign-in screen ───────────────────────────────────────────────────────────
function SignInScreen({ onDemo, onSignIn, error }: { onDemo: () => void; onSignIn: () => void; error: string }) {
  return (
    <div className="max-w-lg mx-auto w-full px-4 py-20 flex flex-col items-center gap-8">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-6xl mb-5">⛩️</div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Your Anime Identity</h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Log episodes. Build streaks. See your taste in a way that's actually cool to share.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3 w-full text-center">
        {[["🔥", "Streaks"], ["🏆", "Achievements"], ["📊", "Taste DNA"], ["⚡", "XP Levels"], ["🎌", "Top Shows"], ["📤", "Share Card"]].map(([icon, label]) => (
          <div key={label} className="card-base p-3 flex flex-col gap-1 items-center">
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{label}</span>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex flex-col gap-3 w-full">
        <button onClick={onSignIn}
          className="w-full py-3 font-bold text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-85 transition-opacity flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>
          🌐 Sign In with Google
        </button>
        <button onClick={onDemo}
          className="w-full py-3 font-semibold text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 transition-opacity font-mono-data"
          style={{ color: "var(--text-muted)", boxShadow: "2px 2px 0px var(--border-color)" }}>
          Preview a Demo Profile →
        </button>
        {error && <p className="text-xs text-center font-mono-data" style={{ color: "#DC2626" }}>{error}</p>}
      </motion.div>
    </div>
  );
}

// ─── The actual profile content (shared by real + demo) ─────────────────────
interface ProfileContentProps {
  state: KairoState;
  logs: WatchLogEntry[];
  language: "jp" | "en" | "both";
  isDemo?: boolean;
  onOpenLog?: () => void;
  onUpdateTopAnime?: (anime: KairoState["topAnime"]) => void;
}

function ProfileContent({ state, logs, language, isDemo, onOpenLog, onUpdateTopAnime }: ProfileContentProps) {
  const totalEps = logs.reduce((s, l) => s + (l.epEnd && l.epStart ? l.epEnd - l.epStart + 1 : 1), 0);
  const uniqueShows = new Set(logs.map(l => l.animeId)).size;
  const estHours = Math.round((totalEps * 24) / 60);
  const xp = totalEps * 10;
  const { tier, next, progress, xpToNext } = getXpInfo(xp);
  const activeDates = useMemo(() => new Set(logs.map(l => l.watchedOn)), [logs]);
  const { current: streakDays, longest: longestStreak } = useMemo(() => computeStreak(activeDates), [activeDates]);

  // Heatmap last 28 days
  const heatmap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      map.set(d, 0);
    }
    logs.forEach(l => { if (map.has(l.watchedOn)) map.set(l.watchedOn, map.get(l.watchedOn)! + (l.epEnd && l.epStart ? l.epEnd - l.epStart + 1 : 1)); });
    return Array.from(map.entries());
  }, [logs]);

  const recentLogs = logs.slice(0, 5);
  const topGenreEntry = Object.entries(state.taste).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  const unlockedCount = state.achievements.filter(a => a.unlocked).length;

  const avatarGradients = [
    "linear-gradient(135deg, #B91C1C, #7C3AED)",
    "linear-gradient(135deg, #0369A1, #065F46)",
    "linear-gradient(135deg, #B45309, #DC2626)",
    "linear-gradient(135deg, #7C3AED, #EC4899)",
  ];
  const avatarGrad = avatarGradients[state.profile.username.charCodeAt(0) % avatarGradients.length];

  return (
    <div className="flex flex-col gap-5">

      {/* ═══════════════════════════════════════════════════════════
          HERO — Identity Card
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="card-base p-6 relative overflow-hidden">
        {/* Background gradient bleed */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ background: `radial-gradient(ellipse at top right, var(--accent), transparent 70%)` }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-[var(--border-radius)] border-2 border-[var(--border-color)] flex items-center justify-center text-2xl font-bold"
              style={{ background: avatarGrad, color: "#fff", fontFamily: "var(--font-noto-serif-jp), serif", boxShadow: "4px 4px 0 var(--border-color)" }}>
              {state.profile.username.slice(0, 2).toUpperCase()}
            </div>
            {/* XP ring indicator */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-alt))", boxShadow: "1px 1px 0 var(--border-color)" }}>
              {tier.icon}
            </div>
          </div>

          {/* Name + class + stats */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>@{state.profile.username}</h1>
              <span className="text-[0.65rem] font-mono-data px-2 py-0.5 border rounded-full uppercase tracking-wider"
                style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>
                {state.profile.animeClassJP} · {state.profile.animeClass}
              </span>
            </div>

            {/* Big stats row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              {[
                { n: totalEps.toLocaleString(), label: "Episodes" },
                { n: uniqueShows, label: "Shows" },
                { n: `${estHours.toLocaleString()}h`, label: "Watched" },
                { n: `${streakDays}d`, label: "Streak 🔥" },
              ].map(({ n, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-bold font-mono-data leading-none" style={{ color: "var(--text-primary)" }}>{n}</span>
                  <span className="text-[0.6rem] uppercase font-bold tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: rank + XP bar */}
          <div className="w-full sm:w-48 flex-shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{tier.label}</span>
              <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>{tier.jp}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden border border-[var(--border-color)]" style={{ backgroundColor: "var(--bg-primary)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-alt))" }}
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[0.6rem] font-mono-data" style={{ color: "var(--text-muted)" }}>{xp.toLocaleString()} XP</span>
              {xpToNext > 0 && <span className="text-[0.6rem] font-mono-data" style={{ color: "var(--text-muted)" }}>{xpToNext.toLocaleString()} to {next.label}</span>}
            </div>

            {/* 28-day heatmap mini */}
            <div className="grid gap-[3px] mt-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
              {heatmap.map(([date, count]) => (
                <div key={date} className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: count === 0 ? "var(--bg-primary)" : count <= 2 ? "var(--accent)55" : count <= 5 ? "var(--accent)99" : "var(--accent)",
                    border: "1px solid var(--border-color)",
                    opacity: count === 0 ? 0.5 : 1,
                  }}
                  title={`${date}: ${count} eps`}
                />
              ))}
            </div>
            <span className="text-[0.55rem] font-mono-data" style={{ color: "var(--text-muted)" }}>last 28 days</span>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          RECENT ACTIVITY + LOG CTA
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Activity feed — 3 cols */}
        <div className="lg:col-span-3 card-base p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs section-header">Recently Watched</h2>
            <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
              {logs.length} sessions logged
            </span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nothing logged yet</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Just finished something? Hit the button →
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentLogs.map((log, i) => {
                const eps = log.epEnd && log.epStart ? log.epEnd - log.epStart + 1 : 1;
                return (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-[var(--border-radius)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors"
                    style={{ backgroundColor: "var(--bg-primary)" }}>
                    {log.coverUrl ? (
                      <img src={log.coverUrl} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" style={{ border: "1px solid var(--border-color)" }} />
                    ) : (
                      <div className="w-10 h-14 rounded flex-shrink-0 border border-[var(--border-color)]" style={{ background: "var(--bg-card)" }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{log.title}</p>
                      <p className="text-xs font-mono-data mt-0.5" style={{ color: "var(--accent)" }}>
                        {log.epStart && log.epEnd ? (log.epStart === log.epEnd ? `Ep ${log.epStart}` : `Eps ${log.epStart}–${log.epEnd}`) : "Movie"}
                        <span style={{ color: "var(--text-muted)" }}> · {eps} ep{eps !== 1 ? "s" : ""}</span>
                      </p>
                      {log.notes && <p className="text-xs mt-0.5 truncate italic" style={{ color: "var(--text-muted)" }}>"{log.notes}"</p>}
                    </div>
                    <span className="text-xs font-mono-data flex-shrink-0" style={{ color: "var(--text-muted)" }}>{fmtDate(log.watchedOn)}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log CTA + streak — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* THE LOG BUTTON */}
          {!isDemo && onOpenLog && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <button onClick={onOpenLog}
                className="w-full p-5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer group transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "var(--accent)", boxShadow: "4px 4px 0px var(--border-color)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📝</span>
                  <span className="text-xs font-mono-data font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "var(--bg-card)" }}>
                    +10 XP / ep
                  </span>
                </div>
                <p className="text-lg font-bold text-left leading-snug" style={{ color: "var(--bg-card)" }}>
                  Just finished<br />something?
                </p>
                <p className="text-sm mt-1 text-left font-mono-data" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Log it. Keep the streak alive.
                </p>
                <div className="mt-4 flex items-center gap-2" style={{ color: "var(--bg-card)" }}>
                  <span className="text-sm font-bold">+ Log Episode</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            </motion.div>
          )}

          {/* Streak stats */}
          <div className="card-base p-4 flex flex-col gap-3 flex-1">
            <h2 className="text-xs section-header">Activity</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🔥", n: streakDays, label: "Day Streak" },
                { icon: "🏅", n: longestStreak, label: "Best Streak" },
                { icon: "📅", n: activeDates.size, label: "Active Days" },
                { icon: "⚡", n: `${xp.toLocaleString()}`, label: "Total XP" },
              ].map(({ icon, n, label }) => (
                <div key={label} className="p-3 rounded border border-[var(--border-color)] flex flex-col gap-1" style={{ backgroundColor: "var(--bg-primary)" }}>
                  <span className="text-base">{icon}</span>
                  <span className="text-xl font-bold font-mono-data leading-none" style={{ color: "var(--text-primary)" }}>{n}</span>
                  <span className="text-[0.6rem] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Streak fire bar */}
            {streakDays > 0 && (
              <div className="p-3 rounded border-2 relative overflow-hidden" style={{ borderColor: "var(--accent)", backgroundColor: "var(--bg-primary)" }}>
                <div className="absolute inset-0 opacity-5" style={{ background: "var(--accent)" }} />
                <div className="relative flex items-center gap-2">
                  <span className="text-xl">{streakDays >= 7 ? "🔥🔥" : "🔥"}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {streakDays} day{streakDays !== 1 ? "s" : ""} in a row!
                    </p>
                    <p className="text-[0.6rem] font-mono-data" style={{ color: "var(--text-muted)" }}>
                      {streakDays >= 7 ? "You're on fire. Don't stop." : "Keep watching to extend it"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          TOP SHOWS WALL + TASTE DNA
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Top shows poster wall — 3 cols */}
        <div className="lg:col-span-3 card-base p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs section-header">
              All-Time Favourites
              {state.topAnime.length > 0 && <span className="ml-2 font-mono-data" style={{ color: "var(--accent)" }}>({state.topAnime.length})</span>}
            </h2>
            {!isDemo && onUpdateTopAnime && (
              <button className="text-[0.65rem] px-2 py-0.5 border-2 border-[var(--border-color)] rounded uppercase tracking-wider font-bold hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)", boxShadow: "1px 1px 0px var(--border-color)" }}>
                Edit
              </button>
            )}
          </div>

          {state.topAnime.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <span className="text-4xl">🎌</span>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Add your favourite anime</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Your all-time top picks go here — great for sharing</p>
              {!isDemo && (
                <button className="text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] hover:opacity-80"
                  style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "2px 2px 0 var(--border-color)" }}>
                  + Add Shows
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {state.topAnime.map((anime, i) => (
                <motion.div key={anime.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="relative group rounded-[var(--border-radius)] overflow-hidden border-2 border-[var(--border-color)] cursor-default"
                  style={{ aspectRatio: "2/3", boxShadow: "3px 3px 0 var(--border-color)" }}>
                  {anime.coverUrl ? (
                    <img src={anime.coverUrl} alt={anime.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${anime.colorAccent}44, ${anime.colorAccent}11)` }}>
                      <span className="text-xs font-bold text-center p-1" style={{ color: anime.colorAccent }}>{anime.title.slice(0, 20)}</span>
                    </div>
                  )}
                  {/* Rank badge */}
                  <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono-data border border-[var(--border-color)]"
                    style={{ backgroundColor: "var(--bg-card)", color: anime.colorAccent, boxShadow: "1px 1px 0 var(--border-color)" }}>
                    {i + 1}
                  </div>
                  {/* Hover title */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                    <p className="text-xs font-bold text-white leading-tight">{anime.title}</p>
                    {anime.rating && <p className="text-xs text-yellow-400 mt-1">★ {anime.rating}/10</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Taste DNA — 2 cols */}
        <div className="lg:col-span-2 card-base p-5 flex flex-col gap-4">
          <h2 className="text-xs section-header">Taste DNA</h2>
          <div className="flex-1 flex items-center justify-center">
            <TasteRadar taste={state.taste} language={language} />
          </div>
          {/* Top 3 genres */}
          <div className="flex flex-col gap-1.5">
            {Object.entries(state.taste)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .slice(0, 3)
              .map(([genre, pct], i) => (
                <div key={genre} className="flex items-center gap-2">
                  <span className="text-[0.6rem] font-mono-data w-3 text-center" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                  <span className="text-xs capitalize flex-1" style={{ color: "var(--text-primary)" }}>
                    {genre === "sliceOfLife" ? "Slice of Life" : genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </span>
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: "var(--accent)" }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                  <span className="text-xs font-mono-data w-8 text-right" style={{ color: "var(--text-muted)" }}>{pct}%</span>
                </div>
              ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          ACHIEVEMENTS
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs section-header">Achievements</h2>
          <span className="text-xs font-mono-data" style={{ color: "var(--accent)" }}>
            {unlockedCount}/{state.achievements.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {state.achievements.map(a => <AchievementBadge key={a.id} achievement={a} language={language} />)}
        </div>
        {unlockedCount === 0 && !isDemo && (
          <p className="text-xs text-center mt-3 font-mono-data" style={{ color: "var(--text-muted)" }}>
            Log 10 episodes to unlock your first badge 👆
          </p>
        )}
      </motion.div>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { state, hydrated, updateTopAnime, updateTaste } = useKairoState();
  const { tweaks } = useTweaksContext();
  const { user, loading, signInWithGoogle } = useAuth();
  const { logs } = useWatchLogs();
  const [showDemo, setShowDemo] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  if (!hydrated || loading) {
    return (
      <TerminalShell>
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm font-mono-data" style={{ color: "var(--text-muted)" }}>
            システム起動中... Loading
          </motion.div>
        </div>
      </TerminalShell>
    );
  }

  if (showDemo) return <DemoPage onBack={() => setShowDemo(false)} />;

  if (!user) {
    return (
      <SignInScreen
        onDemo={() => setShowDemo(true)}
        onSignIn={async () => {
          try { await signInWithGoogle(); }
          catch { setAuthError("Sign in failed. Please try again."); }
        }}
        error={authError}
      />
    );
  }

  const username =
    user.user_metadata?.kairo_username ??
    user.user_metadata?.full_name?.split(" ")[0]?.toLowerCase() ??
    user.email?.split("@")[0] ??
    "viewer";

  const displayState: KairoState = {
    ...state,
    profile: {
      ...state.profile,
      username,
      animeClass: user.user_metadata?.kairo_class ?? state.profile.animeClass,
      animeClassJP: user.user_metadata?.kairo_class_jp ?? state.profile.animeClassJP,
    },
  };

  return (
    <>
      <div className="max-w-[1100px] mx-auto w-full px-4 pt-4 pb-16">
        <ProfileContent
          state={displayState}
          logs={logs}
          language={tweaks.language}
          onOpenLog={() => setLogOpen(true)}
          onUpdateTopAnime={updateTopAnime}
        />
      </div>
      <AnimatePresence>
        {logOpen && <LogWatchModal onClose={() => setLogOpen(false)} />}
      </AnimatePresence>
    </>
  );
}