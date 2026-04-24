"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TopAnime } from "@/types";

const ACCENT_OPTIONS = [
  "#B91C1C", "#7C3AED", "#0369A1", "#065F46",
  "#B45309", "#1D4ED8", "#DB2777", "#0EA5E9",
  "#16A34A", "#EA580C", "#6D28D9", "#DC2626",
];

interface TopAnimeEditorProps {
  topAnime: TopAnime[];
  onSave: (updated: TopAnime[]) => void;
  onClose: () => void;
}

function AnimeRow({
  anime,
  index,
  onChange,
  onRemove,
}: {
  anime: TopAnime;
  index: number;
  onChange: (updated: TopAnime) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.04 }}
      className="border-2 border-[var(--border-color)] rounded-[var(--border-radius)] p-3 space-y-2"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono-data font-bold" style={{ color: "var(--accent)" }}>
          #{index + 1}
        </span>
        <button
          onClick={onRemove}
          className="text-xs cursor-pointer hover:opacity-60 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          ✕ Remove
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={anime.title}
        placeholder="Anime title (EN)"
        onChange={(e) => onChange({ ...anime, title: e.target.value })}
        className="w-full px-2.5 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-semibold"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-card)",
          color: "var(--text-primary)",
        }}
      />

      {/* JP Title */}
      <input
        type="text"
        value={anime.titleJP ?? ""}
        placeholder="タイトル (JP, optional)"
        onChange={(e) => onChange({ ...anime, titleJP: e.target.value })}
        className="w-full px-2.5 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-jp"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--bg-card)",
          color: "var(--text-muted)",
        }}
      />

      <div className="grid grid-cols-3 gap-2">
        {/* Year */}
        <div>
          <label className="text-xs section-header block mb-1">Year</label>
          <input
            type="number"
            value={anime.year ?? ""}
            placeholder="2024"
            min={1960}
            max={2030}
            onChange={(e) => onChange({ ...anime, year: Number(e.target.value) || undefined })}
            className="w-full px-2 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-mono-data"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Rating */}
        <div>
          <label className="text-xs section-header block mb-1">Rating /10</label>
          <input
            type="number"
            value={anime.rating ?? ""}
            placeholder="10"
            min={1}
            max={10}
            step={0.5}
            onChange={(e) => onChange({ ...anime, rating: Number(e.target.value) || undefined })}
            className="w-full px-2 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-mono-data"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Episodes */}
        <div>
          <label className="text-xs section-header block mb-1">Episodes</label>
          <input
            type="number"
            value={anime.episodes ?? ""}
            placeholder="24"
            min={1}
            onChange={(e) => onChange({ ...anime, episodes: Number(e.target.value) || undefined })}
            className="w-full px-2 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-mono-data"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="text-xs section-header block mb-1.5">Accent Color</label>
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_OPTIONS.map((hex) => (
            <button
              key={hex}
              onClick={() => onChange({ ...anime, colorAccent: hex })}
              className="w-6 h-6 rounded-sm border-2 cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: hex,
                borderColor: anime.colorAccent === hex ? "var(--text-primary)" : "transparent",
                boxShadow: anime.colorAccent === hex ? "2px 2px 0px var(--border-color)" : "none",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TopAnimeEditor({ topAnime, onSave, onClose }: TopAnimeEditorProps) {
  const [list, setList] = useState<TopAnime[]>(topAnime);

  const handleChange = (index: number, updated: TopAnime) => {
    setList((prev) => prev.map((a, i) => (i === index ? updated : a)));
  };

  const handleRemove = (index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (list.length >= 10) return;
    setList((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        title: "",
        titleJP: "",
        year: new Date().getFullYear(),
        colorAccent: ACCENT_OPTIONS[prev.length % ACCENT_OPTIONS.length],
        rating: 9,
        episodes: 12,
      },
    ]);
  };

  const handleSave = () => {
    // Filter out entries with no title
    onSave(list.filter((a) => a.title.trim().length > 0));
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
          style={{
            backgroundColor: "var(--bg-card)",
            boxShadow: "6px 6px 0px var(--border-color)",
            maxHeight: "88vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--border-color)] sticky top-0 z-10"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <div>
              <div className="text-xs section-header">Section A</div>
              <h2 className="text-base font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
                トップアニメ編集 <span className="text-sm font-sans font-normal" style={{ color: "var(--text-muted)" }}>· Top Anime</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center border-2 border-[var(--border-color)] rounded-full text-xs cursor-pointer hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-3">
            <AnimatePresence>
              {list.map((anime, i) => (
                <AnimeRow
                  key={anime.id}
                  anime={anime}
                  index={i}
                  onChange={(updated) => handleChange(i, updated)}
                  onRemove={() => handleRemove(i)}
                />
              ))}
            </AnimatePresence>

            {list.length < 10 && (
              <button
                onClick={handleAdd}
                className="w-full py-2.5 text-sm border-2 border-dashed border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)", backgroundColor: "transparent" }}
              >
                + Add Anime
              </button>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 text-sm font-semibold border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer"
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-card)",
                  boxShadow: "3px 3px 0px var(--border-color)",
                }}
              >
                保存 · Save
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
