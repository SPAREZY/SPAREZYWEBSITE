import { prisma } from "@/lib/prisma";
import { normalizeWhatsappPhone, isOpenStatus } from "@/lib/utils";

export type CustomerRow = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  orders: number;
  open: number;
  won: number;
  totalWon: number;
  lastOrderAt: string;
  firstOrderAt: string;
};

// Roll the raw leads up into one row per customer (matched on phone, falling
// back to email), with lifetime stats — the CRM view.
export async function getCustomers(): Promise<CustomerRow[]> {
  const rows = await prisma.partRequest.findMany({
    include: { quote: true },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const map = new Map<string, CustomerRow & { _ts: number; _first: number }>();

  for (const r of rows) {
    const key = r.phone
      ? normalizeWhatsappPhone(r.phone)
      : (r.email ?? "").trim().toLowerCase() || r.id;
    const created = new Date(r.createdAt).getTime();
    const won = r.status === "CONFIRMED" || r.status === "COMPLETED";
    const wonValue = won ? r.quote?.price ?? 0 : 0;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        name: r.customerName,
        phone: r.phone,
        email: r.email,
        city: r.city,
        orders: 1,
        open: isOpenStatus(r.status) ? 1 : 0,
        won: won ? 1 : 0,
        totalWon: wonValue,
        lastOrderAt: new Date(r.createdAt).toISOString(),
        firstOrderAt: new Date(r.createdAt).toISOString(),
        _ts: created,
        _first: created,
      });
    } else {
      existing.orders += 1;
      existing.open += isOpenStatus(r.status) ? 1 : 0;
      existing.won += won ? 1 : 0;
      existing.totalWon += wonValue;
      if (created > existing._ts) {
        existing._ts = created;
        existing.lastOrderAt = new Date(r.createdAt).toISOString();
        existing.name = r.customerName; // most recent name wins
        existing.city = r.city ?? existing.city;
      }
      if (created < existing._first) {
        existing._first = created;
        existing.firstOrderAt = new Date(r.createdAt).toISOString();
      }
      existing.phone = existing.phone ?? r.phone;
      existing.email = existing.email ?? r.email;
    }
  }

  return [...map.values()]
    .sort((a, b) => b._ts - a._ts)
    .map(({ _ts, _first, ...rest }) => {
      void _ts;
      void _first;
      return rest;
    });
}
