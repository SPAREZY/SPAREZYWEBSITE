// VIN decode helpers shared by the client and the server proxy.
// The client calls NHTSA directly (uses the visitor's network, so it isn't
// subject to the server's outbound egress allowlist) and falls back to our
// /api/decode-vin proxy. All paths fail soft — they never throw to the caller.

export type VinDecode = { make: string | null; model: string | null; year: string | null };
const EMPTY: VinDecode = { make: null, model: null, year: null };

// Brands that shouldn't be naively title-cased (acronyms / special casing).
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

export function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
export function normalizeMake(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return BRAND_FIX[t.toLowerCase()] ?? titleCase(t);
}

// Proper VIN: 17 chars, no I/O/Q. Chassis codes / short numbers won't decode.
export function isVin(v: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(v.trim().toUpperCase());
}

type VpicResponse = {
  Results?: Array<{ Make?: string; Model?: string; ModelYear?: string }>;
};

export function parseVpic(data: VpicResponse): VinDecode {
  const r = data?.Results?.[0];
  return {
    make: r?.Make ? normalizeMake(String(r.Make)) : null,
    model: r?.Model ? titleCase(String(r.Model)) : null,
    year: r?.ModelYear ? String(r.ModelYear) : null,
  };
}

const NHTSA = (vin: string) =>
  `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;

// Client-side decode: try NHTSA directly, then our server proxy as a fallback.
export async function decodeVin(vin: string, signal?: AbortSignal): Promise<VinDecode> {
  const v = vin.trim().toUpperCase();
  if (!isVin(v)) return EMPTY;

  try {
    const res = await fetch(NHTSA(v), { signal });
    if (res.ok) {
      const d = parseVpic(await res.json());
      if (d.make || d.model || d.year) return d;
    }
  } catch {
    /* CORS/network — fall through to the proxy */
  }

  try {
    const res = await fetch(`/api/decode-vin?vin=${encodeURIComponent(v)}`, { signal });
    if (res.ok) return (await res.json()) as VinDecode;
  } catch {
    /* ignore */
  }

  return EMPTY;
}
