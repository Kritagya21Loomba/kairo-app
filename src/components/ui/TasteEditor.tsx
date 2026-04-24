"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TasteProfile } from "@/types";
import { getAnimeClass } from "@/lib/utils";

const GENRE_META: {
  key: keyof TasteProfile;
  label: string;
  labelJP: string;
  color: string;
}[] = [
  { key: "action",        label: "Action",        labelJP: "アクション",    color: "#F59E0B" },
  { key: "romance",       label: "Romance",       labelJP: "ロマンス",      color: "#EC4899" },
  { key: "sliceOfLife",   label: "Slice of Life", labelJP: "日常",          color: "#10B981" },
  { key: "psychological", label: "Psychological", labelJP: "心理",          color: "#6366F1" },
  { key: "comedy",        label: "Comedy",        labelJP: "コメディ",      color: "#F97316" },
  { key: "fantasy",       label: "Fantasy",       labelJP: "ファンタジー",  color: "#8B5CF6" },
  { key: "drama",         label: "Drama",         labelJP: "ドラマ",        color: "#0EA5E9" },
];

interface TasteEditorProps {
  taste: TasteProfile;
  onSave: (updated: TasteProfile) => void;
  onClose: () => void;
}

export function TasteEditor({ taste, onSave, onClose }: TasteEditorProps) {
  const [form, setForm] = useState<TasteProfile>({ ...taste });

  const derivedClass = getAnimeClass(form);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
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
        <motion.form
          key="modal"
          onSubmit={handleSave}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
          style={{
            backgroundColor: "var(--bg-card)",
            boxShadow: "6px 6px 0px var(--border-color)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--border-color)] sticky top-0 z-10"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <div>
              <div className="text-xs section-header">Genre Radar</div>
              <h2 className="text-base font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
                ジャンル設定 <span className="text-sm font-sans font-normal" style={{ color: "var(--text-muted)" }}>· Taste Scores</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center border-2 border-[var(--border-color)] rounded-full text-xs cursor-pointer hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Derived class preview */}
            <div
              className="flex items-center justify-between px-3 py-2 border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <span className="text-xs section-header">Derived Class</span>
              <div className="text-right">
                <div className="text-sm font-jp font-semibold" style={{ color: "var(--accent)" }}>
                  {derivedClass.jp}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {derivedClass.en}
                </div>
              </div>
            </div>

            {/* Genre sliders */}
            {GENRE_META.map(({ key, label, labelJP, color }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {label}
                    <span className="ml-2 text-xs font-jp" style={{ color: "var(--text-muted)" }}>{labelJP}</span>
                  </label>
                  <span
                    className="text-sm font-bold font-mono-data w-8 text-right"
                    style={{ color }}
                  >
                    {form[key]}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                    className="w-full cursor-pointer"
                    style={{ accentColor: color }}
                  />
                  {/* Progress fill bar */}
                  <div
                    className="absolute top-1/2 left-0 h-1 rounded-full pointer-events-none -translate-y-1/2"
                    style={{
                      width: `${form[key]}%`,
                      backgroundColor: color,
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
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
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-primary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
