"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { matchPart } from "@/lib/part-icons";

export default function PartCanvas({ names }: { names: string[] }) {
  // settle the icons a beat after the customer stops typing
  const signature = names.join("|");
  const [settled, setSettled] = useState<string[]>(names);
  useEffect(() => {
    const t = setTimeout(() => setSettled(names), 320);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const tiles = settled
    .map((n, i) => ({ raw: n.trim(), i }))
    .filter((t) => t.raw.length >= 2)
    .map((t) => ({ ...t, ...matchPart(t.raw) }));

  return (
    <div className="part-canvas">
      {tiles.length === 0 ? (
        <motion.div
          className="pc-empty"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="pc-empty-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
          </span>
          <p className="pc-empty-text">
            Start typing your parts —
            <br />
            we&apos;ll show what we&apos;re hunting.
          </p>
        </motion.div>
      ) : (
        <div className="pc-grid">
          <AnimatePresence mode="popLayout">
            {tiles.map((t) => (
              <motion.div
                key={`${t.i}-${t.key}`}
                layout
                initial={{ scale: 0, rotate: -14, opacity: 0, y: 10 }}
                animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.14 } }}
                transition={{ type: "spring", stiffness: 460, damping: 20 }}
                className="pc-tile"
              >
                <div className="pc-box">
                  <span className="pc-glow" />
                  {t.icon}
                </div>
                <div className="pc-label">{t.label}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
