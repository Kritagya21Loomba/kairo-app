"use client";
import { useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { DEMO_STATE, EMPTY_STATE } from "@/data/demoState";
import { loadStateFromSupabase, saveStateToSupabase } from "@/lib/supabaseSync";
import type { KairoState } from "@/types";

const DEBOUNCE_MS = 1500;

export function useKairoState() {
  const [state, setState, hydrated] = useLocalStorage<KairoState>("kairo-state", EMPTY_STATE);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitialLoad = useRef(false);

  // On first hydration, try to pull fresher data from Supabase
  useEffect(() => {
    if (!hydrated || didInitialLoad.current) return;
    didInitialLoad.current = true;

    async function syncFromCloud() {
      const remote = await loadStateFromSupabase(state.profile.username);
      if (remote) {
        // Only use remote if it has a newer updated_at; for now just use it
        setState(remote);
      }
    }
    syncFromCloud();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Debounced save to Supabase on every state change
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveStateToSupabase(state.profile.username, state);
    }, DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const updateProfile = (profile: Partial<KairoState["profile"]>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...profile } }));

  const updateTaste = (taste: Partial<KairoState["taste"]>) =>
    setState((s) => ({ ...s, taste: { ...s.taste, ...taste } }));

  const updateEmotional = (emotional: Partial<KairoState["emotional"]>) =>
    setState((s) => ({ ...s, emotional: { ...s.emotional, ...emotional } }));

  const updateTopAnime = (topAnime: KairoState["topAnime"]) =>
    setState((s) => ({ ...s, topAnime }));

  const updateTimeline = (timeline: KairoState["timeline"]) =>
    setState((s) => ({ ...s, timeline }));

  const updateCountdowns = (countdowns: KairoState["countdowns"]) =>
    setState((s) => ({ ...s, countdowns }));

  const updateAchievements = (achievements: KairoState["achievements"]) =>
    setState((s) => ({ ...s, achievements }));

  const updateArcRatings = (arcRatings: KairoState["arcRatings"]) =>
    setState((s) => ({ ...s, arcRatings }));

  const resetToDemo = () => setState(DEMO_STATE);

  return {
    state,
    hydrated,
    updateProfile,
    updateTaste,
    updateEmotional,
    updateTopAnime,
    updateTimeline,
    updateCountdowns,
    updateAchievements,
    updateArcRatings,
    resetToDemo,
  };
}
