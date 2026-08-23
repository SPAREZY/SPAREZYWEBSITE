import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { parseParts } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Customer-friendly status wording (the admin labels are sales-funnel terms).
const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Received",
  SOURCING: "Finding your parts",
  QUOTED: "Quote ready",
  CONFIRMED: "Confirmed",
  COMPLETED: "Delivered",
  DECLINED: "Closed",
};

// Public order tracking. Lookup by phone number and/or a list of order
// numbers (the ones saved on the customer's own device). Returns only
// non-sensitive fields — no name, email, address or full phone — so that
// guessing order numbers can't leak personal data.
export async function GET(req: Request) {
  const prisma = await getPrisma();
  const { searchParams } = new URL(req.url);
  const phone = (searchParams.get("phone") ?? "").trim();
  const idsRaw = (searchParams.get("ids") ?? "").trim();

  const or: Prisma.PartRequestWhereInput[] = [];

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length >= 7) {
    // Match across stored formats (05…, +9715…, 9715…) by the 9-digit core.
    or.push({ phone: { contains: phoneDigits.slice(-9) } });
  }

  if (idsRaw) {
    const ids = idsRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 50);
    if (ids.length) or.push({ humanId: { in: ids } });
  }

  if (or.length === 0) return NextResponse.json({ orders: [] });

  const rows = await prisma.partRequest.findMany({
    where: { OR: or },
    include: { quote: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const orders = rows.map((r) => {
    const vin = r.vin ?? "";
    return {
      humanId: r.humanId,
      status: r.status,
      statusLabel: STATUS_LABEL[r.status] ?? r.status,
      createdAt: r.createdAt,
      car: [r.make, r.model, r.year].filter(Boolean).join(" "),
      vinLast: vin.length > 6 ? vin.slice(-6) : vin,
      parts: parseParts(r.partsJson).map((p) => ({ name: p.name, qty: p.qty })),
      quote: r.quote
        ? { price: r.quote.price, condition: r.quote.condition, eta: r.quote.eta }
        : null,
    };
  });

  return NextResponse.json({ orders });
}
