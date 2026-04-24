"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function AuthButton() {
  const { user, loading, signInWithGoogle, signInWithDiscord, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  if (loading) {
    return (
      <div className="w-20 h-7 rounded animate-pulse" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }} />
    );
  }

  if (user) {
    const initials = (user.user_metadata?.full_name ?? user.email ?? "?")
      .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const avatar = user.user_metadata?.avatar_url;

    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-6 h-6 rounded-full border border-[var(--border-color)]" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-alt))", color: "var(--bg-card)" }}>
              {initials}
            </div>
          )}
          <span className="text-xs font-mono-data hidden sm:block" style={{ color: "var(--text-primary)" }}>
            {user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "User"}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>▾</span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
                style={{ backgroundColor: "var(--bg-card)", boxShadow: "4px 4px 0px var(--border-color)", minWidth: "160px" }}
              >
                <div className="px-3 py-2 border-b border-[var(--border-color)]">
                  <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {user.user_metadata?.full_name ?? "Viewer"}
                  </div>
                  <div className="text-xs font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-mono-data hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: "var(--accent)" }}
                >
                  Sign Out ↩
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="text-xs px-3 py-1.5 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 font-mono-data"
        style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "2px 2px 0px var(--border-color)" }}
      >
        Sign In
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", boxShadow: "4px 4px 0px var(--border-color)", minWidth: "200px" }}
            >
              <div className="px-3 py-2 border-b border-[var(--border-color)]">
                <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>ログイン · Sign In</div>
                <div className="text-xs" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>Save your library & ratings</div>
              </div>
              <button
                onClick={async () => { setSigningIn(true); await signInWithGoogle(); }}
                disabled={signingIn}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer flex items-center gap-2 border-b border-[var(--border-color)]"
                style={{ color: "var(--text-primary)" }}
              >
                <span>🌐</span> Continue with Google
              </button>
              <button
                onClick={async () => { setSigningIn(true); await signInWithDiscord(); }}
                disabled={signingIn}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer flex items-center gap-2"
                style={{ color: "#5865F2" }}
              >
                <span>💬</span> Continue with Discord
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
