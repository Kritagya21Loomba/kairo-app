"use client";
import { cn } from "@/lib/utils";

interface SketchTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SketchTag({ label, selected, onClick, className }: SketchTagProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 transition-all duration-150 cursor-pointer select-none",
        "border rounded-[var(--border-radius)]",
        selected
          ? "bg-[var(--text-primary)] text-[var(--bg-card)] border-[var(--text-primary)]"
          : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]",
        className
      )}
      style={{ boxShadow: selected ? "2px 2px 0px var(--border-color)" : "1px 1px 0px var(--border-color)" }}
    >
      {selected && <span>✓</span>}
      {label}
    </button>
  );
}
