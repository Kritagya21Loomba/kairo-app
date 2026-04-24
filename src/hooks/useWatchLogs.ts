"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface WatchLogEntry {
  id: string;
  animeId: number;
  title: string;
  coverUrl?: string;
  format?: string;
  epStart?: number;
  epEnd?: number;
  watchedOn: string;
  durationMin?: number;
  notes?: string;
}

export function useWatchLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WatchLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase or localStorage
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (user) {
        // Fetch from Supabase
        try {
          const res = await fetch("/api/logs");
          if (res.ok) {
            const data = await res.json();
            setLogs(data);
          }
        } catch (e) {
          console.error("Failed to load logs from Supabase", e);
        }
      } else {
        // Load from localStorage
        try {
          const stored = localStorage.getItem("kairo-watch-logs");
          if (stored) {
            setLogs(JSON.parse(stored));
          }
        } catch { /* ignore */ }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const addLog = async (entry: Omit<WatchLogEntry, "id">) => {
    const newEntry: WatchLogEntry = { ...entry, id: `log-${Date.now()}` };
    const newLogs = [newEntry, ...logs];
    setLogs(newLogs);

    if (user) {
      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      } catch (e) {
        console.error("Failed to sync log to Supabase", e);
      }
    } else {
      localStorage.setItem("kairo-watch-logs", JSON.stringify(newLogs));
    }
  };

  const removeLog = async (id: string) => {
    const newLogs = logs.filter((l) => l.id !== id);
    setLogs(newLogs);

    if (user) {
      try {
        await fetch(`/api/logs?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Failed to delete log from Supabase", e);
      }
    } else {
      localStorage.setItem("kairo-watch-logs", JSON.stringify(newLogs));
    }
  };

  return { logs, loading, addLog, removeLog };
}
