"use client";

import { useState } from "react";
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  Property,
  PropertyStatus,
  PropertyType,
  newId,
} from "@/lib/portfolio";

interface Draft {
  name: string;
  address: string;
  type: PropertyType;
  status: PropertyStatus;
  purchaseDate: string;
  purchasePrice: string;
  currentValue: string;
  mortgageBalance: string;
  monthlyRent: string;
  monthlyExpenses: string;
  occupied: boolean;
  salePrice: string;
  notes: string;
}

function toDraft(p?: Property): Draft {
  return {
    name: p?.name ?? "",
    address: p?.address ?? "",
    type: p?.type ?? "apartment",
    status: p?.status ?? "owned",
    purchaseDate: p?.purchaseDate ?? "",
    purchasePrice: p ? String(p.purchasePrice || "") : "",
    currentValue: p ? String(p.currentValue || "") : "",
    mortgageBalance: p ? String(p.mortgageBalance || "") : "",
    monthlyRent: p ? String(p.monthlyRent || "") : "",
    monthlyExpenses: p ? String(p.monthlyExpenses || "") : "",
    occupied: p?.occupied ?? true,
    salePrice: p ? String(p.salePrice || "") : "",
    notes: p?.notes ?? "",
  };
}

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const inputCls =
  "w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white placeholder-white/35 outline-none transition-colors focus:border-white/70";
const labelCls =
  "mb-1.5 block text-[0.68rem] font-bold uppercase tracking-wider2 text-white/60";

export default function PropertyForm({
  initial,
  currency,
  onSave,
  onCancel,
}: {
  initial?: Property;
  currency: string;
  onSave: (p: Property) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [error, setError] = useState("");

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("Give the property a name (e.g. “Marina View 2BR”).");
      return;
    }
    onSave({
      id: initial?.id ?? newId(),
      name: draft.name.trim(),
      address: draft.address.trim(),
      type: draft.type,
      status: draft.status,
      purchaseDate: draft.purchaseDate,
      purchasePrice: num(draft.purchasePrice),
      currentValue: num(draft.currentValue),
      mortgageBalance: num(draft.mortgageBalance),
      monthlyRent: num(draft.monthlyRent),
      monthlyExpenses: num(draft.monthlyExpenses),
      occupied: draft.occupied,
      salePrice: num(draft.salePrice),
      notes: draft.notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0a1634]/70 p-4 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <form
        onSubmit={submit}
        className="my-auto w-full max-w-2xl rounded-2xl border border-white/20 bg-royal-deep p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-wide">
            {initial ? "Edit Property" : "Add Property"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold uppercase tracking-wider2 text-white/60 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Property name *</label>
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Marina View 2BR"
              autoFocus
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Address / location</label>
            <input
              className={inputCls}
              value={draft.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Dubai Marina, Tower A, Unit 1204"
            />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <select
              className={inputCls}
              value={draft.type}
              onChange={(e) => set("type", e.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="text-ink">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={draft.status}
              onChange={(e) => set("status", e.target.value as PropertyStatus)}
            >
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="text-ink">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Purchase date</label>
            <input
              type="date"
              className={inputCls}
              value={draft.purchaseDate}
              onChange={(e) => set("purchaseDate", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Purchase price ({currency})</label>
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={draft.purchasePrice}
              onChange={(e) => set("purchasePrice", e.target.value)}
              placeholder="1200000"
            />
          </div>

          <div>
            <label className={labelCls}>Current value ({currency})</label>
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={draft.currentValue}
              onChange={(e) => set("currentValue", e.target.value)}
              placeholder="1450000"
            />
          </div>

          <div>
            <label className={labelCls}>Mortgage balance ({currency})</label>
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={draft.mortgageBalance}
              onChange={(e) => set("mortgageBalance", e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label className={labelCls}>Monthly rent ({currency})</label>
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={draft.monthlyRent}
              onChange={(e) => set("monthlyRent", e.target.value)}
              placeholder="8500"
            />
          </div>

          <div>
            <label className={labelCls}>
              Monthly expenses ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              className={inputCls}
              value={draft.monthlyExpenses}
              onChange={(e) => set("monthlyExpenses", e.target.value)}
              placeholder="Service charges, mortgage payment…"
            />
          </div>

          {draft.status === "sold" ? (
            <div>
              <label className={labelCls}>Sale price ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                className={inputCls}
                value={draft.salePrice}
                onChange={(e) => set("salePrice", e.target.value)}
                placeholder="1600000"
              />
            </div>
          ) : (
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={draft.occupied}
                  onChange={(e) => set("occupied", e.target.checked)}
                  className="h-4 w-4 accent-green"
                />
                Currently rented / occupied
              </label>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={labelCls}>Notes</label>
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Tenant contract ends Sep 2026, agent: …"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-semibold text-[#ffb3b0]">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-green px-5 py-3 text-sm font-extrabold uppercase tracking-wider2 shadow-[0_4px_0_#14693C] transition-colors hover:bg-[#179150] active:translate-y-[2px] active:shadow-[0_2px_0_#14693C]"
          >
            {initial ? "Save changes" : "Add property"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/40 px-5 py-3 text-sm font-bold uppercase tracking-wider2 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
