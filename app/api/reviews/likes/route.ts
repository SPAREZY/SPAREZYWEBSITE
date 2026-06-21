import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { REVIEW_IDS, REVIEW_LIKES_KEY } from "@/lib/reviews";

// Website likes on the storefront reviews. Stored in the generic Setting
// key/value table as a JSON map { reviewId: count } so no schema migration is
// needed. These are purely for the owner's analytics — they never sync back to
// Google.

export const dynamic = "force-dynamic";

async function readLikes(): Promise<Record<string, number>> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: REVIEW_LIKES_KEY } });
    if (!row?.value) return {};
    const parsed = JSON.parse(row.value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export async function GET() {
  return NextResponse.json({ likes: await readLikes() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  if (!REVIEW_IDS.includes(id)) {
    return NextResponse.json({ error: "Unknown review" }, { status: 400 });
  }
  try {
    const likes = await readLikes();
    likes[id] = (likes[id] ?? 0) + 1;
    await prisma.setting.upsert({
      where: { key: REVIEW_LIKES_KEY },
      create: { key: REVIEW_LIKES_KEY, value: JSON.stringify(likes) },
      update: { value: JSON.stringify(likes) },
    });
    return NextResponse.json({ id, count: likes[id] });
  } catch {
    return NextResponse.json({ error: "Could not save like" }, { status: 500 });
  }
}
