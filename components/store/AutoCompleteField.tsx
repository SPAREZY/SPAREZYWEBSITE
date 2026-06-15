"use client";

import { useEffect, useRef, useState } from "react";
import RotatingPlaceholder from "./RotatingPlaceholder";

// Input with a type-to-filter suggestion dropdown (Make / Model / Year).
// Keeps the rotating example placeholder while empty, closes on outside
// click or Escape, and uses onMouseDown so the pick lands before blur.
export default function AutoCompleteField({
  value,
  onChange,
  options,
  egItems,
  numeric = false,
  maxLength,
  match = "includes",
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  egItems: string[];
  numeric?: boolean;
  maxLength?: number;
  match?: "includes" | "startsWith";
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const q = value.trim().toLowerCase();
  const suggestions =
    open && q.length > 0
      ? options
          .filter((o) => {
            const lo = o.toLowerCase();
            return match === "startsWith" ? lo.startsWith(q) : lo.includes(q);
          })
          .filter((o) => o.toLowerCase() !== q) // hide a lone exact match
          .slice(0, 8)
      : [];

  return (
    <div className="f-field make-ac" ref={wrapRef}>
      <input
        autoComplete="off"
        aria-label={ariaLabel}
        value={value}
        maxLength={maxLength}
        inputMode={numeric ? "numeric" : undefined}
        onChange={(e) => {
          const v = numeric ? e.target.value.replace(/[^0-9]/g, "") : e.target.value;
          onChange(v);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim().length > 0) setOpen(true);
        }}
      />
      <RotatingPlaceholder show={value.length === 0} items={egItems} />
      {suggestions.length > 0 && (
        <ul className="make-drop" role="listbox">
          {suggestions.map((o) => (
            <li
              key={o}
              role="option"
              className="make-opt"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
