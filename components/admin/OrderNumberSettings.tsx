"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_ORDER_PATTERN,
  ORDER_TOKENS,
  renderOrderNumber,
  validateOrderPattern,
} from "@/lib/order-number";

export default function OrderNumberSettings({
  initialPattern,
  previewSeq,
}: {
  initialPattern: string;
  previewSeq: number;
}) {
  const [pattern, setPattern] = useState(initialPattern);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const check = useMemo(() => validateOrderPattern(pattern), [pattern]);
  const preview = useMemo(
    () => (check.ok ? renderOrderNumber(pattern, previewSeq, new Date()) : null),
    [check.ok, pattern, previewSeq],
  );

  async function save() {
    setError("");
    setSaved(false);
    const v = validateOrderPattern(pattern);
    if (!v.ok) {
      setError(v.error ?? "Invalid pattern.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pattern }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setPattern(data.pattern);
      setSaved(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Could not save. Try again.");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl tracking-tightest">Order number format</h1>
      <p className="mt-2 text-sm text-white/60">
        New orders are numbered using this template. Use the tokens below; any other
        characters are kept exactly as typed.
      </p>

      <label className="mt-6 block">
        <span className="field-label">Pattern</span>
        <input
          className="field-input field-input-mono text-lg"
          value={pattern}
          onChange={(e) => {
            setPattern(e.target.value);
            setSaved(false);
          }}
          spellCheck={false}
          autoCapitalize="characters"
          placeholder={DEFAULT_ORDER_PATTERN}
        />
      </label>

      <div className="mt-4 border border-white/10 bg-white/5 p-4">
        <span className="field-label">Next order will look like</span>
        <div className="mt-1 font-mono text-xl tracking-wide">
          {preview ?? <span className="text-red-300">—</span>}
        </div>
      </div>

      {!check.ok && <p className="mt-3 text-[0.8rem] font-semibold text-red-300">{check.error}</p>}
      {error && <p className="mt-3 text-[0.8rem] font-semibold text-red-300">{error}</p>}
      {saved && <p className="mt-3 text-[0.8rem] font-semibold text-green-300">Saved. New orders will use this format.</p>}

      <div className="mt-5 flex gap-3">
        <button
          onClick={save}
          disabled={busy || !check.ok}
          className="bg-green hover:bg-green/90 disabled:opacity-60 text-white font-bold uppercase tracking-wider2 text-sm py-3 px-6 transition-colors"
        >
          {busy ? "Saving…" : "Save format"}
        </button>
        <button
          onClick={() => {
            setPattern(DEFAULT_ORDER_PATTERN);
            setSaved(false);
            setError("");
          }}
          className="border border-white/20 hover:border-white/40 text-white font-bold uppercase tracking-wider2 text-sm py-3 px-6 transition-colors"
        >
          Reset to default
        </button>
      </div>

      <div className="mt-8">
        <span className="field-label">Available tokens</span>
        <ul className="mt-2 space-y-1.5">
          {ORDER_TOKENS.map((t) => (
            <li key={t.token} className="flex gap-3 text-sm">
              <code className="shrink-0 font-mono text-white/90 w-24">{t.token}</code>
              <span className="text-white/55">{t.meaning}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-white/45">
          The {"{SEQ}"} token is required so each order number stays unique. The running
          number resets at the start of each year.
        </p>
      </div>
    </div>
  );
}
