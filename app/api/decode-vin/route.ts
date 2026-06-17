import { NextResponse } from "next/server";
import { isVin, parseVpic } from "@/lib/vin";

export const dynamic = "force-dynamic";

// Server-side fallback decode via the free NHTSA vPIC API. Returns nulls
// (never errors) for non-VINs, blocked egress, or no data so the storefront
// form keeps working regardless. Note: this path needs the host's outbound
// network to allow vpic.nhtsa.dot.gov; the client tries NHTSA directly first.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vin = (searchParams.get("vin") ?? "").trim().toUpperCase();
  if (!isVin(vin)) return NextResponse.json({ make: null, model: null, year: null });

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(timer);
    if (!res.ok) return NextResponse.json({ make: null, model: null, year: null });
    return NextResponse.json(parseVpic(await res.json()));
  } catch {
    return NextResponse.json({ make: null, model: null, year: null });
  }
}
