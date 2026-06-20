"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CAR_BRANDS } from "@/lib/car-brands";
import { modelsForSlug } from "@/lib/car-models";
import RotatingPlaceholder from "./RotatingPlaceholder";

// Fallback rotating hints for brands we don't have a model list for.
const EG_MODEL = [
  "Land Cruiser", "Camry", "Corolla", "Patrol", "Civic",
  "Hilux", "Pajero", "Accord", "Altima", "Prado",
];

export default function ModelPicker({
  brandName,
  value,
  err,
  onChange,
}: {
  brandName: string;
  value: string;
  err: boolean;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const brandSelected = brandName.trim().length > 0;
  const slug = useMemo(() => {
    const n = brandName.trim().toLowerCase();
    return CAR_BRANDS.find((b) => b.name.toLowerCase() === n)?.slug ?? "";
  }, [brandName]);
  const models = useMemo(() => (slug ? modelsForSlug(slug) : []), [slug]);
  const hasList = models.length > 0;

  const term = value.trim().toLowerCase();
  const results = useMemo(
    () =>
      (term ? models.filter((m) => m.toLowerCase().includes(term)) : models).slice(0, 80),
    [models, term],
  );

  // close the dropdown on any outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(m: string) {
    onChange(m);
    setOpen(false);
  }

  // When a brand list exists, rotate its real models as the hint.
  const hintItems = hasList ? models.slice(0, 14) : EG_MODEL;

  return (
    <div className="model-combo" ref={wrapRef}>
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
          className={`model-search ${err ? "err" : ""}`}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label="Your car model"
          autoComplete="off"
        />
        <RotatingPlaceholder
          show={value.length === 0 && brandSelected}
          items={hintItems}
          prefix="Search "
        />
        {value.trim() && (
          <button
            className="field-clear"
            type="button"
            aria-label="Clear model"
            onClick={() => {
              onChange("");
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      {open && hasList && results.length > 0 && (
        <ul className="model-menu" role="listbox">
          {results.map((m) => (
            <li key={m} role="option" aria-selected={m === value}>
              <button type="button" className="model-opt" onClick={() => pick(m)}>
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
