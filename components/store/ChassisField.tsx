"use client";

import { useRef } from "react";
import RotatingPlaceholder from "./RotatingPlaceholder";

// Rotating examples so the empty box reads as "type something like this".
const EG_VIN = [
  "JTEBU4BF50K123456",
  "WDB1234567A123456",
  "MMBJNKA10JH012345",
  "JN1TANT32U0123456",
];

// Step 2 of the inquiry: the VIN / chassis number that identifies the exact
// car. Entered by hand — typed or pasted.
export default function ChassisField({
  value,
  err,
  onChange,
}: {
  value: string;
  err: boolean;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chassis-combo">
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
          aria-label="VIN"
          value={value}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={24}
          // Uppercased on the way in so a typed and a pasted VIN look the same.
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
        <RotatingPlaceholder show={value.length === 0} items={EG_VIN} />
        {value.trim().length > 0 && (
          <button
            className="part-del"
            title="Clear"
            aria-label="Clear VIN"
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
    </div>
  );
}
