"use client";
import { motion } from "framer-motion";

const GENRES = [
  { label: "Action",        jp: "アクション" },
  { label: "Romance",       jp: "ロマンス" },
  { label: "Fantasy",       jp: "ファンタジー" },
  { label: "Psychological", jp: "心理" },
  { label: "Comedy",        jp: "コメディ" },
  { label: "Drama",         jp: "ドラマ" },
  { label: "Slice of Life", jp: "日常" },
  { label: "Supernatural",  jp: "超自然" },
  { label: "Sci-Fi",        jp: "SF" },
  { label: "Horror",        jp: "ホラー" },
  { label: "Sports",        jp: "スポーツ" },
  { label: "Music",         jp: "音楽" },
  { label: "Mystery",       jp: "ミステリー" },
  { label: "Adventure",     jp: "冒険" },
];

interface GenreFilterProps {
  selected: string;
  onChange: (genre: string) => void;
}

export function GenreFilter({ selected, onChange }: GenreFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs section-header">ジャンル</span>
        <span className="text-base font-jp font-semibold" style={{ color: "var(--text-primary)" }}>
          Browse by Genre
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange("")}
          className="tag-pill"
          style={
            selected === ""
              ? {
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-card)",
                  borderColor: "var(--text-primary)",
                  boxShadow: "2px 2px 0px var(--accent)",
                }
              : {}
          }
        >
          All · 全部
        </motion.button>
        {GENRES.map(({ label, jp }) => (
          <motion.button
            key={label}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(label === selected ? "" : label)}
            className="tag-pill"
            style={
              selected === label
                ? {
                    backgroundColor: "var(--text-primary)",
                    color: "var(--bg-card)",
                    borderColor: "var(--text-primary)",
                    boxShadow: "2px 2px 0px var(--accent)",
                  }
                : {}
            }
          >
            {label}
            <span
              className="ml-1 font-jp"
              style={{ fontSize: "0.6rem", opacity: 0.6 }}
            >
              {jp}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
