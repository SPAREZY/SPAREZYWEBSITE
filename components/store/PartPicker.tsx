"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CAR_PARTS } from "@/lib/car-parts";
import RotatingPlaceholder from "./RotatingPlaceholder";

// A handful of popular parts cycle through the box as an animated hint.
const EG_PART = [
  "Front brake pads", "Oil filter", "Headlight", "Alternator",
  "Side mirror", "Radiator", "Timing belt", "Shock absorber",
];

export default function PartPicker({
  value,
  hintActive,
  hintOffset = 0,
  onChange,
  onRemove,
}: {
  value: string;
  hintActive: boolean;
  /** Row index — staggers the rotating examples so parallel rows differ. */
  hintOffset?: number;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate the example list by 3 per row so rows never show the same hint.
  const hintItems = useMemo(() => {
    const shift = (hintOffset * 3) % EG_PART.length;
    return [...EG_PART.slice(shift), ...EG_PART.slice(0, shift)];
  }, [hintOffset]);

  const term = value.trim().toLowerCase();
  const results = useMemo(
    () =>
      (term ? CAR_PARTS.filter((p) => p.toLowerCase().includes(term)) : CAR_PARTS).slice(0, 80),
    [term],
  );

  // close the dropdown on any outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(p: string) {
    onChange(p);
    setOpen(false);
  }

  return (
    <div className="part-row" ref={wrapRef}>
      <div className="brand-search-wrap">
        <svg
          className="brand-search-ico"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          className="p-name"
          aria-label="Part name"
          value={value}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <RotatingPlaceholder show={value.length === 0 && hintActive} items={hintItems} />
        <button
          className="part-del"
          title={value.trim() ? "Clear" : "Remove"}
          aria-label={value.trim() ? "Clear part" : "Remove part"}
          onClick={() => {
            if (value.trim()) {
              // first ✕ press clears the typed text…
              onChange("");
              setOpen(false);
              requestAnimationFrame(() => inputRef.current?.focus());
            } else {
              // …already empty → remove this part row
              onRemove();
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="model-menu" role="listbox">
          {results.map((p) => (
            <li key={p} role="option" aria-selected={p === value}>
              <button type="button" className="model-opt" onClick={() => pick(p)}>
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
