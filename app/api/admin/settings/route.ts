import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { getOrderPattern, setOrderPattern } from "@/lib/settings";
import {
  DEFAULT_ORDER_PATTERN,
  renderOrderNumber,
  validateOrderPattern,
} from "@/lib/order-number";

export const dynamic = "force-dynamic";

async function nextSeq(): Promise<number> {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const count = await prisma.partRequest.count({ where: { createdAt: { gte: startOfYear } } });
  return count + 1;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pattern = await getOrderPattern();
  const seq = await nextSeq();
  return NextResponse.json({
    pattern,
    default: DEFAULT_ORDER_PATTERN,
    preview: renderOrderNumber(pattern, seq, new Date()),
  });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const pattern = (body as { pattern?: unknown }).pattern;

  const check = validateOrderPattern(pattern);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const value = String(pattern).trim();
  await setOrderPattern(value);
  const seq = await nextSeq();
  return NextResponse.json({
    pattern: value,
    preview: renderOrderNumber(value, seq, new Date()),
  });
}
