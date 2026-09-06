"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CAR_PARTS } from "@/lib/car-parts";
import RotatingPlaceholder from "./RotatingPlaceholder";

// A handful of popular parts cycle through the box as an animated hint.
const EG_PART = [
  "Front brake pads", "Oil filter", "Headlight", "Alternator",
  "Fuel pump", "Radiator", "Timing belt", "Shock absorber",
];
// Rows rendered per scroll step — matches the previous cap, so the first
// screenful of the dropdown is exactly as quick as it has always been.
const CHUNK = 80;

export default function PartPicker({
  value,
  hintActive,
  hintOffset = 0,
  canRemove,
  onChange,
  onRemove,
}: {
  value: string;
  hintActive: boolean;
  /** Row index — staggers the rotating examples so parallel rows differ. */
  hintOffset?: number;
  /** False on the only row, where there is nothing for an empty ✕ to do. */
  canRemove: boolean;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate the example list by 3 per row so rows never show the same hint.
  // Only the first row cycles: with several rows animating independently they
  // ghosted through one another mid-fade (opacity dips to ~0 in every 2s
  // cycle) and regularly drifted onto the same word. Extra rows get one steady
  // example each instead — a single-item list renders static.
  const hintItems = useMemo(() => {
    const shift = (hintOffset * 3) % EG_PART.length;
    const rotated = [...EG_PART.slice(shift), ...EG_PART.slice(0, shift)];
    // A lone row keeps the cycling hint. The moment there are several, every
    // row goes static on its own word: independent 2s cycles ghosted through
    // each other mid-fade, and a cycling row kept drifting onto the word a
    // static neighbour was already showing. The per-row shift keeps the eight
    // examples distinct for the first eight rows.
    return canRemove ? [rotated[0]] : rotated;
  }, [hintOffset, canRemove]);

  const term = value.trim().toLowerCase();
  const matches = useMemo(
    () => (term ? CAR_PARTS.filter((p) => p.toLowerCase().includes(term)) : CAR_PARTS),
    [term],
  );

  // The catalogue runs to well over a thousand parts. Painting them all at once
  // costs ~350ms on a mid-range phone, so render a chunk and extend as the user
  // scrolls — the whole list is still reachable, it just arrives a screen at a
  // time. Reset back to one chunk whenever the search term or open state changes.
  const [limit, setLimit] = useState(CHUNK);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    setLimit(CHUNK);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [term, open]);

  const results = matches.slice(0, limit);

  function onListScroll(e: React.UIEvent<HTMLUListElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 160) {
      setLimit((n) => (n < matches.length ? n + CHUNK : n));
    }
  }

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
        {/* On the lone empty row this button could neither clear nor remove
            anything, so it sat there doing nothing. Show it only when it has a
            job: text to clear, or a spare row to delete. */}
        {(value.trim().length > 0 || canRemove) && (
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
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="model-menu" role="listbox" ref={listRef} onScroll={onListScroll}>
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
