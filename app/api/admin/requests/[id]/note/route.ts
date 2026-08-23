import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

// Append a free-text note to a lead's activity timeline.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const prisma = await getPrisma();
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const message = String((body as { message?: unknown }).message ?? "").trim();
  if (message.length < 1) {
    return NextResponse.json({ error: "Note cannot be empty." }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: "Note is too long." }, { status: 400 });
  }

  const existing = await prisma.partRequest.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logActivity(params.id, "NOTE", message);

  const request = await prisma.partRequest.findUnique({
    where: { id: params.id },
    include: { quote: true, activities: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json({ request });
}
