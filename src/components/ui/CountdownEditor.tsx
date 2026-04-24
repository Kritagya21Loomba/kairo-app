"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CountdownTarget } from "@/types";

interface CountdownEditorProps {
  countdowns: CountdownTarget[];
  onSave: (updated: CountdownTarget[]) => void;
  onClose: () => void;
}

function CountdownRow({
  cd,
  index,
  onChange,
  onRemove,
}: {
  cd: CountdownTarget;
  index: number;
  onChange: (updated: CountdownTarget) => void;
  onRemove: () => void;
}) {
  // Format ISO datetime for input[type=datetime-local]
  const localValue = cd.targetDate.slice(0, 16);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ delay: index * 0.04 }}
      className="border-2 border-[var(--border-color)] rounded-[var(--border-radius)] p-3 space-y-2"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono-data font-bold" style={{ color: "var(--accent)" }}>
          Countdown #{index + 1}
        </span>
        <button
          onClick={onRemove}
          className="text-xs cursor-pointer hover:opacity-60 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        value={cd.label}
        placeholder="Label (EN)"
        onChange={(e) => onChange({ ...cd, label: e.target.value })}
        className="w-full px-2.5 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-semibold"
        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
      />
      <input
        type="text"
        value={cd.labelJP}
        placeholder="ラベル (JP)"
        onChange={(e) => onChange({ ...cd, labelJP: e.target.value })}
        className="w-full px-2.5 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-jp"
        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}
      />
      <div>
        <label className="text-xs section-header block mb-1">Target Date &amp; Time</label>
        <input
          type="datetime-local"
          value={localValue}
          onChange={(e) => onChange({ ...cd, targetDate: e.target.value + ":00" })}
          className="w-full px-2.5 py-1.5 text-sm border-2 rounded-[var(--border-radius)] outline-none font-mono-data"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
        />
      </div>
    </motion.div>
  );
}

export function CountdownEditor({ countdowns, onSave, onClose }: CountdownEditorProps) {
  const [list, setList] = useState<CountdownTarget[]>(countdowns);

  const handleAdd = () => {
    if (list.length >= 6) return;
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setList((prev) => [
      ...prev,
      {
        id: `cd-${Date.now()}`,
        label: "",
        labelJP: "",
        targetDate: nextYear.toISOString().slice(0, 16) + ":00",
      },
    ]);
  };

  const handleSave = () => {
    onSave(list.filter((cd) => cd.label.trim().length > 0));
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
          className="w-full max-w-md border-2 border-[var(--border-color)] rounded-[var(--border-radius)]"
          style={{
            backgroundColor: "var(--bg-card)",
            boxShadow: "6px 6px 0px var(--border-color)",
            maxHeight: "88vh",
            overflowY: "auto",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--border-color)] sticky top-0 z-10"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <div>
              <div className="text-xs section-header">Section C</div>
              <h2 className="text-base font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
                カウントダウン編集 <span className="text-sm font-sans font-normal" style={{ color: "var(--text-muted)" }}>· Countdowns</span>
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
              {list.map((cd, i) => (
                <CountdownRow
                  key={cd.id}
                  cd={cd}
                  index={i}
                  onChange={(updated) => setList((prev) => prev.map((c, idx) => idx === i ? updated : c))}
                  onRemove={() => setList((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </AnimatePresence>

            {list.length < 6 && (
              <button
                onClick={handleAdd}
                className="w-full py-2.5 text-sm border-2 border-dashed border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                + Add Countdown
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
