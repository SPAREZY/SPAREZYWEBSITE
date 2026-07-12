"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Manual order entry — the agent logs an order after closing it on WhatsApp.
// Reuses the same creation endpoint the storefront checkout used, so the
// order gets a real SPZ id, shows in Leads/Pipeline, and the customer can
// track it on the website's Orders page with their phone number.

type PartRow = { name: string; qty: string };

const inputBase =
  "rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none";
const input = `w-full ${inputBase}`;
const label = "mb-1 block text-[0.62rem] font-bold uppercase tracking-wider2 text-white/55";

export default function NewOrderForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [note, setNote] = useState("");
  const [parts, setParts] = useState<PartRow[]>([{ name: "", qty: "1" }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setPart(i: number, patch: Partial<PartRow>) {
    setParts((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const cleanParts = parts
      .map((p) => ({ name: p.name.trim(), qty: Math.max(1, Number(p.qty) || 1), condition: "any" }))
      .filter((p) => p.name.length >= 2);
    if (!name.trim() || name.trim().length < 2) return setErr("Customer name is required.");
    if (!phone.trim()) return setErr("Phone number is required (it's how the customer tracks the order).");
    if (cleanParts.length === 0) return setErr("Add at least one part.");

    setBusy(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "admin",
          customerName: name.trim(),
          phone: phone.trim(),
          contactPref: "whatsapp",
          vin: vin.trim() || undefined,
          make: make.trim() || undefined,
          model: model.trim() || undefined,
          year: year.trim() ? Number(year) : undefined,
          partsJson: cleanParts,
          customerNote: note.trim() || undefined,
          partPreference: "any",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setErr(body?.error || "Could not create the order.");
        setBusy(false);
        return;
      }
      router.push(`/admin/leads?focus=${body.id}`);
    } catch {
      setErr("Network error — try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-[640px] px-5 py-8">
      <h1 className="font-display text-2xl tracking-tightest">NEW ORDER</h1>
      <p className="mt-1 text-[0.8rem] text-white/50">
        Log an order taken on WhatsApp. It gets an SPZ number and appears in Leads &amp; Pipeline
        so you can track its status and see it in the dashboard stats.
      </p>

      <div className="mt-6 space-y-4 border border-white/15 bg-white/5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Customer name *</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Al Mansoori" />
          </div>
          <div>
            <label className={label}>WhatsApp phone *</label>
            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+9715…" inputMode="tel" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Car make</label>
            <input className={input} value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
          </div>
          <div>
            <label className={label}>Model</label>
            <input className={input} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Land Cruiser Prado" />
          </div>
          <div>
            <label className={label}>Year</label>
            <input className={input} value={year} onChange={(e) => setYear(e.target.value)} placeholder="2019" inputMode="numeric" />
          </div>
        </div>

        <div>
          <label className={label}>VIN / chassis (optional)</label>
          <input className={input} value={vin} onChange={(e) => setVin(e.target.value)} placeholder="JTEBU3FJ8EK…" />
        </div>

        <div>
          <label className={label}>Parts *</label>
          <div className="space-y-2">
            {parts.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={input}
                  value={p.name}
                  onChange={(e) => setPart(i, { name: e.target.value })}
                  placeholder={i === 0 ? "Front brake pads" : "Another part…"}
                />
                <input
                  className={`${inputBase} w-20 shrink-0 text-center`}
                  value={p.qty}
                  onChange={(e) => setPart(i, { qty: e.target.value })}
                  inputMode="numeric"
                  aria-label="Quantity"
                />
                {parts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setParts((prev) => prev.filter((_, idx) => idx !== i))}
                    className="shrink-0 rounded-sm border border-white/15 px-3 text-white/60 hover:bg-white/10"
                    aria-label="Remove part"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setParts((prev) => [...prev, { name: "", qty: "1" }])}
            className="mt-2 text-[0.72rem] font-bold uppercase tracking-wider2 text-white/60 hover:text-white"
          >
            + Add part
          </button>
        </div>

        <div>
          <label className={label}>Internal note (optional)</label>
          <textarea
            className={`${input} min-h-[70px]`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Quoted AED 350, sourcing from Mussafah…"
          />
        </div>

        {err && <p className="text-sm font-bold text-red-300">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-sm bg-emerald-500 px-4 py-3 text-sm font-bold uppercase tracking-wider2 text-white hover:bg-emerald-400 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create order"}
        </button>
      </div>
    </form>
  );
}
