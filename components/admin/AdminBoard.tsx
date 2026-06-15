"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOARD_COLUMNS, type Status } from "@/lib/utils";
import type { Lead } from "./types";
import StatsStrip from "./StatsStrip";
import LeadCard from "./LeadCard";
import LeadDrawer from "./LeadDrawer";

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.42);
    setTimeout(() => ctx.close(), 600);
  } catch {
    /* audio not available — ignore */
  }
}

export default function AdminBoard({ initialRequests }: { initialRequests: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialRequests);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const knownIds = useRef<Set<string>>(new Set(initialRequests.map((l) => l.id)));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refresh(announce = true) {
    const res = await fetch(`/api/admin/requests?q=`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { requests: Lead[] };
    const next = data.requests;

    const fresh = next.filter((l) => !knownIds.current.has(l.id));
    if (announce && fresh.length > 0) {
      setToast(`New lead — ${fresh[0].partName}`);
      playChime();
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    }
    next.forEach((l) => knownIds.current.add(l.id));

    setLeads(next);
    setSelected((cur) => (cur ? next.find((l) => l.id === cur.id) ?? null : null));
  }

  useEffect(() => {
    const id = setInterval(() => refresh(true), 15000);
    return () => {
      clearInterval(id);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onStatusChange(id: string, status: Status) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setSelected((cur) => (cur && cur.id === id ? { ...cur, status } : cur));
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh(false);
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((l) =>
      [l.humanId, l.partName, l.vin, l.customerName, l.phone ?? ""].some((f) =>
        f.toLowerCase().includes(term),
      ),
    );
  }, [leads, q]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tightest sm:text-3xl">Pipeline</h1>
          <p className="mt-1 text-[0.8rem] text-white/50">
            Drag leads through the funnel — live, auto-refreshing every 15s.
          </p>
        </div>
      </div>

      <StatsStrip leads={leads} />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search — order #, part, VIN, name, phone"
        className="mt-5 w-full bg-white/5 border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 placeholder:text-white/40"
      />

      <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
        {BOARD_COLUMNS.map((col) => {
          const items = filtered.filter((l) => col.statuses.includes(l.status as Status));
          return (
            <div key={col.key} className="w-[260px] shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[0.78rem] font-bold uppercase tracking-wider2">{col.label}</h2>
                <span className="font-mono text-[0.72rem] text-white/45">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((l) => (
                  <LeadCard key={l.id} lead={l} onOpen={setSelected} onStatusChange={onStatusChange} />
                ))}
                {items.length === 0 && (
                  <div className="border border-dashed border-white/12 py-8 text-center text-[0.72rem] text-white/35">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadDrawer
        lead={selected}
        onClose={() => setSelected(null)}
        onStatusChange={onStatusChange}
        onSaved={() => refresh(false)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] bg-white px-5 py-3 text-sm font-bold text-ink shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
