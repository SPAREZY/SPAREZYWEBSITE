"use client";

import { useState } from "react";

// Popular UAE makes shown as tiles; the rest live in the searchable list.
const POPULAR = ["Toyota", "Nissan", "Mitsubishi", "Lexus", "Honda", "Mercedes-Benz"];

// Real full-colour brand logos in /public/brand-logos. Others fall back to a
// clean name tile.
const LOGOS = new Set(["toyota", "nissan", "mitsubishi", "lexus", "honda", "mercedes-benz"]);
function logoFor(name: string): string | null {
  const f = name.toLowerCase().replace(/\s+/g, "-");
  return LOGOS.has(f) ? `/brand-logos/${f}.png` : null;
}

export default function BrandPicker({
  value,
  onChange,
  brands,
}: {
  value: string;
  onChange: (v: string) => void;
  brands: string[];
}) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = [...brands]
    .sort((a, b) => a.localeCompare(b))
    .filter((b) => !term || b.toLowerCase().includes(term));
  const eq = (b: string) => value.trim().toLowerCase() === b.toLowerCase();

  return (
    <div className="brandbox">
      <div className="brand-tiles">
        {POPULAR.map((b) => {
          const logo = logoFor(b);
          return (
            <button
              type="button"
              key={b}
              className={`brand-tile ${eq(b) ? "active" : ""}`}
              onClick={() => onChange(eq(b) ? "" : b)}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="brand-logo" />
              ) : (
                <span className="brand-logo-fallback">{b[0]}</span>
              )}
              <span className="brand-name">{b}</span>
            </button>
          );
        })}
      </div>

      <div className="brand-search-wrap">
        <svg className="brand-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className="brand-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all brands"
          aria-label="Search car brands"
        />
      </div>

      <ul className="brand-list">
        {list.map((b) => (
          <li key={b}>
            <button
              type="button"
              className={`brand-row ${eq(b) ? "active" : ""}`}
              onClick={() => onChange(eq(b) ? "" : b)}
            >
              <span>{b}</span>
              {eq(b) && <span className="brand-check">✓</span>}
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="brand-none">No brand matches “{q}”. Just add it in your parts list.</li>
        )}
      </ul>
    </div>
  );
}
