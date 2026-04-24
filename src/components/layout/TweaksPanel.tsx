"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTweaksContext } from "@/contexts/TweaksContext";
import { THEME_PRESETS } from "@/lib/constants";
import type { ThemePreset } from "@/types";

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const { tweaks, setTheme, setBrightness, setBorderStyle, setLanguage, setDensity } =
    useTweaksContext();

  const themes = Object.entries(THEME_PRESETS) as [
    ThemePreset,
    (typeof THEME_PRESETS)[ThemePreset]
  ][];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ rotate: open ? 45 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-base cursor-pointer"
        style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--sketch-shadow)" }}
        aria-label="Toggle Tweaks Panel"
      >
        ✦
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
            className="absolute bottom-14 right-0 w-64 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] p-4 flex flex-col gap-4"
            style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--sketch-shadow)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Tweaks ✦
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-xs cursor-pointer hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {/* Theme */}
            <div>
              <label className="text-xs section-header block mb-2">Theme</label>
              <div className="flex gap-2 flex-wrap">
                {themes.map(([key, preset]) => (
                  <motion.button
                    key={key}
                    onClick={() => setTheme(key)}
                    title={`${preset.emoji} ${preset.label}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-7 h-7 rounded-full border-2 cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: preset.bg,
                      borderColor:
                        tweaks.theme === key ? preset.text : "#00000040",
                      boxShadow:
                        tweaks.theme === key ? `2px 2px 0px ${preset.text}` : "none",
                    }}
                  >
                    <span className="sr-only">{preset.label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="mt-1 text-xs font-jp" style={{ color: "var(--text-muted)" }}>
                {THEME_PRESETS[tweaks.theme].emoji} {THEME_PRESETS[tweaks.theme].label} / {THEME_PRESETS[tweaks.theme].labelJP}
              </div>
            </div>

            {/* Brightness */}
            <div>
              <label className="text-xs section-header block mb-2">
                Brightness — {Math.round(tweaks.brightness * 100)}%
              </label>
              <input
                type="range"
                min={0.7}
                max={1.3}
                step={0.05}
                value={tweaks.brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full h-1 rounded-full cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
            </div>

            {/* Border style */}
            <div>
              <label className="text-xs section-header block mb-2">Border</label>
              <div className="flex gap-2">
                {(["sketchy", "clean"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setBorderStyle(style)}
                    className="flex-1 text-xs py-1 px-2 border-2 rounded-[var(--border-radius)] cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        tweaks.borderStyle === style
                          ? "var(--text-primary)"
                          : "var(--bg-primary)",
                      color:
                        tweaks.borderStyle === style
                          ? "var(--bg-card)"
                          : "var(--text-muted)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs section-header block mb-2">Language</label>
              <div className="flex gap-2">
                {(["jp", "en", "both"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className="flex-1 text-xs py-1 px-2 border-2 rounded-[var(--border-radius)] cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        tweaks.language === lang ? "var(--text-primary)" : "var(--bg-primary)",
                      color:
                        tweaks.language === lang ? "var(--bg-card)" : "var(--text-muted)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="text-xs section-header block mb-2">Density</label>
              <div className="flex gap-2">
                {(["compact", "spacious"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className="flex-1 text-xs py-1 px-2 border-2 rounded-[var(--border-radius)] cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        tweaks.density === d ? "var(--text-primary)" : "var(--bg-primary)",
                      color: tweaks.density === d ? "var(--bg-card)" : "var(--text-muted)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
