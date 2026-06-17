import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Deletes ALL orders (PartRequest) — quotes and activity rows cascade with
// them. Guarded by admin auth and a typed confirmation to prevent accidents.
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if ((body as { confirm?: string }).confirm !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm." }, { status: 400 });
  }

  const result = await prisma.partRequest.deleteMany({});
  return NextResponse.json({ deleted: result.count });
}
