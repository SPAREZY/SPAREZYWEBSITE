"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CustomerRow } from "@/lib/customers";

function aed(n: number): string {
  return "AED " + Math.round(n).toLocaleString("en-AE");
}
function dateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}

type SortKey = "lastOrderAt" | "orders" | "totalWon" | "name";

export default function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("lastOrderAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = customers;
    if (term) {
      list = list.filter((c) =>
        [c.name, c.phone ?? "", c.email ?? "", c.city ?? ""].some((f) =>
          f.toLowerCase().includes(term),
        ),
      );
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "orders") cmp = a.orders - b.orders;
      else if (sort === "totalWon") cmp = a.totalWon - b.totalWon;
      else cmp = new Date(a.lastOrderAt).getTime() - new Date(b.lastOrderAt).getTime();
      return dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [customers, q, sort, dir]);

  const repeat = customers.filter((c) => c.orders > 1).length;
  const lifetime = customers.reduce((s, c) => s + c.totalWon, 0);

  function toggle(key: SortKey) {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir("desc");
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tightest sm:text-3xl">Customers</h1>
          <p className="mt-1 text-[0.8rem] text-white/50">
            {customers.length} customers · {repeat} repeat · {aed(lifetime)} lifetime won
          </p>
        </div>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search — name, phone, email, city…"
        className="mt-5 w-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-white/40"
      />

      <div className="mt-5 overflow-x-auto border border-white/12">
        <table className="w-full min-w-[820px] border-collapse text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-white/12 bg-white/5 text-[0.62rem] uppercase tracking-wider2 text-white/50">
              <Th onClick={() => toggle("name")} active={sort === "name"} dir={dir}>
                Customer
              </Th>
              <th className="px-3 py-2.5 font-bold">City</th>
              <Th onClick={() => toggle("orders")} active={sort === "orders"} dir={dir}>
                Orders
              </Th>
              <th className="px-3 py-2.5 font-bold">Won</th>
              <Th onClick={() => toggle("totalWon")} active={sort === "totalWon"} dir={dir}>
                Spent
              </Th>
              <Th onClick={() => toggle("lastOrderAt")} active={sort === "lastOrderAt"} dir={dir}>
                Last order
              </Th>
              <th className="px-3 py-2.5 font-bold" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.key} className="border-b border-white/8 hover:bg-white/5">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 font-semibold">
                    {c.name}
                    {c.orders > 1 && (
                      <span className="rounded-sm bg-emerald-500/15 px-1.5 py-0.5 text-[0.54rem] font-bold uppercase tracking-wider2 text-emerald-300">
                        Repeat
                      </span>
                    )}
                  </div>
                  <div className="text-[0.68rem] text-white/45">{c.phone ?? c.email ?? "—"}</div>
                </td>
                <td className="px-3 py-2.5 text-white/75">{c.city ?? "—"}</td>
                <td className="px-3 py-2.5">
                  {c.orders}
                  {c.open > 0 && <span className="ml-1.5 text-[0.66rem] text-amber-300">{c.open} open</span>}
                </td>
                <td className="px-3 py-2.5 text-white/75">{c.won}</td>
                <td className="px-3 py-2.5 font-mono text-emerald-300">
                  {c.totalWon > 0 ? aed(c.totalWon) : "—"}
                </td>
                <td className="px-3 py-2.5 text-white/60">{dateShort(c.lastOrderAt)}</td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={`/admin/leads?q=${encodeURIComponent(c.phone ?? c.email ?? c.name)}`}
                    className="rounded-sm border border-white/20 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider2 text-white/80 hover:bg-white/10"
                  >
                    Orders
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-[0.82rem] text-white/40">
                  No customers match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
