"use client";
import { motion } from "framer-motion";
import type { Achievement } from "@/types";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievement: Achievement;
  language?: "jp" | "en" | "both";
}

const CATEGORY_COLORS: Record<Achievement["category"], { bg: string; border: string; text: string }> = {
  emotional:  { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B" },
  binge:      { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
  variety:    { bg: "#EFF6FF", border: "#93C5FD", text: "#1E3A5F" },
  dedication: { bg: "#F0FDF4", border: "#86EFAC", text: "#14532D" },
};

export function AchievementBadge({ achievement, language = "both" }: AchievementBadgeProps) {
  const cat = CATEGORY_COLORS[achievement.category];

  return (
    <motion.div
      whileHover={achievement.unlocked ? { scale: 1.04, y: -2 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "card-base p-3 flex flex-col items-center text-center gap-2 cursor-default relative overflow-hidden",
        !achievement.unlocked && "badge-locked"
      )}
    >
      {/* Category tint bg stripe */}
      {achievement.unlocked && (
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: cat.border, opacity: 0.8 }}
        />
      )}

      <div className="text-3xl mt-1">{achievement.icon}</div>

      <div>
        <div className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
          {language === "jp" ? achievement.titleJP : achievement.title}
        </div>
        {language === "both" && (
          <div className="text-xs font-jp mt-0.5" style={{ color: "var(--text-muted)" }}>
            {achievement.titleJP}
          </div>
        )}
      </div>

      <div className="text-xs leading-tight" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
        {achievement.description}
      </div>

      {achievement.unlocked ? (
        <div
          className="text-xs font-mono-data px-2 py-0.5 border rounded-full"
          style={{
            color: cat.text,
            borderColor: cat.border,
            backgroundColor: cat.bg,
            fontSize: "0.6rem",
          }}
        >
          {language === "jp" ? "解除済み" : "Unlocked"} ✓
        </div>
      ) : (
        <div
          className="text-xs font-mono-data px-2 py-0.5 border rounded-full"
          style={{ color: "var(--text-muted)", borderColor: "var(--border-color)", fontSize: "0.6rem" }}
        >
          {language === "jp" ? "未解除" : "Locked"} 🔒
        </div>
      )}
    </motion.div>
  );
}
