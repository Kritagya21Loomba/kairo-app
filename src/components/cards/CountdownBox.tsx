"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatCountdown, padZero } from "@/lib/utils";
import type { CountdownTarget } from "@/types";

interface CountdownBoxProps {
  countdown: CountdownTarget;
  language?: "jp" | "en" | "both";
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-[var(--border-color)] rounded-[var(--border-radius)] font-mono-data text-2xl sm:text-3xl font-bold"
        style={{
          backgroundColor: "var(--bg-primary)",
          boxShadow: "3px 3px 0px var(--border-color)",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </div>
      <span className="text-xs mt-1.5 section-header">{label}</span>
    </div>
  );
}

export function CountdownBox({ countdown, language = "both" }: CountdownBoxProps) {
  const [time, setTime] = useState(formatCountdown(countdown.targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatCountdown(countdown.targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown.targetDate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-base p-4"
    >
      <div className="mb-3">
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {language === "jp" ? countdown.labelJP : countdown.label}
        </div>
        {language === "both" && (
          <div className="text-xs font-jp mt-0.5" style={{ color: "var(--text-muted)" }}>
            {countdown.labelJP}
          </div>
        )}
      </div>

      {time.expired ? (
        <div className="text-sm font-mono-data" style={{ color: "var(--text-muted)" }}>
          Event has passed
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <TimeUnit value={padZero(time.days)} label={language === "jp" ? "日" : "DAYS"} />
          <span className="text-2xl font-bold pb-5" style={{ color: "var(--text-muted)" }}>:</span>
          <TimeUnit value={padZero(time.hours)} label={language === "jp" ? "時" : "HRS"} />
          <span className="text-2xl font-bold pb-5" style={{ color: "var(--text-muted)" }}>:</span>
          <TimeUnit value={padZero(time.minutes)} label={language === "jp" ? "分" : "MIN"} />
          <span className="text-2xl font-bold pb-5" style={{ color: "var(--text-muted)" }}>:</span>
          <TimeUnit value={padZero(time.seconds)} label={language === "jp" ? "秒" : "SEC"} />
        </div>
      )}
    </motion.div>
  );
}
