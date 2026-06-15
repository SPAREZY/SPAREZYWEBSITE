// Remembers which orders were placed on this device so the customer can see
// them on the Orders page without logging in. Stored in localStorage; the
// phone is kept too so it can prefill the cross-device lookup.

export const TRACKED_ORDERS_KEY = "sparezy_orders_v1";

export type TrackedOrders = { ids: string[]; phone?: string };

export function readTrackedOrders(): TrackedOrders {
  if (typeof window === "undefined") return { ids: [] };
  try {
    const raw = localStorage.getItem(TRACKED_ORDERS_KEY);
    if (!raw) return { ids: [] };
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.ids)
      ? parsed.ids.filter((x: unknown): x is string => typeof x === "string")
      : [];
    const phone = typeof parsed?.phone === "string" ? parsed.phone : undefined;
    return { ids, phone };
  } catch {
    return { ids: [] };
  }
}

export function rememberOrders(newIds: string[], phone?: string): void {
  if (typeof window === "undefined") return;
  const current = readTrackedOrders();
  const ids = Array.from(new Set([...newIds, ...current.ids])).slice(0, 100);
  const next: TrackedOrders = { ids, phone: phone || current.phone };
  try {
    localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / disabled storage */
  }
}
