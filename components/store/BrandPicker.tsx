"use client";

import { useEffect, useRef, useState } from "react";
import { CAR_BRANDS, POPULAR_SLUGS, type CarBrand } from "@/lib/car-brands";
import RotatingPlaceholder from "./RotatingPlaceholder";

// Brand names that scroll through the search box as an animated hint.
const SEARCH_HINTS = [
  "Toyota", "Nissan", "BMW", "Mercedes-Benz", "Honda", "Lexus",
  "Ford", "Hyundai", "Kia", "Mitsubishi", "Land Rover", "Audi", "Porsche",
];

// Popular brands surface first when the field is empty.
const POPULAR = POPULAR_SLUGS
  .map((s) => CAR_BRANDS.find((b) => b.slug === s))
  .filter((b): b is CarBrand => Boolean(b));
const REST = CAR_BRANDS.filter((b) => !POPULAR_SLUGS.includes(b.slug));

export default function BrandPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected =
    CAR_BRANDS.find((b) => b.name.toLowerCase() === value.trim().toLowerCase()) || null;

  const term = q.trim().toLowerCase();
  const results = term
    ? CAR_BRANDS.filter((b) => b.name.toLowerCase().includes(term))
    : [...POPULAR, ...REST];

  // close the dropdown on any outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(b: CarBrand) {
    onChange(b.name);
    setQ("");
    setOpen(false);
  }

  function clearSelection() {
    onChange("");
    setQ("");
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="brandbox" ref={wrapRef}>
      <h2 className="brand-heading">Select your car brand to find parts</h2>

      <div className={`brand-combo ${open ? "open" : ""}`}>
        {selected ? (
          <div className="brand-selected">
            <span className="brand-chip">
              {selected.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/brand-logos/${selected.slug}.png`} alt="" className="brand-logo" />
              ) : (
                <span className="brand-logo-fallback">{selected.name[0]}</span>
              )}
            </span>
            <span className="brand-selected-name">{selected.name}</span>
            <button
              type="button"
              className="brand-clear"
              onClick={clearSelection}
              aria-label="Change car brand"
            >
              Change
            </button>
          </div>
        ) : (
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
              className="brand-search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                else if (e.key === "Enter" && results[0]) {
                  e.preventDefault();
                  pick(results[0]);
                }
              }}
              aria-label="Search car brands"
              autoComplete="off"
            />
            <RotatingPlaceholder show={q.length === 0} items={SEARCH_HINTS} prefix="Search " />
          </div>
        )}

        {open && !selected && (
          <ul className="brand-menu" role="listbox">
            {results.map((b) => (
              <li key={b.slug} role="option" aria-selected="false">
                <button type="button" className="brand-opt" onClick={() => pick(b)}>
                  <span className="brand-opt-logo">
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/brand-logos/${b.slug}.png`} alt="" loading="lazy" />
                    ) : (
                      <span className="brand-logo-fallback sm">{b.name[0]}</span>
                    )}
                  </span>
                  <span className="brand-opt-name">{b.name}</span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="brand-none">
                No brand matches “{q}”. Add it in your parts list and we&apos;ll still find it.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
