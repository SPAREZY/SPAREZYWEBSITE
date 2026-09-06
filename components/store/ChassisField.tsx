"use client";

import { useMemo, useRef } from "react";
import RotatingPlaceholder from "./RotatingPlaceholder";

// Sample VINs shown as a rotating hint once a brand is chosen. The leading
// characters are that maker's real WMI (world manufacturer identifier), so the
// example looks like a VIN the customer would actually find on their own car.
// Brands not listed fall back to GENERIC_VIN.
const VIN_BY_BRAND: Record<string, string[]> = {
  toyota: ["JTEBU4BF50K123456", "JTDKB20U887654321", "JTMHV05J104123456"],
  lexus: ["JTHBK1GG402345678", "JTJHY00W104123456"],
  nissan: ["JN1TANT32U0123456", "JN8AZ2NE1B9001234"],
  infiniti: ["JN1BV7AR5FM123456", "JN8AZ2NF9J9712345"],
  honda: ["JHMCM56557C404453", "SHHFK2750JU201234"],
  acura: ["JH4KA7561PC001234", "19UUB2F52JA004321"],
  mitsubishi: ["JA3AY11A34U012345", "JMBLYV98W8J000123"],
  mazda: ["JM1BL1SF3A1123456", "JM3KE2CY7F0512345"],
  subaru: ["JF1GH61608G012345", "JF2SJAEC4FH512345"],
  suzuki: ["JS2YB5A38B6301234", "JSAEZC21S00123456"],
  "mercedes-benz": ["WDB2110561A123456", "W1K2130461A012345"],
  bmw: ["WBA3A5C51DF123456", "WBAPK5C50BA123456"],
  audi: ["WAUZZZ8K9BA123456", "WAUAFAFL1BN012345"],
  volkswagen: ["WVWZZZ1KZAW123456", "WVGZZZ5NZBW012345"],
  porsche: ["WP0AB2A78CL012345", "WP1AB2A50CLA12345"],
  hyundai: ["KMHD35LE0EU123456", "KMHJ3814GKU012345"],
  kia: ["KNAGM4AD5B5123456", "KNDPB3AC7F7012345"],
  genesis: ["KMTG341ABLU012345"],
  ford: ["1FAHP2E85DG123456", "1FMCU9J92KUA12345"],
  chevrolet: ["1G1ZD5ST7JF123456", "KL1TD5DE9BB012345"],
  gmc: ["1GKS2CKJ8FR123456"],
  cadillac: ["1G6DP5EV5A0123456"],
  jeep: ["1C4RJFBG5FC123456", "1J4GA59189L712345"],
  dodge: ["1C3CDZAB0DN123456"],
  chrysler: ["2C3CCAEG5FH123456"],
  "land rover": ["SALGS2SE8LA123456", "SALLMAM53XA912345"],
  jaguar: ["SAJWA1CB7BLS12345"],
  volvo: ["YV1RS592892123456", "YV4A22PK5K1012345"],
  renault: ["VF1BM0C0H41234567"],
  peugeot: ["VF3LCBHZHGS123456"],
  citroen: ["VF7SBRHK9EW123456"],
  fiat: ["ZFA31200000123456"],
  ferrari: ["ZFF67NFA5F0201234"],
  lamborghini: ["ZHWUC1ZF9FLA12345"],
  maserati: ["ZAM45VLA5F0123456"],
  bentley: ["SCBBR9ZA5BC123456"],
  "rolls-royce": ["SCA664S57DUX12345"],
  "aston martin": ["SCFEBBAF3DGA12345"],
  mini: ["WMWZC3C51DWP12345"],
  skoda: ["TMBJJ7NE0F0123456"],
  seat: ["VSSZZZ5FZFR123456"],
  tesla: ["5YJ3E1EA7JF123456"],
};

// Used before a brand is known and for makes without a mapping.
const GENERIC_VIN = ["JTEBU4BF50K123456", "WDB1234567A123456", "MMBJNKA10JH012345"];

// Step 2 of the inquiry: the VIN / chassis number that identifies the exact
// car. Entered by hand — typed or pasted.
export default function ChassisField({
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
  const inputRef = useRef<HTMLInputElement>(null);

  const brandPicked = brandName.trim().length > 0;
  const hintItems = useMemo(
    () => VIN_BY_BRAND[brandName.trim().toLowerCase()] ?? GENERIC_VIN,
    [brandName],
  );

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
        {/* Sample VINs only once a brand is chosen — before that they'd suggest a
            VIN from the wrong make. The box stays empty until then. */}
        <RotatingPlaceholder show={brandPicked && value.length === 0} items={hintItems} />
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
