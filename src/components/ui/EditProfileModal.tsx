"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types";
import { ANIME_CLASSES } from "@/lib/constants";

interface EditProfileModalProps {
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

export function EditProfileModal({ profile, onSave, onClose }: EditProfileModalProps) {
  const [form, setForm] = useState({
    username: profile.username,
    animeClass: profile.animeClass,
    animeClassJP: profile.animeClassJP,
    yearsWatching: profile.yearsWatching,
    totalShowsCompleted: profile.totalShowsCompleted,
    totalEpisodesWatched: profile.totalEpisodesWatched,
    avgEpisodesPerDay: profile.avgEpisodesPerDay,
    longestBingeStreak: profile.longestBingeStreak,
  });

  const handleClassChange = (en: string) => {
    const found = ANIME_CLASSES.find((c) => c.en === en);
    setForm((f) => ({
      ...f,
      animeClass: en,
      animeClassJP: found?.jp ?? f.animeClassJP,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username: form.username.trim() || profile.username,
      animeClass: form.animeClass,
      animeClassJP: form.animeClassJP,
      yearsWatching: Number(form.yearsWatching),
      totalShowsCompleted: Number(form.totalShowsCompleted),
      totalEpisodesWatched: Number(form.totalEpisodesWatched),
      avgEpisodesPerDay: Number(form.avgEpisodesPerDay),
      longestBingeStreak: Number(form.longestBingeStreak),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
          style={{
            backgroundColor: "var(--bg-card)",
            boxShadow: "6px 6px 0px var(--border-color)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--border-color)]"
          >
            <div>
              <div className="text-xs section-header">System</div>
              <h2 className="text-base font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
                プロフィール編集 <span className="text-sm font-sans font-normal" style={{ color: "var(--text-muted)" }}>· Edit Profile</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center border-2 border-[var(--border-color)] rounded-full text-xs cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Username */}
            <div>
              <label className="text-xs section-header block mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="motoki"
                className="w-full px-3 py-2 text-sm border-2 rounded-[var(--border-radius)] outline-none transition-all"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              />
            </div>

            {/* Anime Class */}
            <div>
              <label className="text-xs section-header block mb-1.5">Anime Class</label>
              <select
                value={form.animeClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 rounded-[var(--border-radius)] outline-none cursor-pointer"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {ANIME_CLASSES.map((c) => (
                  <option key={c.en} value={c.en}>
                    {c.en} — {c.jp}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "yearsWatching", label: "Years Watching", unit: "yr" },
                { key: "totalShowsCompleted", label: "Shows Completed", unit: "" },
                { key: "totalEpisodesWatched", label: "Episodes Watched", unit: "" },
                { key: "avgEpisodesPerDay", label: "Avg / Day", unit: "ep" },
                { key: "longestBingeStreak", label: "Longest Binge", unit: "days" },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="text-xs section-header block mb-1">{label}</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={key === "avgEpisodesPerDay" ? 0.1 : 1}
                      min={0}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="flex-1 w-full px-3 py-2 text-sm border-2 rounded-[var(--border-radius)] outline-none font-mono-data"
                      style={{
                        borderColor: "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    {unit && (
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                        {unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-card)",
                  boxShadow: "3px 3px 0px var(--border-color)",
                }}
              >
                保存 · Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
