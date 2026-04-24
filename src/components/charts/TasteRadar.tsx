"use client";
import { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TasteProfile } from "@/types";

const LABELS: Record<keyof TasteProfile, { en: string; jp: string }> = {
  action:        { en: "Action",        jp: "アクション" },
  romance:       { en: "Romance",       jp: "ロマンス" },
  sliceOfLife:   { en: "Slice of Life", jp: "日常" },
  psychological: { en: "Psychological", jp: "心理" },
  comedy:        { en: "Comedy",        jp: "コメディ" },
  fantasy:       { en: "Fantasy",       jp: "ファンタジー" },
  drama:         { en: "Drama",         jp: "ドラマ" },
};

interface TasteRadarProps {
  taste: TasteProfile;
  language?: "jp" | "en" | "both";
}

export function TasteRadar({ taste, language = "both" }: TasteRadarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = Object.entries(LABELS).map(([key, labels]) => ({
    subject: language === "jp" ? labels.jp : labels.en,
    value: taste[key as keyof TasteProfile],
    fullMark: 100,
  }));

  if (!mounted) {
    return (
      <div
        className="w-full animate-pulse rounded-[var(--border-radius)]"
        style={{ height: 280, backgroundColor: "var(--bg-primary)" }}
      />
    );
  }

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border-color)" strokeOpacity={0.25} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "var(--text-muted)",
              fontSize: 11,
              fontFamily: "var(--font-noto-serif-jp), sans-serif",
            }}
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
            formatter={(value) => [`${Number(value)}/100`, "Score"]}
          />
          <Radar
            name="Taste"
            dataKey="value"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.18}
            strokeWidth={2.5}
            dot={{ fill: "var(--accent)", r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
