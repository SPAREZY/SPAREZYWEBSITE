import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { STATUS_LABEL, PRIORITY_LABEL, type Status, type Priority } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_AT: Record<string, string> = {
  SOURCING: "sourcingAt",
  QUOTED: "quotedAt",
  CONFIRMED: "confirmedAt",
  COMPLETED: "completedAt",
  DECLINED: "declinedAt",
};
const VALID = ["RECEIVED", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED", "DECLINED"];
const VALID_PRIORITY = ["LOW", "NORMAL", "HIGH", "URGENT"];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const request = await prisma.partRequest.findUnique({
    where: { id: params.id },
    include: { quote: true, activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ request });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    status,
    priority,
    assignee,
    internalNote,
    tags,
    markContacted,
  } = body as {
    status?: string;
    priority?: string;
    assignee?: string | null;
    internalNote?: string | null;
    tags?: string | null;
    markContacted?: boolean;
  };

  const existing = await prisma.partRequest.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  const logs: { type: Parameters<typeof logActivity>[1]; message: string }[] = [];

  if (status !== undefined) {
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    if (status !== existing.status) {
      data.status = status;
      const atField = STATUS_AT[status];
      if (atField) data[atField] = new Date();
      logs.push({
        type: "STATUS",
        message: `Moved to ${STATUS_LABEL[status as Status] ?? status}`,
      });
    }
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITY.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
    }
    if (priority !== existing.priority) {
      data.priority = priority;
      logs.push({
        type: "PRIORITY",
        message: `Priority set to ${PRIORITY_LABEL[priority as Priority] ?? priority}`,
      });
    }
  }

  if (assignee !== undefined) {
    const next = assignee?.trim() || null;
    if (next !== existing.assignee) {
      data.assignee = next;
      logs.push({ type: "ASSIGN", message: next ? `Assigned to ${next}` : "Unassigned" });
    }
  }

  if (tags !== undefined) {
    data.tags = tags?.trim() || null;
  }

  if (internalNote !== undefined) {
    data.internalNote = internalNote?.trim() || null;
  }

  if (markContacted) {
    data.lastContactedAt = new Date();
    logs.push({ type: "CONTACT", message: "Marked as contacted" });
  }

  if (Object.keys(data).length === 0) {
    const request = await prisma.partRequest.findUnique({
      where: { id: params.id },
      include: { quote: true, activities: { orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json({ request });
  }

  const request = await prisma.partRequest.update({
    where: { id: params.id },
    data,
    include: { quote: true },
  });

  for (const l of logs) await logActivity(params.id, l.type, l.message);

  const withActivities = await prisma.partRequest.findUnique({
    where: { id: params.id },
    include: { quote: true, activities: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json({ request: withActivities ?? request });
}
