import { prisma } from "@/lib/prisma";
import { parseParts, isOpenStatus, type Status } from "@/lib/utils";

export type DashboardData = {
  kpis: {
    openLeads: number;
    newToday: number;
    new7d: number;
    revenueMonth: number;
    wonMonth: number;
    conversionPct: number | null;
    avgResponseMins: number | null;
    overdue: number;
  };
  funnel: { key: Status; label: string; count: number }[];
  daily: { date: string; label: string; leads: number; won: number }[];
  topMakes: { name: string; count: number }[];
  topParts: { name: string; count: number }[];
  attention: AttentionLead[];
  recent: RecentActivity[];
};

export type AttentionLead = {
  id: string;
  humanId: string;
  partName: string;
  customerName: string;
  phone: string | null;
  status: string;
  priority: string;
  receivedAt: string;
  ageHours: number;
};

export type RecentActivity = {
  id: string;
  type: string;
  message: string;
  actor: string | null;
  createdAt: string;
  humanId: string | null;
};

const FUNNEL: { key: Status; label: string }[] = [
  { key: "RECEIVED", label: "New" },
  { key: "SOURCING", label: "Sourcing" },
  { key: "QUOTED", label: "Quoted" },
  { key: "CONFIRMED", label: "Won" },
  { key: "COMPLETED", label: "Delivered" },
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const startYear = new Date(now.getFullYear(), 0, 1);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today0 = startOfDay(now);
  const week0 = new Date(today0.getTime() - 6 * 86400000);

  const rows = await prisma.partRequest.findMany({
    where: { createdAt: { gte: startYear } },
    include: { quote: true },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  // KPIs
  const openLeads = rows.filter((r) => isOpenStatus(r.status)).length;
  const newToday = rows.filter((r) => new Date(r.createdAt) >= today0).length;
  const new7d = rows.filter((r) => new Date(r.createdAt) >= week0).length;

  const wonRows = rows.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED");
  const wonMonthRows = wonRows.filter((r) => {
    const at = r.confirmedAt ?? r.completedAt ?? r.updatedAt;
    return at && new Date(at) >= startMonth;
  });
  const revenueMonth = wonMonthRows.reduce((s, r) => s + (r.quote?.price ?? 0), 0);

  const everQuoted = rows.filter((r) => r.quotedAt);
  const wonFromQuoted = everQuoted.filter(
    (r) => r.status === "CONFIRMED" || r.status === "COMPLETED",
  ).length;
  const conversionPct =
    everQuoted.length > 0 ? Math.round((wonFromQuoted / everQuoted.length) * 100) : null;

  const respRows = everQuoted.filter((r) => new Date(r.quotedAt!) >= week0);
  const avgResponseMins =
    respRows.length > 0
      ? Math.round(
          respRows.reduce((s, r) => {
            const mins =
              (new Date(r.quotedAt!).getTime() - new Date(r.receivedAt).getTime()) / 60000;
            return s + Math.max(0, mins);
          }, 0) / respRows.length,
        )
      : null;

  const overdue = rows.filter(
    (r) =>
      (r.status === "RECEIVED" || r.status === "SOURCING") &&
      (now.getTime() - new Date(r.receivedAt).getTime()) / 3_600_000 >= 24,
  ).length;

  // Funnel
  const funnel = FUNNEL.map((f) => ({
    ...f,
    count: rows.filter((r) => r.status === f.key).length,
  }));

  // Daily series (last 14 days)
  const daily: DashboardData["daily"] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today0.getTime() - i * 86400000);
    const next = new Date(day.getTime() + 86400000);
    const leads = rows.filter((r) => {
      const c = new Date(r.createdAt);
      return c >= day && c < next;
    }).length;
    const won = wonRows.filter((r) => {
      const at = r.confirmedAt ?? r.completedAt;
      if (!at) return false;
      const d = new Date(at);
      return d >= day && d < next;
    }).length;
    daily.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString("en-AE", { day: "numeric", month: "short" }),
      leads,
      won,
    });
  }

  // Top makes
  const makeCounts = new Map<string, number>();
  for (const r of rows) {
    const m = (r.make ?? "").trim();
    if (!m) continue;
    makeCounts.set(m, (makeCounts.get(m) ?? 0) + 1);
  }
  const topMakes = [...makeCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Top parts
  const partCounts = new Map<string, number>();
  for (const r of rows) {
    for (const p of parseParts(r.partsJson)) {
      const name = (p.name ?? "").trim();
      if (!name) continue;
      const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      partCounts.set(key, (partCounts.get(key) ?? 0) + (p.qty || 1));
    }
  }
  const topParts = [...partCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Attention list — open + overdue, oldest first
  const attention: AttentionLead[] = rows
    .filter(
      (r) =>
        (r.status === "RECEIVED" || r.status === "SOURCING") &&
        (now.getTime() - new Date(r.receivedAt).getTime()) / 3_600_000 >= 6,
    )
    .sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime())
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      humanId: r.humanId,
      partName: r.partName,
      customerName: r.customerName,
      phone: r.phone,
      status: r.status,
      priority: r.priority,
      receivedAt: new Date(r.receivedAt).toISOString(),
      ageHours: Math.floor((now.getTime() - new Date(r.receivedAt).getTime()) / 3_600_000),
    }));

  // Recent activity (graceful if the table isn't migrated yet)
  let recent: RecentActivity[] = [];
  try {
    const acts = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 14,
      include: { request: { select: { humanId: true } } },
    });
    recent = acts.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      actor: a.actor,
      createdAt: new Date(a.createdAt).toISOString(),
      humanId: a.request?.humanId ?? null,
    }));
  } catch {
    recent = [];
  }

  return {
    kpis: {
      openLeads,
      newToday,
      new7d,
      revenueMonth,
      wonMonth: wonMonthRows.length,
      conversionPct,
      avgResponseMins,
      overdue,
    },
    funnel,
    daily,
    topMakes,
    topParts,
    attention,
    recent,
  };
}
