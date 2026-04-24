"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_TWEAKS, THEME_PRESETS } from "@/lib/constants";
import type { TweaksConfig, ThemePreset } from "@/types";
import { useEffect } from "react";

interface TweaksContextValue {
  tweaks: TweaksConfig;
  setTheme: (theme: ThemePreset) => void;
  setBrightness: (brightness: number) => void;
  setBorderStyle: (borderStyle: TweaksConfig["borderStyle"]) => void;
  setLanguage: (language: TweaksConfig["language"]) => void;
  setDensity: (density: TweaksConfig["density"]) => void;
}

const TweaksContext = createContext<TweaksContextValue | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useLocalStorage<TweaksConfig>("kairo-tweaks", DEFAULT_TWEAKS);

  useEffect(() => {
    const preset = THEME_PRESETS[tweaks.theme];
    const root = document.documentElement;
    root.style.setProperty("--bg-primary", preset.bg);
    root.style.setProperty("--bg-card", preset.card);
    root.style.setProperty("--text-primary", preset.text);
    root.style.setProperty("--accent", preset.accent);
    root.style.setProperty("--accent-alt", preset.accentAlt);
    root.style.setProperty("--brightness", String(tweaks.brightness));
    root.style.setProperty("--border-radius", tweaks.borderStyle === "sketchy" ? "6px" : "12px");
    root.style.setProperty("--density-padding", tweaks.density === "compact" ? "12px" : "24px");
    root.style.setProperty(
      "--sketch-shadow",
      tweaks.borderStyle === "sketchy"
        ? "3px 3px 0px var(--text-primary)"
        : "0 4px 16px rgba(0,0,0,0.10)"
    );
    // Sync border-color too
    root.style.setProperty("--border-color", preset.text);
  }, [tweaks]);

  const value: TweaksContextValue = {
    tweaks,
    setTheme: (theme) => setTweaks((t) => ({ ...t, theme })),
    setBrightness: (brightness) => setTweaks((t) => ({ ...t, brightness })),
    setBorderStyle: (borderStyle) => setTweaks((t) => ({ ...t, borderStyle })),
    setLanguage: (language) => setTweaks((t) => ({ ...t, language })),
    setDensity: (density) => setTweaks((t) => ({ ...t, density })),
  };

  return <TweaksContext.Provider value={value}>{children}</TweaksContext.Provider>;
}

export function useTweaksContext(): TweaksContextValue {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error("useTweaksContext must be used inside TweaksProvider");
  return ctx;
}
