import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { buildLeadWhere } from "@/lib/lead-query";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const where = buildLeadWhere(searchParams);

  const sort = (searchParams.get("sort") ?? "createdAt").trim();
  const dir = (searchParams.get("dir") ?? "desc").trim() === "asc" ? "asc" : "desc";
  const SORTABLE = ["createdAt", "receivedAt", "status", "priority", "customerName"];
  const orderBy: Prisma.PartRequestOrderByWithRelationInput = SORTABLE.includes(sort)
    ? { [sort]: dir }
    : { createdAt: "desc" };

  const take = Math.min(Math.max(Number(searchParams.get("take") ?? 200), 1), 500);

  const requests = await prisma.partRequest.findMany({
    where,
    include: { quote: true },
    orderBy,
    take,
  });

  return NextResponse.json({ requests });
}
