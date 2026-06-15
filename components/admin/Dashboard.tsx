import Link from "next/link";
import type { DashboardData } from "@/lib/admin-stats";
import { STATUS_DOT, PRIORITY_CLASS, type Priority } from "@/lib/utils";

function aed(n: number): string {
  return "AED " + Math.round(n).toLocaleString("en-AE");
}

const ACTIVITY_ICON: Record<string, string> = {
  CREATED: "✦",
  STATUS: "→",
  QUOTE: "AED",
  NOTE: "✎",
  CONTACT: "☎",
  PRIORITY: "!",
  ASSIGN: "@",
};

export default function Dashboard({ data }: { data: DashboardData }) {
  const { kpis, funnel, daily, topMakes, topParts, attention, recent } = data;
  const maxDaily = Math.max(1, ...daily.map((d) => d.leads));
  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));

  const kpiCards = [
    { label: "Open leads", value: String(kpis.openLeads), accent: "text-white" },
    { label: "New today", value: String(kpis.newToday), accent: "text-sky-300" },
    { label: "Revenue · month", value: aed(kpis.revenueMonth), accent: "text-emerald-300" },
    {
      label: "Conversion",
      value: kpis.conversionPct === null ? "—" : `${kpis.conversionPct}%`,
      accent: "text-white",
    },
    {
      label: "Avg response",
      value: kpis.avgResponseMins === null ? "—" : `${kpis.avgResponseMins}m`,
      accent: "text-white",
    },
    {
      label: "Overdue",
      value: String(kpis.overdue),
      accent: kpis.overdue > 0 ? "text-red-300" : "text-white",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tightest sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-[0.8rem] text-white/50">
            Live overview of your pipeline, revenue and what needs attention.
          </p>
        </div>
        <Link
          href="/admin/pipeline"
          className="hidden rounded-sm border border-white/20 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-wider2 text-white/80 hover:bg-white/10 sm:block"
        >
          Open pipeline →
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((c) => (
          <div key={c.label} className="border border-white/15 bg-white/5 px-4 py-4">
            <div className={`font-display text-2xl tracking-tightest ${c.accent}`}>{c.value}</div>
            <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider2 text-white/55">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* 14-day trend */}
        <div className="border border-white/15 bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/55">
              Leads · last 14 days
            </h2>
            <span className="text-[0.72rem] text-white/45">
              {daily.reduce((s, d) => s + d.leads, 0)} leads · {daily.reduce((s, d) => s + d.won, 0)}{" "}
              won
            </span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            {daily.map((d) => (
              <div key={d.date} className="group flex flex-1 flex-col items-center justify-end gap-1">
                <div className="relative flex w-full flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t-sm bg-sky-400/70 transition-all group-hover:bg-sky-300"
                    style={{ height: `${(d.leads / maxDaily) * 120}px` }}
                    title={`${d.label}: ${d.leads} leads, ${d.won} won`}
                  />
                  {d.won > 0 && (
                    <div
                      className="absolute bottom-0 w-full rounded-t-sm bg-emerald-400"
                      style={{ height: `${(d.won / maxDaily) * 120}px` }}
                    />
                  )}
                </div>
                <span className="text-[0.5rem] text-white/40">{d.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-[0.62rem] text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm bg-sky-400/70" /> Leads
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400" /> Won
            </span>
          </div>
        </div>

        {/* Funnel */}
        <div className="border border-white/15 bg-white/5 p-5">
          <h2 className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/55">
            Pipeline funnel
          </h2>
          <div className="mt-4 space-y-3">
            {funnel.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between text-[0.72rem]">
                  <span className="flex items-center gap-2 text-white/75">
                    <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[f.key]}`} />
                    {f.label}
                  </span>
                  <span className="font-mono text-white/55">{f.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full ${STATUS_DOT[f.key]}`}
                    style={{ width: `${(f.count / funnelMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Needs attention */}
        <div className="border border-white/15 bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/55">
              Needs attention
            </h2>
            <span className="text-[0.72rem] text-white/45">{attention.length}</span>
          </div>
          {attention.length === 0 ? (
            <p className="mt-6 text-center text-[0.8rem] text-white/40">
              All caught up — nothing waiting. 🎉
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10">
              {attention.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.66rem] text-white/45">{a.humanId}</span>
                      <span
                        className={`rounded-sm border px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider2 ${
                          PRIORITY_CLASS[(a.priority as Priority) ?? "NORMAL"]
                        }`}
                      >
                        {a.priority}
                      </span>
                    </div>
                    <div className="truncate text-[0.85rem] font-bold">{a.partName}</div>
                    <div className="text-[0.72rem] text-white/50">{a.customerName}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-right text-[0.66rem] text-amber-300">
                      {a.ageHours}h old
                    </span>
                    <Link
                      href={`/admin/leads?focus=${a.id}`}
                      className="rounded-sm border border-white/20 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider2 text-white/80 hover:bg-white/10"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="border border-white/15 bg-white/5 p-5">
          <h2 className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/55">
            Recent activity
          </h2>
          {recent.length === 0 ? (
            <p className="mt-6 text-center text-[0.8rem] text-white/40">No activity yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="flex gap-3 text-[0.78rem]">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6rem] text-white/70">
                    {ACTIVITY_ICON[r.type] ?? "•"}
                  </span>
                  <div className="min-w-0">
                    <span className="text-white/85">{r.message}</span>
                    <div className="mt-0.5 text-[0.62rem] text-white/40">
                      {r.humanId ? `${r.humanId} · ` : ""}
                      {timeAgoShort(r.createdAt)}
                      {r.actor ? ` · ${r.actor}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top makes / parts */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <TopList title="Top makes" items={topMakes} accent="bg-sky-400/70" />
        <TopList title="Top parts requested" items={topParts} accent="bg-emerald-400/70" />
      </div>
    </div>
  );
}

function TopList({
  title,
  items,
  accent,
}: {
  title: string;
  items: { name: string; count: number }[];
  accent: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="border border-white/15 bg-white/5 p-5">
      <h2 className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/55">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-6 text-center text-[0.8rem] text-white/40">No data yet.</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {items.map((i) => (
            <div key={i.name}>
              <div className="flex items-center justify-between text-[0.78rem]">
                <span className="truncate text-white/80">{i.name}</span>
                <span className="font-mono text-white/50">{i.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${accent}`} style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgoShort(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
