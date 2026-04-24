"use client";
import { cn } from "@/lib/utils";
import type { TimelineEntryStatus } from "@/types";

const STATUS_MAP: Record<TimelineEntryStatus, { label: string; labelJP: string; css: string }> = {
  completed: { label: "Completed", labelJP: "完了", css: "status-completed" },
  "in-progress": { label: "In Progress", labelJP: "進行中", css: "status-in-progress" },
  upcoming: { label: "Upcoming", labelJP: "予定", css: "status-upcoming" },
};

interface StatusPillProps {
  status: TimelineEntryStatus;
  language?: "jp" | "en" | "both";
  className?: string;
}

export function StatusPill({ status, language = "both", className }: StatusPillProps) {
  const info = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border",
        info.css,
        className
      )}
    >
      {language === "jp"
        ? info.labelJP
        : language === "en"
        ? info.label
        : `${info.labelJP} · ${info.label}`}
    </span>
  );
}
