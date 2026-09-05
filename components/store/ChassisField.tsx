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

// Step 2 of the inquiry: how we identify the exact car. The customer either
// types the chassis (VIN) number or photographs the registration card — the
// photo is compressed to a small JPEG data URL by the caller, so this needs
// no blob storage.
export default function ChassisField({
  value,
  photo,
  err,
  busy,
  onChange,
  onPickPhoto,
  onClearPhoto,
}: {
  value: string;
  photo: string;
  err: boolean;
  busy: boolean;
  onChange: (v: string) => void;
  onPickPhoto: (f: File) => void;
  onClearPhoto: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
          aria-label="Chassis number"
          value={value}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={24}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
        <RotatingPlaceholder show={value.length === 0} items={EG_VIN} />
        {value.trim().length > 0 && (
          <button
            className="part-del"
            title="Clear"
            aria-label="Clear chassis number"
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

      {/* or photograph the registration card / chassis plate instead */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickPhoto(f);
          e.target.value = ""; // allow re-picking the same file
        }}
      />

      {photo ? (
        <div className="vin-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Chassis / registration card" />
          <button
            type="button"
            className="vin-thumb-x"
            aria-label="Remove photo"
            title="Remove photo"
            onClick={onClearPhoto}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`vin-upload ${busy ? "busy" : ""}`}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L8 6H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4l-1.5-2Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <span>{busy ? "Adding photo…" : "or upload a photo of it"}</span>
        </button>
      )}
    </div>
  );
}
