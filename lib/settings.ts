import { prisma } from "@/lib/prisma";
import { DEFAULT_ORDER_PATTERN } from "@/lib/order-number";

export const ORDER_PATTERN_KEY = "order_number_pattern";

// Returns the configured order-number pattern, falling back to the default
// if it has never been set (or the settings table isn't reachable yet).
export async function getOrderPattern(): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: ORDER_PATTERN_KEY } });
    return row?.value?.trim() || DEFAULT_ORDER_PATTERN;
  } catch {
    return DEFAULT_ORDER_PATTERN;
  }
}

export async function setOrderPattern(value: string): Promise<void> {
  const v = value.trim();
  await prisma.setting.upsert({
    where: { key: ORDER_PATTERN_KEY },
    create: { key: ORDER_PATTERN_KEY, value: v },
    update: { value: v },
  });
}
