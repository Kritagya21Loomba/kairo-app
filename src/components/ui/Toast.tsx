"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: number;
  message: string;
  icon: string;
}

let toastId = 0;

// Global toast state — singleton pattern (avoids prop-drilling)
type Listener = (t: Toast[]) => void;
let toasts: Toast[] = [];
const listeners = new Set<Listener>();
function notify() { listeners.forEach((l) => l([...toasts])); }

export function showToast(message: string, icon = "✓") {
  const id = ++toastId;
  toasts = [...toasts, { id, message, icon }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 2800);
}

export function ToastContainer() {
  const [list, setList] = useState<Toast[]>([]);

  // Subscribe to global state
  useState(() => {
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  });

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="flex items-center gap-2.5 px-4 py-2.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
            style={{
              backgroundColor: "var(--bg-card)",
              boxShadow: "4px 4px 0px var(--border-color)",
              fontFamily: "var(--font-inter), sans-serif",
              minWidth: "220px",
            }}
          >
            <span className="text-base">{t.icon}</span>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {t.message}
            </span>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--accent)", opacity: 0.7 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
