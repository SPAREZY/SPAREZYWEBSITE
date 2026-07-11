// ============================================================
// Real-estate portfolio tracker — types, metrics and storage.
// Data lives in the browser (localStorage) so the tracker is
// private to the owner's device and needs no backend changes.
// ============================================================

export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "commercial"
  | "land"
  | "other";

export type PropertyStatus = "owned" | "under-offer" | "sold";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  status: PropertyStatus;
  /** yyyy-mm-dd */
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  mortgageBalance: number;
  monthlyRent: number;
  monthlyExpenses: number;
  occupied: boolean;
  /** only meaningful when status === "sold" */
  salePrice: number;
  notes: string;
}

export interface PortfolioData {
  version: 1;
  currency: string;
  properties: Property[];
}

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "owned", label: "Owned" },
  { value: "under-offer", label: "Under Offer" },
  { value: "sold", label: "Sold" },
];

export const CURRENCIES = ["AED", "USD", "EUR", "GBP", "SAR", "INR"];

const STORAGE_KEY = "sparezy.portfolio.v1";

export function emptyPortfolio(): PortfolioData {
  return { version: 1, currency: "AED", properties: [] };
}

export function loadPortfolio(): PortfolioData {
  if (typeof window === "undefined") return emptyPortfolio();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPortfolio();
    const parsed = JSON.parse(raw);
    return normalizePortfolio(parsed);
  } catch {
    return emptyPortfolio();
  }
}

export function savePortfolio(data: PortfolioData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Coerce imported/stored JSON into a valid PortfolioData, dropping junk. */
export function normalizePortfolio(input: unknown): PortfolioData {
  const out = emptyPortfolio();
  if (!input || typeof input !== "object") return out;
  const obj = input as Record<string, unknown>;
  if (typeof obj.currency === "string" && obj.currency.length <= 5) {
    out.currency = obj.currency.toUpperCase();
  }
  if (Array.isArray(obj.properties)) {
    out.properties = obj.properties
      .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
      .map((p) => normalizeProperty(p));
  }
  return out;
}

function normalizeProperty(p: Record<string, unknown>): Property {
  const num = (v: unknown) => {
    const n = typeof v === "string" ? parseFloat(v) : (v as number);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const type = PROPERTY_TYPES.some((t) => t.value === p.type)
    ? (p.type as PropertyType)
    : "other";
  const status = PROPERTY_STATUSES.some((s) => s.value === p.status)
    ? (p.status as PropertyStatus)
    : "owned";
  return {
    id: str(p.id) || newId(),
    name: str(p.name),
    address: str(p.address),
    type,
    status,
    purchaseDate: str(p.purchaseDate),
    purchasePrice: num(p.purchasePrice),
    currentValue: num(p.currentValue),
    mortgageBalance: num(p.mortgageBalance),
    monthlyRent: num(p.monthlyRent),
    monthlyExpenses: num(p.monthlyExpenses),
    occupied: p.occupied !== false,
    salePrice: num(p.salePrice),
    notes: str(p.notes),
  };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

// ---------------- per-property metrics ----------------

export function equity(p: Property): number {
  return p.currentValue - p.mortgageBalance;
}

export function monthlyCashFlow(p: Property): number {
  if (p.status === "sold") return 0;
  return (p.occupied ? p.monthlyRent : 0) - p.monthlyExpenses;
}

/** Gross rental yield on current value, %. */
export function grossYield(p: Property): number {
  if (p.status === "sold" || p.currentValue <= 0) return 0;
  return ((p.monthlyRent * 12) / p.currentValue) * 100;
}

/** Appreciation vs purchase price, % (sold properties use sale price). */
export function appreciationPct(p: Property): number {
  if (p.purchasePrice <= 0) return 0;
  const value = p.status === "sold" && p.salePrice > 0 ? p.salePrice : p.currentValue;
  return ((value - p.purchasePrice) / p.purchasePrice) * 100;
}

export function appreciationAmount(p: Property): number {
  const value = p.status === "sold" && p.salePrice > 0 ? p.salePrice : p.currentValue;
  return value - p.purchasePrice;
}

// ---------------- portfolio-wide metrics ----------------

export interface PortfolioStats {
  activeCount: number;
  soldCount: number;
  totalValue: number;
  totalDebt: number;
  totalEquity: number;
  totalInvested: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  avgYield: number;
  appreciation: number;
  appreciationPct: number;
  realizedGains: number;
  occupiedCount: number;
  rentableCount: number;
}

export function portfolioStats(properties: Property[]): PortfolioStats {
  const active = properties.filter((p) => p.status !== "sold");
  const sold = properties.filter((p) => p.status === "sold");

  const totalValue = active.reduce((s, p) => s + p.currentValue, 0);
  const totalDebt = active.reduce((s, p) => s + p.mortgageBalance, 0);
  const totalInvested = active.reduce((s, p) => s + p.purchasePrice, 0);
  const monthlyRent = active.reduce(
    (s, p) => s + (p.occupied ? p.monthlyRent : 0),
    0
  );
  const monthlyExpenses = active.reduce((s, p) => s + p.monthlyExpenses, 0);
  const rentable = active.filter((p) => p.monthlyRent > 0);

  return {
    activeCount: active.length,
    soldCount: sold.length,
    totalValue,
    totalDebt,
    totalEquity: totalValue - totalDebt,
    totalInvested,
    monthlyRent,
    monthlyExpenses,
    monthlyCashFlow: monthlyRent - monthlyExpenses,
    annualCashFlow: (monthlyRent - monthlyExpenses) * 12,
    avgYield:
      totalValue > 0
        ? (active.reduce((s, p) => s + p.monthlyRent * 12, 0) / totalValue) * 100
        : 0,
    appreciation: totalValue - totalInvested,
    appreciationPct:
      totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
    realizedGains: sold.reduce((s, p) => s + (p.salePrice - p.purchasePrice), 0),
    occupiedCount: rentable.filter((p) => p.occupied).length,
    rentableCount: rentable.length,
  };
}

// ---------------- formatting ----------------

export function fmtMoney(value: number, currency: string): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}${currency} ${Math.abs(rounded).toLocaleString("en-US")}`;
}

/** Compact money for stat tiles: AED 1.24M / AED 850K. */
export function fmtMoneyCompact(value: number, currency: string): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}${currency} ${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}${currency} ${(abs / 1_000).toFixed(0)}K`;
  }
  return fmtMoney(value, currency);
}

export function fmtPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
