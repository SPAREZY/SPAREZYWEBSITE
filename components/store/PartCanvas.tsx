"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { matchPart, SHOWCASE_ICONS } from "@/lib/part-icons";

// fixed scatter for the gently drifting parts background
const DRIFT = [
  { left: "10%", top: "14%", size: 30, dur: 7, delay: 0 },
  { left: "33%", top: "8%", size: 26, dur: 9, delay: 1.2 },
  { left: "58%", top: "12%", size: 34, dur: 8, delay: 0.5 },
  { left: "82%", top: "18%", size: 28, dur: 10, delay: 2 },
  { left: "16%", top: "40%", size: 32, dur: 8.5, delay: 1.8 },
  { left: "45%", top: "36%", size: 26, dur: 9.5, delay: 0.3 },
  { left: "70%", top: "42%", size: 30, dur: 7.5, delay: 1 },
  { left: "88%", top: "50%", size: 24, dur: 11, delay: 2.4 },
  { left: "8%", top: "66%", size: 28, dur: 9, delay: 0.8 },
  { left: "31%", top: "72%", size: 32, dur: 8, delay: 1.5 },
  { left: "55%", top: "68%", size: 26, dur: 10, delay: 0.2 },
  { left: "77%", top: "74%", size: 30, dur: 8.5, delay: 1.9 },
  { left: "22%", top: "90%", size: 26, dur: 9, delay: 1.1 },
  { left: "65%", top: "90%", size: 28, dur: 9.5, delay: 2.2 },
];

export default function PartCanvas({ names }: { names: string[] }) {
  // settle a beat after the customer stops typing
  const signature = names.join("|");
  const [settled, setSettled] = useState<string[]>(names);
  useEffect(() => {
    const t = setTimeout(() => setSettled(names), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const tiles = settled
    .map((n, i) => ({ raw: n.trim(), i }))
    .filter((t) => t.raw.length >= 2)
    .map((t) => ({ ...t, ...matchPart(t.raw) }));
  const n = tiles.length;

  // featured icon size shrinks as more parts are added (collage fills the panel)
  const size = n <= 1 ? 168 : n <= 2 ? 132 : n <= 4 ? 108 : n <= 6 ? 90 : n <= 9 ? 74 : 60;

  return (
    <div className="parts-panel">
      <div className={`pp-drift ${n > 0 ? "dim" : ""}`} aria-hidden="true">
        {DRIFT.map((d, i) => {
          const Icon = SHOWCASE_ICONS[i % SHOWCASE_ICONS.length].Icon;
          return (
            <span
              key={i}
              className="pp-drift-icon"
              style={{
                left: d.left,
                top: d.top,
                width: d.size,
                height: d.size,
                ["--dur" as string]: `${d.dur}s`,
                ["--delay" as string]: `${d.delay}s`,
              }}
            >
              <Icon />
            </span>
          );
        })}
      </div>

      {n === 0 ? (
        <motion.div className="pp-hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pp-hint-title">ANY PART · ANY CAR</div>
          <div className="pp-hint-sub">Type a part — see it here.</div>
        </motion.div>
      ) : (
        <div className="pp-collage">
          <AnimatePresence mode="popLayout">
            {tiles.map((t) => (
              <motion.div
                key={`${t.i}-${t.key}`}
                layout
                initial={{ scale: 0, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.16 } }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="pp-cell"
              >
                <span className="pp-cell-icon" style={{ width: size, height: size }}>
                  {t.icon}
                </span>
                <span className="pp-cell-label">{t.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
