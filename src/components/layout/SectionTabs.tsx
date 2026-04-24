"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SectionId = "Overview" | "Library";

interface Tab {
  id: SectionId;
  label: string;
  labelJP: string;
  sublabel: string;
}

const TABS: Tab[] = [
  { id: "Overview", label: "Overview", labelJP: "概要", sublabel: "Wrapped" },
  { id: "Library",  label: "Library",  labelJP: "マイライブラリ", sublabel: "Collection" },
];

interface SectionTabsProps {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export function SectionTabs({ active, onChange }: SectionTabsProps) {
  return (
    <div
      className="flex gap-0 mb-4 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
      style={{ boxShadow: "var(--sketch-shadow)" }}
      role="tablist"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center py-3 px-1 cursor-pointer transition-all duration-200",
              "border-r-2 last:border-r-0",
              isActive ? "z-10" : "hover:opacity-80"
            )}
            style={{
              borderColor:     "var(--border-color)",
              backgroundColor: isActive ? "var(--text-primary)" : "var(--bg-card)",
            }}
          >
            <span className="text-xs font-bold font-mono-data leading-none mb-0.5"
              style={{ color: isActive ? "var(--bg-card)" : "var(--text-muted)", opacity: isActive ? 1 : 0.5 }}>
              {tab.id.toUpperCase()}
            </span>
            <span className="text-xs font-jp leading-tight hidden sm:block"
              style={{ color: isActive ? "var(--bg-card)" : "var(--text-primary)", fontSize: "0.65rem" }}>
              {tab.labelJP}
            </span>
            <span className="text-xs leading-tight font-mono-data hidden md:block"
              style={{ color: isActive ? "var(--bg-card)" : "var(--text-muted)", opacity: 0.7, fontSize: "0.55rem" }}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-dot"
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
