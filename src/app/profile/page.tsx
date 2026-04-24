"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TerminalShell } from "@/components/layout/TerminalShell";
import { SectionTabs, type SectionId } from "@/components/layout/SectionTabs";
import { ViewerProfile } from "@/components/sections/ViewerProfile";
import { WatchHabits } from "@/components/sections/WatchHabits";
import { WatchTimeline } from "@/components/sections/WatchTimeline";
import { ViewingResults } from "@/components/sections/ViewingResults";
import { LibrarySection } from "@/components/sections/LibrarySection";
import { useKairoState } from "@/hooks/useKairoState";
import { useTweaksContext } from "@/contexts/TweaksContext";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_STATE } from "@/data/demoState";

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("Overview");
  const {
    state,
    hydrated,
    updateProfile,
    updateEmotional,
    updateTopAnime,
    updateTaste,
    updateCountdowns,
  } = useKairoState();
  const { tweaks } = useTweaksContext();
  const { user, loading, signInWithGoogle } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const displayState = isDemoMode ? DEMO_STATE : state;

  const handleToggleTrigger = (tag: string) => {
    const current = displayState.emotional.triggerTags;
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateEmotional({ triggerTags: updated });
  };

  const handleUpdateVibe = (summary: string) => {
    updateEmotional({ vibeSummary: summary });
  };

  if (!hydrated || loading) {
    return (
      <TerminalShell>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm font-mono-data"
            style={{ color: "var(--text-muted)" }}
          >
            システム起動中... Loading
          </motion.div>
        </div>
      </TerminalShell>
    );
  }

  const lang = tweaks.language;

  if (!user && !isDemoMode) {
    return (
      <div className="max-w-[1400px] mx-auto w-full pt-4 h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-3xl font-bold font-jp mb-4" style={{ color: "var(--text-primary)" }}>Your Anime Journey</h2>
        <p className="text-sm text-center max-w-md leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Sign in to track your shows, unlock achievements, and see your viewing habits mapped out beautifully.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <button 
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (err) {
                setAuthError("Sign in failed. Ensure Supabase is configured or use Demo Mode.");
              }
            }} 
            className="w-full sm:w-auto card-base px-6 py-2.5 font-bold cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", border: "2px solid var(--text-primary)", boxShadow: "2px 2px 0px var(--border-color)" }}
          >
            Sign In with Google
          </button>
          <button 
            onClick={() => setIsDemoMode(true)} 
            className="w-full sm:w-auto card-base px-6 py-2.5 font-bold font-mono-data cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-muted)", border: "2px solid var(--border-color)" }}
          >
            View Demo Profile
          </button>
        </div>
        {authError && <p className="text-red-500 text-sm mt-4 font-bold">{authError}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto w-full pt-4">
        {isDemoMode && (
          <div className="w-full mb-4 p-2 text-center text-xs font-mono-data font-bold tracking-wider" style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)" }}>
            VIEWING DEMO DATA — SIGN IN TO CREATE YOUR OWN
            <button onClick={() => setIsDemoMode(false)} className="ml-4 underline cursor-pointer hover:opacity-70">EXIT DEMO</button>
          </div>
        )}

        <SectionTabs active={activeSection} onChange={setActiveSection} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeSection === "Overview" && (
              <div className="flex flex-col gap-4 pb-10">
                {/* Top Half: Hero Header, Affinity Wheel, Taste Insights, Trophy Case, Top Anime */}
                <ViewerProfile state={displayState} language={lang}
                  onUpdateTopAnime={updateTopAnime}
                  onUpdateTaste={updateTaste} />
                
                {/* Bottom Half: Streaks & Timeline Footer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1 h-full">
                    {/* Streaks & Quests module */}
                    <WatchHabits state={displayState} language={lang} />
                  </div>
                  <div className="lg:col-span-2">
                    {/* Watch Journey Timeline */}
                    <WatchTimeline state={displayState} language={lang} onUpdateCountdowns={updateCountdowns} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <ViewingResults state={displayState} language={lang} />
                </div>
              </div>
            )}
            {activeSection === "Library" && <LibrarySection />}
          </motion.div>
        </AnimatePresence>

      </div>

    </>
  );
}
