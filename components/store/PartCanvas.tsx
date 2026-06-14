"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { matchPart } from "@/lib/part-icons";

function BoxBack() {
  return (
    <svg className="box-svg" viewBox="0 0 260 200" fill="none">
      <defs>
        <linearGradient id="cbInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E512E" />
          <stop offset="1" stopColor="#3C2B16" />
        </linearGradient>
        <linearGradient id="cbFlapB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1DBAE" />
          <stop offset="1" stopColor="#D9B074" />
        </linearGradient>
      </defs>
      {/* interior */}
      <path d="M48 92 H182 L198 64 H64 Z" fill="url(#cbInner)" />
      {/* back flap up */}
      <path d="M64 64 H198 L208 36 H54 Z" fill="url(#cbFlapB)" stroke="#b78a4f" strokeWidth="2.5" strokeLinejoin="round" />
      {/* left flap splayed */}
      <path d="M48 92 L64 64 L36 52 L18 80 Z" fill="url(#cbFlapB)" stroke="#b78a4f" strokeWidth="2.5" strokeLinejoin="round" />
      {/* right flap splayed */}
      <path d="M182 92 L198 64 L226 56 L214 86 Z" fill="url(#cbFlapB)" stroke="#b78a4f" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function BoxFront() {
  return (
    <svg className="box-svg" viewBox="0 0 260 200" fill="none">
      <defs>
        <linearGradient id="cbFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAC893" />
          <stop offset="1" stopColor="#C2904F" />
        </linearGradient>
        <linearGradient id="cbSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C2904F" />
          <stop offset="1" stopColor="#9A6A36" />
        </linearGradient>
        <linearGradient id="cbFlap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1DBAE" />
          <stop offset="1" stopColor="#DDB57C" />
        </linearGradient>
        <linearGradient id="cbTape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6ECD3" />
          <stop offset="1" stopColor="#E4D2A6" />
        </linearGradient>
      </defs>
      {/* right side face (depth) */}
      <path d="M182 92 L210 74 L204 156 L176 174 Z" fill="url(#cbSide)" stroke="#8f6231" strokeWidth="2.5" strokeLinejoin="round" />
      {/* front face */}
      <path d="M48 92 H182 L176 174 H54 Z" fill="url(#cbFront)" stroke="#9A6A36" strokeWidth="2.5" strokeLinejoin="round" />
      {/* front flap folded toward viewer */}
      <path d="M48 92 H182 L177 120 H53 Z" fill="url(#cbFlap)" stroke="#9A6A36" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M53 120 H177" stroke="#b07f44" strokeWidth="1.5" opacity="0.55" />
      {/* tape seam */}
      <path d="M115 120 V174" stroke="#cda564" strokeWidth="2" opacity="0.7" />
      {/* shipping label */}
      <rect x="95" y="132" width="46" height="27" rx="2.5" fill="url(#cbTape)" stroke="#bd8d55" strokeWidth="2" />
      <path d="M102 140h32M102 146h24M102 152h28" stroke="#b07f44" strokeWidth="2" strokeLinecap="round" />
      {/* top edge highlight */}
      <path d="M49 93 H181" stroke="#F8E9C6" strokeWidth="2" opacity="0.85" />
    </svg>
  );
}

export default function PartCanvas({ names }: { names: string[] }) {
  // settle the icons a beat after the customer stops typing
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
  const hasTiles = tiles.length > 0;

  return (
    <div className="box-canvas">
      <div className="box-stage">
        <div className="box-glow" />

        <div className="box-layer box-back">
          <BoxBack />
        </div>

        <div className="box-items">
          {!hasTiles ? (
            <motion.div className="box-hint" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="box-hint-title">ANY PART · ANY CAR</div>
              <div className="box-hint-sub">Type a part — we&apos;ll unpack it.</div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tiles.map((t, idx) => (
                <motion.div
                  key={`${t.i}-${t.key}`}
                  layout
                  initial={{ y: 64, scale: 0.4, opacity: 0, rotate: -12 }}
                  animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ y: 54, scale: 0.35, opacity: 0, transition: { duration: 0.16 } }}
                  transition={{ type: "spring", stiffness: 360, damping: 16, delay: idx * 0.015 }}
                  className="box-tile"
                >
                  <div className="pc-box">
                    <span className="pc-glow" />
                    {t.icon}
                  </div>
                  <div className="pc-label">{t.label}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <motion.div
          key={tiles.length}
          initial={{ scaleY: 0.9, scaleX: 1.03 }}
          animate={{ scaleY: 1, scaleX: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 13 }}
          style={{ transformOrigin: "bottom center" }}
          className="box-layer box-front"
        >
          <BoxFront />
        </motion.div>

        {hasTiles && (
          <>
            <span className="spark spark-1" />
            <span className="spark spark-2" />
            <span className="spark spark-3" />
            <span className="spark spark-4" />
          </>
        )}

        <div className="box-floor" />
      </div>
    </div>
  );
}
