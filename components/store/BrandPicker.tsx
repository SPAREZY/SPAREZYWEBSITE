"use client";

import { useState } from "react";
import { CAR_BRANDS, POPULAR_SLUGS, type CarBrand } from "@/lib/car-brands";
import RotatingPlaceholder from "./RotatingPlaceholder";

// Brand names that scroll through the search box as an animated hint.
const SEARCH_HINTS = [
  "Toyota", "Nissan", "BMW", "Mercedes-Benz", "Honda", "Lexus",
  "Ford", "Hyundai", "Kia", "Mitsubishi", "Land Rover", "Audi", "Porsche",
];

// Popular brands surface first in the strip when nothing is typed.
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

  const selected =
    CAR_BRANDS.find((b) => b.name.toLowerCase() === value.trim().toLowerCase()) || null;

  const term = q.trim().toLowerCase();
  const results = term
    ? CAR_BRANDS.filter((b) => b.name.toLowerCase().includes(term))
    : [...POPULAR, ...REST];

  function pick(b: CarBrand) {
    onChange(b.name);
    setQ("");
  }

  function clearSelection() {
    onChange("");
    setQ("");
  }

  return (
    <div className="brandbox">
      <h2 className="step-head">Select your brand</h2>

      {selected ? (
        <div className="brand-selected">
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
          <span className="brand-selected-name">{selected.name}</span>
          <button
            type="button"
            className="brand-clear"
            onClick={clearSelection}
            aria-label="Change car brand"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      ) : (
        <>
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
              className="brand-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  e.preventDefault();
                  pick(results[0]);
                }
              }}
              aria-label="Search car brands"
              autoComplete="off"
            />
            <RotatingPlaceholder show={q.length === 0} items={SEARCH_HINTS} prefix="Search " />
          </div>

          <div className="brand-strip">
            {results.map((b) => (
              <button
                type="button"
                key={b.slug}
                className="brand-tile"
                onClick={() => pick(b)}
                title={b.name}
              >
                <span className="brand-badge">
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/brand-logos/${b.slug}.png`} alt="" className="brand-logo" loading="lazy" />
                  ) : (
                    <span className="brand-logo-fallback">{b.name[0]}</span>
                  )}
                </span>
                <span className="brand-name">{b.name}</span>
              </button>
            ))}
            {results.length === 0 && (
              <div className="brand-none">
                No brand matches “{q}”. Add it in your parts list and we&apos;ll still find it.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
