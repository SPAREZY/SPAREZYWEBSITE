"use client";

import {
  PROPERTY_TYPES,
  Property,
  appreciationAmount,
  appreciationPct,
  equity,
  fmtMoney,
  fmtPct,
  grossYield,
  monthlyCashFlow,
} from "@/lib/portfolio";

const STATUS_STYLES: Record<Property["status"], { label: string; cls: string }> = {
  owned: { label: "Owned", cls: "border-[#8ef0b6] text-[#8ef0b6]" },
  "under-offer": { label: "Under Offer", cls: "border-[#ffe27a] text-[#ffe27a]" },
  sold: { label: "Sold", cls: "border-white/45 text-white/60" },
};

function Metric({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const toneCls =
    tone === "up" ? "text-[#8ef0b6]" : tone === "down" ? "text-[#ffb3b0]" : "text-white";
  return (
    <div>
      <div className="text-[0.62rem] font-bold uppercase tracking-wider2 text-white/50">
        {label}
      </div>
      <div className={`mt-0.5 font-mono text-sm font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

export default function PropertyCard({
  property: p,
  currency,
  onEdit,
  onDelete,
}: {
  property: Property;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_STYLES[p.status];
  const typeLabel = PROPERTY_TYPES.find((t) => t.value === p.type)?.label ?? "Other";
  const cash = monthlyCashFlow(p);
  const app = appreciationAmount(p);
  const sold = p.status === "sold";

  return (
    <article className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.13] to-white/[0.05] p-5 transition-shadow hover:shadow-[0_10px_28px_rgba(8,18,45,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold uppercase tracking-tight">
            {p.name}
          </h3>
          <p className="mt-0.5 truncate text-xs font-semibold text-white/55">
            {typeLabel}
            {p.address ? ` · ${p.address}` : ""}
            {p.purchaseDate ? ` · Bought ${p.purchaseDate}` : ""}
          </p>
        </div>
        <span
          className={`flex-none rounded-full border-[1.5px] px-2.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wider2 ${status.cls}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {sold ? (
          <>
            <Metric label="Purchase" value={fmtMoney(p.purchasePrice, currency)} />
            <Metric label="Sale price" value={fmtMoney(p.salePrice, currency)} />
            <Metric
              label="Realized gain"
              value={fmtMoney(app, currency)}
              tone={app >= 0 ? "up" : "down"}
            />
            <Metric
              label="Return"
              value={fmtPct(appreciationPct(p))}
              tone={app >= 0 ? "up" : "down"}
            />
          </>
        ) : (
          <>
            <Metric label="Value" value={fmtMoney(p.currentValue, currency)} />
            <Metric label="Equity" value={fmtMoney(equity(p), currency)} />
            <Metric
              label="Cash flow / mo"
              value={fmtMoney(cash, currency)}
              tone={cash > 0 ? "up" : cash < 0 ? "down" : undefined}
            />
            <Metric
              label="Yield / Growth"
              value={`${grossYield(p).toFixed(1)}% · ${fmtPct(appreciationPct(p))}`}
              tone={app >= 0 ? "up" : "down"}
            />
          </>
        )}
      </div>

      {!sold && p.monthlyRent > 0 && (
        <p className="mt-3 text-xs font-semibold text-white/55">
          Rent {fmtMoney(p.monthlyRent, currency)}/mo · Expenses{" "}
          {fmtMoney(p.monthlyExpenses, currency)}/mo ·{" "}
          {p.occupied ? (
            <span className="text-[#8ef0b6]">Occupied</span>
          ) : (
            <span className="text-[#ffd9a0]">Vacant</span>
          )}
        </p>
      )}

      {p.notes && (
        <p className="mt-3 border-t border-white/15 pt-3 text-xs font-medium leading-relaxed text-white/65">
          {p.notes}
        </p>
      )}

      <div className="mt-4 flex gap-5 border-t border-white/15 pt-3">
        <button
          onClick={onEdit}
          className="text-xs font-bold uppercase tracking-wider2 text-white/70 hover:text-white hover:underline underline-offset-4"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs font-bold uppercase tracking-wider2 text-[#ffb3b0]/80 hover:text-[#ffb3b0] hover:underline underline-offset-4"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
