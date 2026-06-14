import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const STATUS_AT: Record<string, string> = {
  SOURCING: "sourcingAt",
  QUOTED: "quotedAt",
  CONFIRMED: "confirmedAt",
  COMPLETED: "completedAt",
  DECLINED: "declinedAt",
};
const VALID = ["RECEIVED", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED", "DECLINED"];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const request = await prisma.partRequest.findUnique({
    where: { id: params.id },
    include: { quote: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ request });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = (body as { status?: string }).status;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const data: Record<string, unknown> = { status };
  const atField = STATUS_AT[status];
  if (atField) data[atField] = new Date();

  const request = await prisma.partRequest.update({
    where: { id: params.id },
    data,
    include: { quote: true },
  });

  return NextResponse.json({ request });
}
