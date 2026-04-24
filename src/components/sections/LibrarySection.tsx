"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLibrary } from "@/hooks/useLibrary";
import { useAuth } from "@/contexts/AuthContext";
import type { LibraryEntry, LibraryStatus } from "@/types/anilist";

const STATUS_CONFIG: Record<LibraryStatus, { label: string; labelJP: string; color: string; icon: string }> = {
  watching:  { label: "Watching",       labelJP: "視聴中",  color: "#16A34A", icon: "▶" },
  completed: { label: "Completed",      labelJP: "完了",    color: "#0369A1", icon: "✓" },
  plan:      { label: "Plan to Watch",  labelJP: "予定",    color: "#D97706", icon: "⏰" },
  hold:      { label: "On Hold",        labelJP: "保留",    color: "#7C3AED", icon: "⏸" },
  dropped:   { label: "Dropped",        labelJP: "断念",    color: "#DC2626", icon: "✕" },
};

const STATUS_ORDER: LibraryStatus[] = ["watching", "completed", "plan", "hold", "dropped"];
type FilterTab = "all" | LibraryStatus;

export function LibrarySection() {
  const { library, removeFromLibrary } = useLibrary();
  const { user, signInWithGoogle }     = useAuth();
  const [activeTab, setActiveTab]      = useState<FilterTab>("all");

  const byStatus = useMemo(() => {
    const map = new Map<LibraryStatus, LibraryEntry[]>();
    STATUS_ORDER.forEach(s => map.set(s, []));
    library.forEach(e => map.get(e.status)?.push(e));
    return map;
  }, [library]);

  const visibleEntries = useMemo(() =>
    activeTab === "all" ? library : (byStatus.get(activeTab as LibraryStatus) ?? []),
    [activeTab, library, byStatus]
  );

  const totalCount     = library.length;
  const watchingCount  = byStatus.get("watching")?.length  ?? 0;
  const completedCount = byStatus.get("completed")?.length ?? 0;

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5">
        <div className="text-5xl">📚</div>
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Your library is empty</div>
          <div className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
            Browse Discover and hit "+ Add" to start tracking
          </div>
        </div>
        <Link href="/"
          className="text-xs font-semibold px-4 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}>
          → Go to Discover
        </Link>
        {!user && (
          <div className="text-xs text-center px-4 py-3 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] max-w-xs"
            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
            <div className="mb-2">Sign in to sync your library across devices</div>
            <button onClick={signInWithGoogle}
              className="text-xs px-3 py-1.5 border-2 border-[var(--border-color)] rounded cursor-pointer"
              style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {[
          { label: "Total",     value: totalCount,     color: "var(--text-primary)" },
          { label: "Watching",  value: watchingCount,  color: "#16A34A" },
          { label: "Completed", value: completedCount, color: "#0369A1" },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-3 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
            style={{ backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}>
            <div className="text-xs section-header">{label}</div>
            <div className="text-xl font-bold font-mono-data" style={{ color }}>{value}</div>
          </div>
        ))}
        {!user && (
          <button onClick={signInWithGoogle}
            className="text-xs font-mono-data px-3 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80"
            style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
            📱 Sign in to sync →
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-0 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
        style={{ boxShadow: "2px 2px 0px var(--border-color)" }}>
        {([
          { id: "all" as FilterTab, label: "All", count: totalCount, color: "var(--text-primary)" },
          ...STATUS_ORDER.map(s => ({
            id: s as FilterTab,
            label: STATUS_CONFIG[s].icon + " " + STATUS_CONFIG[s].label,
            count: byStatus.get(s)?.length ?? 0,
            color: STATUS_CONFIG[s].color,
          }))
        ]).map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center py-2 px-1 cursor-pointer border-r-2 last:border-r-0 transition-all"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: isActive ? "var(--text-primary)" : "var(--bg-card)",
              }}>
              <span className="font-bold font-mono-data" style={{ color: isActive ? "var(--bg-card)" : tab.color, fontSize: "0.7rem" }}>
                {tab.count}
              </span>
              <span className="hidden sm:block" style={{ color: isActive ? "var(--bg-card)" : "var(--text-muted)", fontSize: "0.55rem" }}>
                {tab.label.split(" ").slice(-1)[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Entries */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-5">

          {visibleEntries.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No anime in this category yet.
            </div>
          ) : (
            /* Group by status when showing all, flat list otherwise */
            activeTab === "all"
              ? STATUS_ORDER.map(status => {
                  const entries = byStatus.get(status) ?? [];
                  if (!entries.length) return null;
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={status} className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        <span className="text-xs section-header">{cfg.label}</span>
                        <span className="font-jp text-xs" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>{cfg.labelJP}</span>
                        <span className="text-xs font-mono-data px-1.5 py-0.5 rounded border"
                          style={{ color: cfg.color, borderColor: cfg.color + "44", backgroundColor: cfg.color + "11", fontSize: "0.6rem" }}>
                          {entries.length}
                        </span>
                      </div>
                      <LibraryGrid entries={entries} onRemove={removeFromLibrary} />
                    </div>
                  );
                })
              : <LibraryGrid entries={visibleEntries} onRemove={removeFromLibrary} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LibraryGrid({ entries, onRemove }: { entries: LibraryEntry[]; onRemove: (id: number) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {entries.map((entry, i) => {
        const cfg = STATUS_CONFIG[entry.status];
        return (
          <motion.div key={entry.animeId}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="relative flex items-center gap-3 p-3 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] group"
            style={{
              backgroundColor: "var(--bg-card)",
              boxShadow: `2px 2px 0px var(--border-color), -3px 0 0 ${cfg.color}`,
            }}>
            {/* Cover */}
            <Link href={`/anime/${entry.animeId}`} className="flex-shrink-0">
              <div className="rounded overflow-hidden border-2 border-[var(--border-color)] relative"
                style={{ width: 48, height: 64, boxShadow: "2px 2px 0px var(--border-color)" }}>
                {entry.coverUrl
                  ? <Image src={entry.coverUrl} alt="" fill className="object-cover" unoptimized />
                  : <div className="w-full h-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: (entry.accentColor ?? "#B91C1C") + "22" }}>📺</div>
                }
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/anime/${entry.animeId}`}
                className="text-sm font-semibold truncate block hover:opacity-70"
                style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                {entry.title}
              </Link>
              {entry.titleJP && (
                <div className="font-jp truncate" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                  {entry.titleJP}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ color: cfg.color, backgroundColor: cfg.color + "18", fontSize: "0.6rem" }}>
                  {cfg.icon} {cfg.label}
                </span>
                {entry.genres?.slice(0, 2).map(g => (
                  <span key={g} className="px-1 border rounded"
                    style={{ color: "var(--text-muted)", borderColor: "var(--border-color)", fontSize: "0.55rem" }}>
                    {g}
                  </span>
                ))}
                {entry.userRating && (
                  <span className="font-mono-data font-bold" style={{ color: cfg.color, fontSize: "0.65rem" }}>
                    ★ {entry.userRating}
                  </span>
                )}
                {entry.totalEps && (
                  <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                    {entry.epProgress}/{entry.totalEps} ep
                  </span>
                )}
              </div>
            </div>

            {/* Remove (hover reveal) */}
            <button
              onClick={() => onRemove(entry.animeId)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer px-2 py-1 border border-[var(--border-color)] rounded hover:border-red-500 hover:text-red-500"
              style={{ color: "var(--text-muted)" }}
              title="Remove from library"
            >×</button>
          </motion.div>
        );
      })}
    </div>
  );
}
