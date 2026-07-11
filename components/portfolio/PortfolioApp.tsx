"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CURRENCIES,
  PortfolioData,
  Property,
  PropertyStatus,
  emptyPortfolio,
  fmtMoney,
  fmtMoneyCompact,
  fmtPct,
  loadPortfolio,
  normalizePortfolio,
  portfolioStats,
  savePortfolio,
} from "@/lib/portfolio";
import PropertyCard from "./PropertyCard";
import PropertyForm from "./PropertyForm";

type Filter = "all" | PropertyStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "owned", label: "Owned" },
  { value: "under-offer", label: "Under Offer" },
  { value: "sold", label: "Sold" },
];

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down";
}) {
  const toneCls =
    tone === "up" ? "text-[#8ef0b6]" : tone === "down" ? "text-[#ffb3b0]" : "text-white";
  return (
    <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.13] to-white/[0.05] p-4">
      <div className="text-[0.62rem] font-bold uppercase tracking-wider2 text-white/55">
        {label}
      </div>
      <div className={`mt-1 font-mono text-xl font-bold leading-tight sm:text-2xl ${toneCls}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[0.7rem] font-semibold text-white/50">{sub}</div>}
    </div>
  );
}

/** Horizontal bar showing each active property's share of portfolio value. */
function AllocationBar({
  properties,
  currency,
}: {
  properties: Property[];
  currency: string;
}) {
  const active = properties.filter((p) => p.status !== "sold" && p.currentValue > 0);
  const total = active.reduce((s, p) => s + p.currentValue, 0);
  if (active.length < 2 || total <= 0) return null;

  const palette = ["#3fe089", "#0094FF", "#ffe27a", "#ff9f7a", "#c78bff", "#7af5e0"];
  return (
    <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.13] to-white/[0.05] p-4">
      <div className="text-[0.62rem] font-bold uppercase tracking-wider2 text-white/55">
        Value allocation
      </div>
      <div className="mt-3 flex h-3.5 w-full overflow-hidden rounded-full">
        {active.map((p, i) => (
          <div
            key={p.id}
            title={`${p.name}: ${fmtMoney(p.currentValue, currency)}`}
            style={{
              width: `${(p.currentValue / total) * 100}%`,
              background: palette[i % palette.length],
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {active.map((p, i) => (
          <span key={p.id} className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-white/70">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: palette[i % palette.length] }}
            />
            {p.name} · {((p.currentValue / total) * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioApp() {
  const [data, setData] = useState<PortfolioData>(emptyPortfolio);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | undefined>();
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // hydrate from localStorage on the client only
  useEffect(() => {
    setData(loadPortfolio());
    setLoaded(true);
  }, []);

  // persist every change after the initial load
  useEffect(() => {
    if (loaded) savePortfolio(data);
  }, [data, loaded]);

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  const stats = useMemo(() => portfolioStats(data.properties), [data.properties]);

  const visible = useMemo(() => {
    const list =
      filter === "all"
        ? data.properties
        : data.properties.filter((p) => p.status === filter);
    // active first, then by value descending
    return [...list].sort((a, b) => {
      const soldA = a.status === "sold" ? 1 : 0;
      const soldB = b.status === "sold" ? 1 : 0;
      if (soldA !== soldB) return soldA - soldB;
      return b.currentValue - a.currentValue;
    });
  }, [data.properties, filter]);

  const saveProperty = (p: Property) => {
    setData((d) => {
      const exists = d.properties.some((x) => x.id === p.id);
      return {
        ...d,
        properties: exists
          ? d.properties.map((x) => (x.id === p.id ? p : x))
          : [...d.properties, p],
      };
    });
    setFormOpen(false);
    setEditing(undefined);
    showToast(editing ? "Property updated" : "Property added");
  };

  const deleteProperty = (p: Property) => {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    setData((d) => ({ ...d, properties: d.properties.filter((x) => x.id !== p.id) }));
    showToast("Property deleted");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "real-estate-portfolio.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = normalizePortfolio(JSON.parse(String(reader.result)));
        if (parsed.properties.length === 0) {
          showToast("No properties found in that file");
          return;
        }
        if (
          data.properties.length > 0 &&
          !window.confirm(
            `Replace your current ${data.properties.length} propert${
              data.properties.length === 1 ? "y" : "ies"
            } with the ${parsed.properties.length} from this backup?`
          )
        ) {
          return;
        }
        setData(parsed);
        showToast(`Imported ${parsed.properties.length} properties`);
      } catch {
        showToast("Could not read that file");
      }
    };
    reader.readAsText(file);
  };

  const currency = data.currency;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-8">
      {/* header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wider2 text-white/55">
            Personal Dashboard
          </p>
          <h1 className="mt-1 font-display text-2xl uppercase tracking-tight sm:text-3xl">
            Real Estate Portfolio
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => setData((d) => ({ ...d, currency: e.target.value }))}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider2 outline-none focus:border-white/70"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} className="text-ink">
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="rounded-lg bg-green px-4 py-2 text-xs font-extrabold uppercase tracking-wider2 shadow-[0_4px_0_#14693C] transition-colors hover:bg-[#179150] active:translate-y-[2px] active:shadow-[0_2px_0_#14693C]"
          >
            + Add Property
          </button>
        </div>
      </header>

      {/* stats */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Portfolio value"
          value={fmtMoneyCompact(stats.totalValue, currency)}
          sub={`${stats.activeCount} active propert${stats.activeCount === 1 ? "y" : "ies"}`}
        />
        <StatTile
          label="Total equity"
          value={fmtMoneyCompact(stats.totalEquity, currency)}
          sub={`Debt ${fmtMoneyCompact(stats.totalDebt, currency)}`}
        />
        <StatTile
          label="Cash flow / month"
          value={fmtMoneyCompact(stats.monthlyCashFlow, currency)}
          sub={`${fmtMoneyCompact(stats.annualCashFlow, currency)} / year`}
          tone={stats.monthlyCashFlow > 0 ? "up" : stats.monthlyCashFlow < 0 ? "down" : undefined}
        />
        <StatTile
          label="Appreciation"
          value={fmtPct(stats.appreciationPct)}
          sub={`${fmtMoneyCompact(stats.appreciation, currency)} vs invested`}
          tone={stats.appreciation >= 0 ? "up" : "down"}
        />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Gross yield"
          value={`${stats.avgYield.toFixed(1)}%`}
          sub="Annual rent / value"
        />
        <StatTile
          label="Rent / month"
          value={fmtMoneyCompact(stats.monthlyRent, currency)}
          sub={`Expenses ${fmtMoneyCompact(stats.monthlyExpenses, currency)}`}
        />
        <StatTile
          label="Occupancy"
          value={
            stats.rentableCount > 0
              ? `${stats.occupiedCount}/${stats.rentableCount}`
              : "—"
          }
          sub="Rentals occupied"
        />
        <StatTile
          label="Realized gains"
          value={
            stats.soldCount > 0 ? fmtMoneyCompact(stats.realizedGains, currency) : "—"
          }
          sub={`${stats.soldCount} sold`}
          tone={
            stats.soldCount === 0
              ? undefined
              : stats.realizedGains >= 0
                ? "up"
                : "down"
          }
        />
      </section>

      {/* allocation */}
      <section className="mt-3">
        <AllocationBar properties={data.properties} currency={currency} />
      </section>

      {/* filter + tools */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-wider2 transition-colors ${
                filter === f.value
                  ? "border-white bg-white text-royal"
                  : "border-white/30 text-white/70 hover:border-white/60 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            onClick={exportJson}
            className="text-[0.68rem] font-bold uppercase tracking-wider2 text-white/60 hover:text-white hover:underline underline-offset-4"
          >
            Export backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[0.68rem] font-bold uppercase tracking-wider2 text-white/60 hover:text-white hover:underline underline-offset-4"
          >
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* property list */}
      <section className="mt-4 flex flex-col gap-4">
        {!loaded ? null : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/30 p-12 text-center">
            <p className="font-display text-lg uppercase">
              {data.properties.length === 0 ? "No properties yet" : "Nothing here"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-white/60">
              {data.properties.length === 0
                ? "Add your first property to start tracking value, equity, rent and cash flow."
                : "No properties match this filter."}
            </p>
            {data.properties.length === 0 && (
              <button
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
                className="mt-6 rounded-lg bg-green px-5 py-3 text-sm font-extrabold uppercase tracking-wider2 shadow-[0_4px_0_#14693C] transition-colors hover:bg-[#179150]"
              >
                + Add your first property
              </button>
            )}
          </div>
        ) : (
          visible.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              currency={currency}
              onEdit={() => {
                setEditing(p);
                setFormOpen(true);
              }}
              onDelete={() => deleteProperty(p)}
            />
          ))
        )}
      </section>

      <p className="mt-10 text-center text-[0.68rem] font-semibold text-white/40">
        Data is stored privately in this browser only. Use “Export backup” to
        save a copy or move it to another device.
      </p>

      {formOpen && (
        <PropertyForm
          initial={editing}
          currency={currency}
          onSave={saveProperty}
          onCancel={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      {/* toast */}
      <div
        className={`fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-ink shadow-xl transition-all duration-200 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
