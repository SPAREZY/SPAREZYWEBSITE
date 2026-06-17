import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Brands that shouldn't be title-cased (acronyms / special casing).
const BRAND_FIX: Record<string, string> = {
  bmw: "BMW",
  gmc: "GMC",
  mg: "MG",
  byd: "BYD",
  jac: "JAC",
  ram: "RAM",
  mini: "MINI",
  "mercedes-benz": "Mercedes-Benz",
  "land rover": "Land Rover",
  "rolls-royce": "Rolls-Royce",
  "alfa romeo": "Alfa Romeo",
};

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
function normMake(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return BRAND_FIX[t.toLowerCase()] ?? titleCase(t);
}

// Decodes a 17-char VIN to { make, model, year } via the free NHTSA vPIC API.
// Returns nulls (never errors) for non-VINs, blocked network, or no data, so
// the storefront form keeps working regardless.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vin = (searchParams.get("vin") ?? "").trim().toUpperCase();

  // Proper VIN: 17 chars, no I/O/Q. Chassis codes / short numbers won't decode.
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return NextResponse.json({ make: null, model: null, year: null });
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(timer);
    if (!res.ok) return NextResponse.json({ make: null, model: null, year: null });

    const data = await res.json();
    const r = Array.isArray(data?.Results) ? data.Results[0] : null;
    return NextResponse.json({
      make: r?.Make ? normMake(String(r.Make)) : null,
      model: r?.Model ? titleCase(String(r.Model)) : null,
      year: r?.ModelYear ? String(r.ModelYear) : null,
    });
  } catch {
    return NextResponse.json({ make: null, model: null, year: null });
  }
}
