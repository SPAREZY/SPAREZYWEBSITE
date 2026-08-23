import type { PrismaClient } from "@prisma/client";
import { getCloudflareEnv, type D1Binding } from "./cloudflare";

const d1Cache = new WeakMap<object, PrismaClient>();
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export async function getPrisma(): Promise<PrismaClient> {
  const env = await getCloudflareEnv();
  const db = (env as { DB?: D1Binding } | null)?.DB;

  if (db) {
    const cached = d1Cache.get(db as object);
    if (cached) return cached;

    const { PrismaD1 } = await import("@prisma/adapter-d1");
    const { PrismaClient: WasmClient } = await import("@prisma/client/wasm");
    const adapter = new PrismaD1(db);
    const client = new WasmClient({ adapter }) as unknown as PrismaClient;
    d1Cache.set(db as object, client);
    return client;
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { PrismaClient: NodeClient } = await import("@prisma/client");
  const client = new NodeClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
