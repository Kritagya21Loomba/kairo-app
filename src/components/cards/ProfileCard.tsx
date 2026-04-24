"use client";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types";

interface ProfileCardProps {
  profile: UserProfile;
  language?: "jp" | "en" | "both";
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #B91C1C, #7C3AED)",
  "linear-gradient(135deg, #0369A1, #065F46)",
  "linear-gradient(135deg, #B45309, #DC2626)",
  "linear-gradient(135deg, #7C3AED, #EC4899)",
];

function getGradient(name: string) {
  const i = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[i];
}

const CLASS_TIERS = [
  { min: 0,     label: "Curious Viewer" },
  { min: 50,    label: "Initiate" },
  { min: 150,   label: "Enthusiast" },
  { min: 500,   label: "Otaku" },
  { min: 1000,  label: "Connoisseur" },
  { min: 2500,  label: "Sage" },
  { min: 5000,  label: "Legend" },
  { min: 10000, label: "Myth" },
];

export function ProfileCard({ profile, language = "both" }: ProfileCardProps) {
  const initials = profile.username.slice(0, 2).toUpperCase();
  
  // Calculate next class tier progress
  let currentTier = CLASS_TIERS[0];
  let nextTier = CLASS_TIERS[1];
  for (let i = 0; i < CLASS_TIERS.length; i++) {
    if (profile.totalEpisodesWatched >= CLASS_TIERS[i].min) {
      currentTier = CLASS_TIERS[i];
      nextTier = CLASS_TIERS[i + 1] ?? CLASS_TIERS[i];
    }
  }

  const progress = nextTier === currentTier 
    ? 100 
    : Math.min(100, Math.max(0, ((profile.totalEpisodesWatched - currentTier.min) / (nextTier.min - currentTier.min)) * 100));

  const estHours = Math.round((profile.totalEpisodesWatched * 24) / 60);

  // Cosmetic evolution based on level
  const isHighLevel = currentTier.min >= 150;
  const isMaxLevel = currentTier.min >= 2500;

  const cardBorder = isMaxLevel 
    ? "border-4 border-[var(--accent)] shadow-[0_0_15px_var(--accent)]" 
    : isHighLevel 
    ? "border-2 border-[var(--text-primary)]" 
    : "border border-[var(--border-color)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card-base p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden ${cardBorder}`}
    >
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${getGradient(profile.username).split(", ")[1]})`
        }} />

      {/* Avatar & Level Ring */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {/* Level Ring SVG */}
        <svg className="absolute -inset-2 w-[6rem] h-[6rem] -rotate-90 z-0">
          <circle 
            cx="3rem" cy="3rem" r="2.7rem" 
            fill="none" stroke="var(--border-color)" strokeWidth="4" 
            opacity="0.3"
          />
          <circle 
            cx="3rem" cy="3rem" r="2.7rem" 
            fill="none" stroke="var(--accent)" strokeWidth="4" 
            strokeDasharray={`${(progress / 100) * (2 * Math.PI * 2.7)}rem 100rem`}
            strokeLinecap="round"
          />
        </svg>
        <div
          className="w-20 h-20 rounded-[var(--border-radius)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-2xl font-bold relative z-10"
          style={{
            background: getGradient(profile.username),
            color: "#FFFFFF",
            fontFamily: "var(--font-noto-serif-jp), serif",
          }}
        >
          {initials}
        </div>
        {/* Level Badge */}
        <div
          className="absolute -bottom-2 w-10 h-6 flex items-center justify-center rounded-full text-xs font-mono-data font-bold z-20 shadow-md"
          style={{
            backgroundColor: "var(--text-primary)",
            color: "var(--bg-primary)",
            border: "2px solid var(--bg-card)",
          }}
        >
          Lv.{currentTier.min > 0 ? Math.floor(profile.totalEpisodesWatched / 10) : 1}
        </div>
      </div>

      {/* Info & Stats */}
      <div className="flex-1 w-full min-w-0 ml-2">
        <div className="flex flex-col mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {profile.username}
            </h1>
            <span
              className="text-[0.65rem] font-mono-data px-2 py-0.5 border rounded-full uppercase"
              style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
            >
              {profile.animeClassJP} · {profile.animeClass}
            </span>
          </div>
        </div>

        {/* Stats row - Compact */}
        <div className="flex gap-6 mt-1">
          {[
            { label: "Episodes", value: profile.totalEpisodesWatched.toLocaleString(), suffix: "" },
            { label: "Completed", value: profile.totalShowsCompleted, suffix: "" },
            { label: "Pace", value: profile.avgEpisodesPerDay, suffix: " ep/d" },
            { label: "Wasted", value: estHours.toLocaleString(), suffix: "h" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-start">
              <span className="text-[0.65rem] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
              <span className="text-xl font-bold font-mono-data leading-none mt-1" style={{ color: "var(--text-primary)" }}>
                {stat.value}
                <span className="text-xs ml-0.5 font-normal opacity-60">
                  {stat.suffix}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
