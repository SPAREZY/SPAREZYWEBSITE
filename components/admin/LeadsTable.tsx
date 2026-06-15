"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  parseParts,
  timeAgo,
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_DOT,
  PRIORITY_CLASS,
  type Status,
  type Priority,
} from "@/lib/utils";
import type { Lead } from "./types";
import LeadDrawer from "./LeadDrawer";

const STATUSES: Status[] = ["RECEIVED", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED", "DECLINED"];
const PRIORITIES: Priority[] = ["URGENT", "HIGH", "NORMAL", "LOW"];

type SortKey = "createdAt" | "customerName" | "status" | "priority";

export default function LeadsTable({
  initialRequests,
  focusId,
}: {
  initialRequests: Lead[];
  focusId?: string;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialRequests);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status) p.set("status", status);
    if (priority) p.set("priority", priority);
    p.set("sort", sort);
    p.set("dir", dir);
    p.set("take", "500");
    return p.toString();
  }, [q, status, priority, sort, dir]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests?${query}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { requests: Lead[] };
        setLeads(data.requests);
        setSelected((cur) => (cur ? data.requests.find((l) => l.id === cur.id) ?? cur : null));
      }
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchLeads, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [fetchLeads]);

  // Open a specific lead when arriving from the dashboard's "Open" link.
  useEffect(() => {
    if (!focusId) return;
    const inList = initialRequests.find((l) => l.id === focusId);
    if (inList) {
      setSelected(inList);
      return;
    }
    fetch(`/api/admin/requests/${focusId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.request && setSelected(d.request))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  async function onStatusChange(id: string, next: Status) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)));
    setSelected((cur) => (cur && cur.id === id ? { ...cur, status: next } : cur));
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    fetchLeads();
  }

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir("desc");
    }
  }

  const hasFilters = q.trim() || status || priority;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tightest sm:text-3xl">Leads</h1>
          <p className="mt-1 text-[0.8rem] text-white/50">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
            {hasFilters ? " · filtered" : ""}
            {loading ? " · refreshing…" : ""}
          </p>
        </div>
        <a
          href={`/api/admin/export?${query}`}
          className="rounded-sm border border-white/20 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-wider2 text-white/80 hover:bg-white/10"
        >
          ⭳ Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search — order #, part, VIN, name, phone, car…"
          className="min-w-[240px] flex-1 border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-white/40"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-white/15 bg-royal-deep px-3 py-2.5 text-[0.78rem] font-bold uppercase tracking-wider2 outline-none focus:border-white/40"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border border-white/15 bg-royal-deep px-3 py-2.5 text-[0.78rem] font-bold uppercase tracking-wider2 outline-none focus:border-white/40"
        >
          <option value="">All priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setQ("");
              setStatus("");
              setPriority("");
            }}
            className="border border-white/15 px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider2 text-white/60 hover:bg-white/10"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto border border-white/12">
        <table className="w-full min-w-[900px] border-collapse text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-white/12 bg-white/5 text-[0.62rem] uppercase tracking-wider2 text-white/50">
              <Th onClick={() => toggleSort("createdAt")} active={sort === "createdAt"} dir={dir}>
                Order
              </Th>
              <Th onClick={() => toggleSort("customerName")} active={sort === "customerName"} dir={dir}>
                Customer
              </Th>
              <th className="px-3 py-2.5 font-bold">Car</th>
              <th className="px-3 py-2.5 font-bold">Parts</th>
              <Th onClick={() => toggleSort("priority")} active={sort === "priority"} dir={dir}>
                Priority
              </Th>
              <Th onClick={() => toggleSort("status")} active={sort === "status"} dir={dir}>
                Status
              </Th>
              <th className="px-3 py-2.5 text-right font-bold">Quote</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const parts = parseParts(l.partsJson);
              const car = [l.make, l.model, l.year].filter(Boolean).join(" ");
              const st = l.status as Status;
              const pr = (l.priority as Priority) ?? "NORMAL";
              return (
                <tr
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className="cursor-pointer border-b border-white/8 hover:bg-white/5"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-mono text-[0.72rem] text-white/70">{l.humanId}</div>
                    <div className="text-[0.62rem] text-white/40">{timeAgo(l.createdAt)}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold">{l.customerName}</div>
                    <div className="text-[0.68rem] text-white/45">{l.phone ?? l.email ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2.5 text-white/75">{car || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{l.partName}</span>
                    {parts.length > 1 && (
                      <span className="ml-1.5 text-[0.66rem] text-white/45">+{parts.length - 1}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-sm border px-1.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-wider2 ${PRIORITY_CLASS[pr]}`}
                    >
                      {pr}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`flex items-center gap-1.5 text-[0.72rem] ${STATUS_COLOR[st]}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[st]}`} />
                      {STATUS_LABEL[st] ?? l.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-white/70">
                    {l.quote ? `AED ${l.quote.price}` : "—"}
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-[0.82rem] text-white/40">
                  {loading ? "Loading…" : "No leads match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeadDrawer
        lead={selected}
        onClose={() => setSelected(null)}
        onStatusChange={onStatusChange}
        onSaved={fetchLeads}
      />
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className="px-3 py-2.5 font-bold">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 uppercase tracking-wider2 ${
          active ? "text-white" : "text-white/50 hover:text-white/80"
        }`}
      >
        {children}
        {active && <span className="text-[0.7em]">{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}
