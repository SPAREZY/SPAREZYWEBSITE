import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { notifyCustomer } from "@/lib/notify";

export const dynamic = "force-dynamic";

const CONDITIONS = ["genuine", "oem", "aftermarket", "any"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { price, condition, warranty, eta, note } = body as {
    price?: unknown;
    condition?: string;
    warranty?: string;
    eta?: string;
    note?: string;
  };

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "A valid price is required." }, { status: 400 });
  }
  if (!condition || !CONDITIONS.includes(condition)) {
    return NextResponse.json({ error: "A valid condition is required." }, { status: 400 });
  }

  const existing = await prisma.partRequest.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quoteData = {
    price: priceNum,
    condition,
    warranty: warranty?.trim() || null,
    eta: eta?.trim() || null,
    note: note?.trim() || null,
  };

  const quote = await prisma.quote.upsert({
    where: { requestId: params.id },
    create: { requestId: params.id, ...quoteData },
    update: quoteData,
  });

  const request = await prisma.partRequest.update({
    where: { id: params.id },
    data: { status: "QUOTED", quotedAt: new Date() },
    include: { quote: true },
  });

  await notifyCustomer(request, quote);

  return NextResponse.json({ request, quote });
}
