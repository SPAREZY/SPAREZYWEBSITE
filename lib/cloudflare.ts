import type { PrismaD1 } from "@prisma/adapter-d1";

export type D1Binding = ConstructorParameters<typeof PrismaD1>[0];

export async function getCloudflareEnv(): Promise<Record<string, unknown> | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx.env as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}
