"use client";
import { useState, useEffect } from "react";
import type { AniListAnime, LibraryEntry, LibraryStatus } from "@/types/anilist";
import { getDisplayTitle, getJPTitle } from "@/lib/anilist";

const LIBRARY_KEY = "kairo-library";

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY);
      if (stored) setLibrary(JSON.parse(stored) as LibraryEntry[]);
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (entries: LibraryEntry[]) => {
    setLibrary(entries);
    try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(entries)); } catch {}
  };

  const addToLibrary = (anime: AniListAnime, status: LibraryStatus = "plan") => {
    if (library.some((e) => e.animeId === anime.id)) return;
    const now = new Date().toISOString();
    const entry: LibraryEntry = {
      id: `lib-${Date.now()}`,
      animeId: anime.id,
      title: getDisplayTitle(anime),
      titleJP: getJPTitle(anime),
      coverUrl: anime.coverImage?.large ?? "",
      accentColor: anime.coverImage?.color ?? "#B91C1C",
      status,
      userRating: null,
      notes: "",
      epProgress: 0,
      totalEps: anime.episodes ?? null,
      genres: anime.genres ?? [],
      addedAt: now,
      updatedAt: now,
    };
    persist([...library, entry]);
  };

  const removeFromLibrary = (animeId: number) => {
    persist(library.filter((e) => e.animeId !== animeId));
  };

  const updateEntry = (animeId: number, updates: Partial<LibraryEntry>) => {
    persist(
      library.map((e) =>
        e.animeId === animeId
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e
      )
    );
  };

  const getEntry = (animeId: number): LibraryEntry | null =>
    library.find((e) => e.animeId === animeId) ?? null;

  const libraryIds = new Set(library.map((e) => e.animeId));
  const libraryMap = new Map(library.map((e) => [e.animeId, e]));

  const byStatus = (status: LibraryStatus) =>
    library.filter((e) => e.status === status);

  return {
    library,
    hydrated,
    libraryIds,
    libraryMap,
    addToLibrary,
    removeFromLibrary,
    updateEntry,
    getEntry,
    byStatus,
  };
}
