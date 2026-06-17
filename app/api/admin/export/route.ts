import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { parseParts } from "@/lib/utils";
import { buildLeadWhere } from "@/lib/lead-query";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Exports the current (optionally filtered) lead list as a CSV download.
export async function GET(req: Request) {
  if (!isAdmin()) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const where = buildLeadWhere(searchParams);

  const rows = await prisma.partRequest.findMany({
    where,
    include: { quote: true },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const headers = [
    "Order #",
    "Status",
    "Priority",
    "Created",
    "Customer",
    "Phone",
    "Email",
    "City",
    "State",
    "Make",
    "Model",
    "Year",
    "VIN",
    "Parts",
    "Quote (AED)",
    "Condition",
    "Assignee",
  ];

  const lines = [headers.map(csvCell).join(",")];
  for (const r of rows) {
    const parts = parseParts(r.partsJson)
      .map((p) => `${p.name} x${p.qty}`)
      .join("; ");
    lines.push(
      [
        r.humanId,
        r.status,
        r.priority,
        new Date(r.createdAt).toISOString(),
        r.customerName,
        r.phone ?? "",
        r.email ?? "",
        r.city ?? "",
        r.state ?? "",
        r.make ?? "",
        r.model ?? "",
        r.year ?? "",
        r.vin,
        parts,
        r.quote?.price ?? "",
        r.quote?.condition ?? "",
        r.assignee ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const csv = "﻿" + lines.join("\r\n"); // BOM so Excel reads UTF-8
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sparezy-leads-${stamp}.csv"`,
    },
  });
}
