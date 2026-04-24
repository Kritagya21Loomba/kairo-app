"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

interface SketchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function SketchButton({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: SketchButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[var(--text-primary)] text-[var(--bg-card)] border-2 border-[var(--text-primary)] hover:bg-[var(--accent)] hover:border-[var(--accent)]",
    secondary:
      "bg-[var(--bg-card)] text-[var(--text-primary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-primary)]",
    ghost:
      "bg-transparent text-[var(--text-primary)] border-2 border-transparent hover:border-[var(--border-color)]",
    danger:
      "bg-[var(--bg-card)] text-[var(--accent)] border-2 border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-card)]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-[var(--border-radius)]",
    md: "text-sm px-4 py-2 rounded-[var(--border-radius)]",
    lg: "text-base px-6 py-3 rounded-[var(--border-radius)]",
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 1, scale: 0.98 }}
      style={{ boxShadow: "var(--sketch-shadow)" }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
