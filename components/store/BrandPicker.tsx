"use client";

import { useState } from "react";
import { CAR_BRANDS, POPULAR_SLUGS, type CarBrand } from "@/lib/car-brands";

const POPULAR = POPULAR_SLUGS
  .map((s) => CAR_BRANDS.find((b) => b.slug === s))
  .filter((b): b is CarBrand => Boolean(b));

export default function BrandPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const results = term
    ? CAR_BRANDS.filter((b) => b.name.toLowerCase().includes(term))
    : POPULAR;
  const eq = (b: CarBrand) => value.trim().toLowerCase() === b.name.toLowerCase();

  return (
    <div className="brandbox">
      <h2 className="brand-heading">Select your car brand for any part</h2>
      <p className="brand-subheading">Pick your car&apos;s brand and find parts fast</p>

      <div className="brand-search-wrap">
        <svg className="brand-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className="brand-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all car brands"
          aria-label="Search car brands"
        />
      </div>

      <div className={`brand-tiles ${term ? "searching" : ""}`}>
        {results.map((b) => (
          <button
            type="button"
            key={b.slug}
            className={`brand-tile ${eq(b) ? "active" : ""}`}
            onClick={() => onChange(eq(b) ? "" : b.name)}
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
          <div className="brand-none">No brand matches “{q}”. Add it in your parts list and we&apos;ll still find it.</div>
        )}
      </div>
    </div>
  );
}
