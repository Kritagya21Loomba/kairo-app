"use client";
import { useLocalStorage } from "./useLocalStorage";
import { DEFAULT_TWEAKS, THEME_PRESETS } from "@/lib/constants";
import type { TweaksConfig, ThemePreset } from "@/types";
import { useEffect } from "react";

export function useTweaks() {
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
    root.style.setProperty(
      "--density-padding",
      tweaks.density === "compact" ? "12px" : "24px"
    );
    root.style.setProperty(
      "--sketch-shadow",
      tweaks.borderStyle === "sketchy" ? "3px 3px 0px var(--text-primary)" : "0 4px 16px rgba(0,0,0,0.08)"
    );
  }, [tweaks]);

  const setTheme = (theme: ThemePreset) => setTweaks((t) => ({ ...t, theme }));
  const setBrightness = (brightness: number) => setTweaks((t) => ({ ...t, brightness }));
  const setBorderStyle = (borderStyle: TweaksConfig["borderStyle"]) =>
    setTweaks((t) => ({ ...t, borderStyle }));
  const setLanguage = (language: TweaksConfig["language"]) =>
    setTweaks((t) => ({ ...t, language }));
  const setDensity = (density: TweaksConfig["density"]) =>
    setTweaks((t) => ({ ...t, density }));

  return { tweaks, setTheme, setBrightness, setBorderStyle, setLanguage, setDensity };
}
