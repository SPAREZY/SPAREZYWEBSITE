"use client";

import { useState } from "react";
import type { Lead } from "./types";

const CONDITIONS = ["genuine", "oem", "aftermarket"];

export default function QuoteForm({ lead, onSaved }: { lead: Lead; onSaved: () => void }) {
  const [price, setPrice] = useState(lead.quote ? String(lead.quote.price) : "");
  const [condition, setCondition] = useState(lead.quote?.condition ?? "genuine");
  const [warranty, setWarranty] = useState(lead.quote?.warranty ?? "");
  const [eta, setEta] = useState(lead.quote?.eta ?? "");
  const [note, setNote] = useState(lead.quote?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    if (!price || Number.isNaN(Number(price))) {
      setError("Enter a valid price.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/requests/${lead.id}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: Number(price), condition, warranty, eta, note }),
    });
    setBusy(false);
    if (res.ok) onSaved();
    else setError("Could not save the quote. Try again.");
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">Price (AED)</span>
          <input
            className="field-input field-input-mono"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="block">
          <span className="field-label">Condition</span>
          <select
            className="field-input"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c} className="text-ink">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Warranty</span>
          <input
            className="field-input"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            placeholder="e.g. 3 months"
          />
        </label>
        <label className="block">
          <span className="field-label">ETA</span>
          <input
            className="field-input"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            placeholder="e.g. 2-3 days"
          />
        </label>
      </div>
      <label className="block mt-4">
        <span className="field-label">Note</span>
        <input
          className="field-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional message to the customer"
        />
      </label>

      {error && <p className="mt-3 text-[0.8rem] font-semibold text-red-300">{error}</p>}

      <button
        onClick={save}
        disabled={busy}
        className="mt-4 w-full bg-green hover:bg-green/90 disabled:opacity-60 text-white font-bold uppercase tracking-wider2 text-sm py-3 transition-colors"
      >
        {busy ? "Saving…" : "Save quote → Quoted"}
      </button>
    </div>
  );
}
