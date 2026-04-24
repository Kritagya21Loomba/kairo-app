import type { TasteProfile } from "@/types";
import { ANIME_CLASSES } from "./constants";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getAnimeClass(taste: TasteProfile): { en: string; jp: string } {
  // Find the best matching class
  for (const cls of ANIME_CLASSES.slice(0, -1)) {
    const matches = Object.entries(cls.threshold).every(
      ([key, min]) => taste[key as keyof TasteProfile] >= min
    );
    if (matches) return { en: cls.en, jp: cls.jp };
  }
  return { en: ANIME_CLASSES[ANIME_CLASSES.length - 1].en, jp: ANIME_CLASSES[ANIME_CLASSES.length - 1].jp };
}

export function formatCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; expired: boolean } {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

export function formatDate(dateStr: string, language: "jp" | "en" | "both"): string {
  const date = new Date(dateStr);
  if (language === "jp") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function padZero(num: number): string {
  return String(num).padStart(2, "0");
}

export function generateVibeSummary(emotional: {
  hype: number;
  melancholy: number;
  nostalgia: number;
  foundFamily: number;
  betrayal: number;
  sacrifice: number;
  philosophical: number;
}): string {
  const sorted = Object.entries(emotional)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  const top = sorted[0];
  const second = sorted[1];

  const summaries: Record<string, string> = {
    hype: "You live for the rush — the moment before the final strike, the crowd roaring, the music hitting its peak. You are an adrenaline-chaser at heart.",
    melancholy: "You find beauty in sadness. The quiet fade to black after a loss hits you harder than any battle. You understand that grief is a form of love.",
    nostalgia: "You are forever chasing your first anime. Something about those early days — the wonder, the discovery — never quite left you.",
    foundFamily: "The found family trope wrecks you every time. You believe that chosen bonds are just as real, and often stronger, than blood.",
    betrayal: "You are drawn to the knife in the back. The moment trust shatters is the moment you lean in closest.",
    sacrifice: "You are moved by those who give everything for others. The weight of selflessness resonates deeply within you.",
    philosophical: "You watch to think. The questions anime poses — about identity, existence, and meaning — follow you long after the credits roll.",
  };

  const bridges: Record<string, string> = {
    hype: "tempered by moments of raw emotion",
    melancholy: "softened by warmth and connection",
    nostalgia: "coloured by themes of sacrifice and love",
    foundFamily: "sparked by sudden bursts of intensity",
    betrayal: "shadowed by a deep melancholic undertone",
    sacrifice: "elevated by philosophical questioning",
    philosophical: "grounded in deeply human emotional moments",
  };

  return `${summaries[top]} This is ${bridges[second] || "balanced by other rich emotional experiences"}.`;
}
