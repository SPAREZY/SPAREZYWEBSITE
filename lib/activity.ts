import { prisma } from "@/lib/prisma";

export type ActivityType =
  | "CREATED"
  | "STATUS"
  | "QUOTE"
  | "NOTE"
  | "CONTACT"
  | "PRIORITY"
  | "ASSIGN";

// Append an entry to a lead's activity timeline. Best-effort: never throw
// (e.g. if the ActivityLog table hasn't been migrated yet) so it can't break
// the primary action it accompanies.
export async function logActivity(
  requestId: string,
  type: ActivityType,
  message: string,
  actor: string = "Admin",
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { requestId, type, message, actor },
    });
  } catch (e) {
    console.error("[logActivity]", e);
  }
}
