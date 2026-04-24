"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthButton } from "@/components/auth/AuthButton";

function NavLink({ href, label, labelJP }: { href: string; label: string; labelJP: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-sm font-mono-data px-3 py-1.5 border-2 rounded-[var(--border-radius)] transition-all hover:opacity-80"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: isActive ? "var(--text-primary)" : "transparent",
        color: isActive ? "var(--bg-card)" : "var(--text-muted)",
        boxShadow: isActive ? "2px 2px 0px var(--border-color)" : "none",
        fontSize: "0.7rem",
        letterSpacing: "0.06em",
      }}
    >
      {label}
      <span className="font-jp hidden sm:inline ml-1" style={{ opacity: 0.6, fontSize: "0.65rem" }}>{labelJP}</span>
    </Link>
  );
}

import { LogWatchModal } from "@/components/ui/LogWatchModal";
import { useState } from "react";

export function AppNav() {
  const [logModalOpen, setLogModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b-2 border-[var(--border-color)]" style={{ backgroundColor: "var(--bg-card)" }}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-alt) 50%, var(--accent) 100%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-[#D4A017]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-[#1EA733]" />
            </div>
            <Link href="/" className="border-l-2 border-[var(--border-color)] pl-4 flex items-baseline gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xl font-bold tracking-tight font-jp" style={{ color: "var(--text-primary)" }}>カイロ</span>
              <span className="text-base font-semibold" style={{ color: "var(--text-primary)", opacity: 0.7 }}>· Kairo</span>
              <span className="text-xs font-mono-data ml-1 px-1.5 py-0.5 border rounded" style={{ color: "var(--text-muted)", borderColor: "var(--border-color)", fontSize: "0.6rem" }}>v3.0</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink href="/" label="Discover" labelJP="発見" />
            <NavLink href="/profile" label="My Profile" labelJP="プロフィール" />
            <div className="w-px h-4 mx-1" style={{ backgroundColor: "var(--border-color)" }} />
            <button
              onClick={() => setLogModalOpen(true)}
              className="flex items-center gap-1.5 text-sm font-mono-data px-3 py-1.5 border-2 rounded-[var(--border-radius)] cursor-pointer hover:opacity-80"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--accent)",
                color: "var(--bg-primary)",
                boxShadow: "2px 2px 0px var(--border-color)",
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
              }}
            >
              + Log
            </button>
            <AuthButton />
            <motion.div
              className="w-2 h-2 rounded-full ml-1"
              style={{ backgroundColor: "var(--accent)" }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </nav>
        </div>
      </header>
      <AnimatePresence>
        {logModalOpen && <LogWatchModal onClose={() => setLogModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
