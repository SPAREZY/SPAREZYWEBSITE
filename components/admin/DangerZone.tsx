"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DangerZone() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const ready = confirm === "DELETE";

  async function reset() {
    if (!ready) return;
    if (!window.confirm("Delete ALL orders permanently? This cannot be undone.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/reset-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Deleted ${data.deleted} order${data.deleted === 1 ? "" : "s"}. Pipeline is clear.`);
        setConfirm("");
        router.refresh();
      } else {
        setMsg(data?.error || "Could not reset orders.");
      }
    } catch {
      setMsg("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border border-red-500/40 bg-red-500/5 p-6">
      <h2 className="text-[0.8rem] font-bold uppercase tracking-wider2 text-red-300">Danger zone</h2>
      <p className="mt-2 max-w-xl text-[0.85rem] text-white/70">
        Permanently delete <strong>every</strong> order, quote and activity record — across the admin
        and the customer site. Use this to start fresh. This cannot be undone.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder='Type DELETE to confirm'
          className="w-48 border border-white/20 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/35 focus:border-white/40"
        />
        <button
          onClick={reset}
          disabled={!ready || busy}
          className="bg-red-500/90 px-5 py-2.5 text-[0.74rem] font-bold uppercase tracking-wider2 text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Deleting…" : "Delete all orders"}
        </button>
      </div>
      {msg && <p className="mt-3 text-[0.82rem] font-semibold text-white/85">{msg}</p>}
    </div>
  );
}
