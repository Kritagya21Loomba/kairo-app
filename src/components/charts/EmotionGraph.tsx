"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { EmotionalProfile } from "@/types";

const EMOTION_META: Record<
  keyof Omit<EmotionalProfile, "triggerTags" | "vibeSummary">,
  { label: string; labelJP: string; color: string }
> = {
  hype:          { label: "Hype",         labelJP: "ハイプ",  color: "#F59E0B" },
  melancholy:    { label: "Melancholy",   labelJP: "憂鬱",    color: "#6366F1" },
  nostalgia:     { label: "Nostalgia",    labelJP: "郷愁",    color: "#EC4899" },
  foundFamily:   { label: "Found Family", labelJP: "絆",      color: "#10B981" },
  betrayal:      { label: "Betrayal",     labelJP: "裏切り",  color: "#EF4444" },
  sacrifice:     { label: "Sacrifice",    labelJP: "犠牲",    color: "#8B5CF6" },
  philosophical: { label: "Philosophical",labelJP: "哲学的",  color: "#0EA5E9" },
};

interface EmotionGraphProps {
  emotional: EmotionalProfile;
  language?: "jp" | "en" | "both";
}

export function EmotionGraph({ emotional, language = "both" }: EmotionGraphProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = Object.entries(EMOTION_META).map(([key, meta]) => ({
    name: language === "jp" ? meta.labelJP : meta.label,
    value: emotional[key as keyof typeof EMOTION_META],
    color: meta.color,
  }));

  if (!mounted) {
    return (
      <div
        className="w-full animate-pulse rounded-[var(--border-radius)]"
        style={{ height: 260, backgroundColor: "var(--bg-primary)" }}
      />
    );
  }

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{
              fill: "var(--text-muted)",
              fontSize: 10,
              fontFamily: "var(--font-jetbrains-mono)",
            }}
            axisLine={{ stroke: "var(--border-color)", strokeOpacity: 0.3 }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{
              fill: "var(--text-muted)",
              fontSize: 11,
              fontFamily: "var(--font-noto-serif-jp), sans-serif",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-card)",
              border: "2px solid var(--border-color)",
              borderRadius: "var(--border-radius)",
              boxShadow: "var(--sketch-shadow)",
              color: "var(--text-primary)",
              fontSize: 12,
            }}
            formatter={(value) => [`${Number(value)}/100`]}
            cursor={{ fill: "var(--bg-primary)", opacity: 0.5 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
