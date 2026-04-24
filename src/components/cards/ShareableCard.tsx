"use client";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import type { KairoState } from "@/types";

interface ShareableCardProps {
  state: KairoState;
}

const TASTE_LABELS: Record<string, string> = {
  action: "Action", romance: "Romance", sliceOfLife: "Slice of Life",
  psychological: "Psychological", comedy: "Comedy", fantasy: "Fantasy", drama: "Drama",
};
const TASTE_LABELS_JP: Record<string, string> = {
  action: "アクション", romance: "ロマンス", sliceOfLife: "日常",
  psychological: "心理", comedy: "コメディ", fantasy: "ファンタジー", drama: "ドラマ",
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #B91C1C, #7C3AED)",
  "linear-gradient(135deg, #0369A1, #065F46)",
  "linear-gradient(135deg, #B45309, #DC2626)",
  "linear-gradient(135deg, #7C3AED, #EC4899)",
];
function getGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
}

export function ShareableCard({ state }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2.5,
        // Inline computed styles so html-to-image captures CSS vars
        filter: (node) => {
          // Skip SketchButton — only capture the card
          return true;
        },
      });
      const link = document.createElement("a");
      link.download = `kairo-${state.profile.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  const topTastes = Object.entries(state.taste)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const unlockedBadges = state.achievements.filter((a) => a.unlocked).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* ── Exportable card ── */}
      <div
        ref={cardRef}
        className="w-full border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          boxShadow: "var(--sketch-shadow)",
          fontFamily: "'Inter', system-ui, sans-serif",
          maxWidth: 480,
        }}
      >
        {/* Accent top bar */}
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-alt) 50%, var(--accent) 100%)",
          }}
        />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-[var(--border-radius)] border-2 border-[var(--border-color)] flex items-center justify-center text-base font-bold flex-shrink-0"
                style={{
                  background: getGradient(state.profile.username),
                  color: "#FFFFFF",
                  boxShadow: "3px 3px 0px var(--border-color)",
                }}
              >
                {state.profile.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}
                >
                  {state.profile.username}
                </div>
                <div style={{ color: "var(--accent)", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
                  {state.profile.animeClass}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textAlign: "right",
              lineHeight: 1.6,
            }}>
              KAIRO · カイロ<br />
              受験者ポータル
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-2"
            style={{ borderTop: "1.5px solid var(--border-color)", paddingTop: "16px", opacity: 0.9 }}
          >
            {[
              { label: "Shows", value: state.profile.totalShowsCompleted },
              { label: "Episodes", value: state.profile.totalEpisodesWatched.toLocaleString() },
              { label: "Years", value: state.profile.yearsWatching },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "var(--border-radius)",
                  padding: "8px 4px",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Top genres */}
          <div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "monospace" }}>
              Top Genres
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {topTastes.map(([key, score]) => (
                <span
                  key={key}
                  style={{
                    fontSize: "0.7rem",
                    padding: "3px 10px",
                    border: "1.5px solid var(--accent)",
                    borderRadius: "3px",
                    color: "var(--accent)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {TASTE_LABELS[key]} · {score}
                </span>
              ))}
            </div>
          </div>

          {/* Top picks */}
          <div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "monospace" }}>
              Top Picks
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {state.topAnime.slice(0, 3).map((anime, i) => (
                <div key={anime.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "var(--text-muted)", width: "14px" }}>
                    {i + 1}
                  </span>
                  <div style={{ width: "3px", height: "16px", borderRadius: "2px", backgroundColor: anime.colorAccent, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
                    {anime.title}
                  </span>
                  {anime.rating && (
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "monospace", marginLeft: "auto" }}>
                      ★ {anime.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked badges */}
          {unlockedBadges.length > 0 && (
            <div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "monospace" }}>
                Achievements
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {unlockedBadges.map((b) => (
                  <span key={b.id} style={{ fontSize: "1.2rem" }} title={b.title}>{b.icon}</span>
                ))}
                {state.achievements.filter((a) => a.unlocked).length > 4 && (
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", alignSelf: "center" }}>
                    +{state.achievements.filter((a) => a.unlocked).length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Vibe quote */}
          <div
            style={{
              fontSize: "0.72rem",
              fontStyle: "italic",
              color: "var(--text-muted)",
              borderLeft: "3px solid var(--accent)",
              paddingLeft: "10px",
              lineHeight: 1.6,
              borderTop: "1.5px solid var(--border-color)",
              paddingTop: "12px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            &ldquo;{state.emotional.vibeSummary.slice(0, 130)}&hellip;&rdquo;
          </div>
        </div>
      </div>

      {/* Export button */}
      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-[480px] py-3 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer transition-all"
        style={{
          backgroundColor: "var(--text-primary)",
          color: "var(--bg-card)",
          boxShadow: "4px 4px 0px var(--border-color)",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          letterSpacing: "0.08em",
        }}
      >
        ↓ Download Portfolio Card · ダウンロード
      </motion.button>
    </div>
  );
}
