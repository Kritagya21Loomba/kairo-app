"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { EmotionGraph } from "@/components/charts/EmotionGraph";
import { TRIGGER_TAGS } from "@/lib/constants";
import type { KairoState } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface EmotionalAnalysisProps {
  state: KairoState;
  language: "jp" | "en" | "both";
  onToggleTrigger: (tag: string) => void;
  onUpdateVibe?: (summary: string) => void;
}

export function EmotionalAnalysis({
  state,
  language,
  onToggleTrigger,
  onUpdateVibe,
}: EmotionalAnalysisProps) {
  const [editingVibe, setEditingVibe] = useState(false);
  const [vibeText, setVibeText] = useState(state.emotional.vibeSummary);

  const handleVibeSave = () => {
    if (onUpdateVibe && vibeText.trim()) {
      onUpdateVibe(vibeText.trim());
    }
    setEditingVibe(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Section header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <span className="section-label-badge">B · テンション分析</span>
        <h2 className="text-lg font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
          {language === "en" ? "Emotional Analysis" : language === "jp" ? "テンション分析" : "テンション分析 · Emotional Analysis"}
        </h2>
      </motion.div>

      <motion.div variants={item} className="terminal-divider">✦ emotional resonance</motion.div>

      {/* Resonance chart */}
      <motion.div variants={item} className="card-base p-5">
        <div className="text-xs section-header mb-3">
          {language === "en" ? "Emotional Resonance" : language === "jp" ? "感情共鳴グラフ" : "感情共鳴グラフ · Emotional Resonance"}
        </div>
        <EmotionGraph emotional={state.emotional} language={language} />
      </motion.div>

      {/* Trigger tags */}
      <motion.div variants={item} className="card-base p-5">
        <div className="text-xs section-header mb-3">
          {language === "en" ? "Emotional Triggers" : language === "jp" ? "感情トリガー" : "感情トリガー · Emotional Triggers"}
        </div>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggleTrigger(tag)}
              className={`tag-pill${state.emotional.triggerTags.includes(tag) ? " selected" : ""}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs font-mono-data" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
          {state.emotional.triggerTags.length} / {TRIGGER_TAGS.length} {language === "jp" ? "選択済み" : "triggers selected"}
        </div>
      </motion.div>

      <motion.div variants={item} className="terminal-divider">✦ vibe report</motion.div>

      {/* Vibe summary */}
      <motion.div variants={item} className="card-base p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs section-header">
            {language === "en" ? "Vibe Profile" : language === "jp" ? "バイブレポート" : "バイブレポート · Vibe Profile"}
          </div>
          {onUpdateVibe && (
            <button
              onClick={() => { setVibeText(state.emotional.vibeSummary); setEditingVibe(true); }}
              className="text-xs px-2.5 py-1 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 transition-opacity font-mono-data"
              style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)", boxShadow: "2px 2px 0px var(--border-color)" }}
            >
              ✎ Edit
            </button>
          )}
        </div>

        {editingVibe ? (
          <div className="space-y-3">
            <textarea
              value={vibeText}
              onChange={(e) => setVibeText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm border-2 rounded-[var(--border-radius)] outline-none resize-none italic"
              style={{
                borderColor: "var(--accent)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-inter), sans-serif",
                lineHeight: 1.7,
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleVibeSave}
                className="px-4 py-1.5 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-card)",
                  boxShadow: "2px 2px 0px var(--border-color)",
                }}
              >
                保存 · Save
              </button>
              <button
                onClick={() => setEditingVibe(false)}
                className="px-4 py-1.5 text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)" }}
              >
                Cancel
              </button>
              <span className="text-xs self-center ml-auto font-mono-data" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                {vibeText.length} chars
              </span>
            </div>
          </div>
        ) : (
          <>
            <blockquote
              className="text-sm leading-relaxed italic border-l-4 pl-4"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--accent)",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {state.emotional.vibeSummary}
            </blockquote>
            <div className="mt-4 flex items-center gap-2">
              <div
                className="text-xs px-2 py-0.5 border rounded-full font-mono-data"
                style={{ color: "var(--text-muted)", borderColor: "var(--border-color)", fontSize: "0.6rem", opacity: 0.7 }}
              >
                {language === "jp" ? "システム生成" : "System generated"} · kairo.sys
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
