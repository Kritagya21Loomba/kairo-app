"use client";

// TerminalShell — content wrapper for /profile (AppNav in layout handles global header)
export function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative z-10" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">{children}</main>

      <footer className="border-t-2 border-[var(--border-color)] mt-12" style={{ backgroundColor: "var(--bg-card)" }}>
        <div
          className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="font-jp">カイロ — 視聴者評価システム</span>
          <div className="flex items-center gap-3">
            <span className="font-mono-data">kairo.sys · build 2.0.0</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E", opacity: 0.8 }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
