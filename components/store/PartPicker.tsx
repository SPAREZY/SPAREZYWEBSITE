"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AUTO_PARTS, BODY_PARTS } from "@/lib/car-parts";
import RotatingPlaceholder from "./RotatingPlaceholder";

// A handful of popular parts cycle through the box as an animated hint.
const EG_PART = [
  "Front brake pads", "Oil filter", "Headlight", "Alternator",
  "Fuel pump", "Radiator", "Timing belt", "Shock absorber",
];
const EG_BODY = [
  "Front bumper", "Side mirror", "Windshield", "Front door",
  "Bonnet / hood", "Grille", "Dashboard", "Door handle",
];

export default function PartPicker({
  value,
  hintActive,
  hintOffset = 0,
  mode = "auto",
  onChange,
  onRemove,
}: {
  value: string;
  hintActive: boolean;
  /** Row index — staggers the rotating examples so parallel rows differ. */
  hintOffset?: number;
  /** "auto" suggests everything except body parts; "body" suggests only body parts. */
  mode?: "auto" | "body";
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const catalogue = mode === "body" ? BODY_PARTS : AUTO_PARTS;
  const examples = mode === "body" ? EG_BODY : EG_PART;

  // Rotate the example list by 3 per row so rows never show the same hint.
  const hintItems = useMemo(() => {
    const shift = (hintOffset * 3) % examples.length;
    return [...examples.slice(shift), ...examples.slice(0, shift)];
  }, [hintOffset, examples]);

  const term = value.trim().toLowerCase();
  const results = useMemo(
    () =>
      (term ? catalogue.filter((p) => p.toLowerCase().includes(term)) : catalogue).slice(0, 80),
    [term, catalogue],
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
