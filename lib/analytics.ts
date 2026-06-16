// Lightweight, provider-agnostic conversion tracking. Every call is guarded so
// it is a no-op until the matching pixel/tag is configured via env vars
// (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_TIKTOK_PIXEL_ID).
// Because the product is free, we attribute a nominal lead value so ad
// platforms (Google/Meta) can optimise delivery toward people who submit.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void; page?: () => void };
    dataLayer?: unknown[];
  }
}

export const LEAD_VALUE = 287; // AED — worth of a sourced-parts lead
export const CURRENCY = "AED";

function ga(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}
function meta(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}
function tiktok(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && window.ttq?.track) {
    window.ttq.track(event, params);
  }
}

export function trackAddToCart(value: number = LEAD_VALUE) {
  ga("add_to_cart", { currency: CURRENCY, value });
  meta("AddToCart", { currency: CURRENCY, value });
  tiktok("AddToCart", { currency: CURRENCY, value });
}

export function trackInitiateCheckout(value: number = LEAD_VALUE) {
  ga("begin_checkout", { currency: CURRENCY, value });
  meta("InitiateCheckout", { currency: CURRENCY, value });
  tiktok("InitiateCheckout", { currency: CURRENCY, value });
}

export function trackLead(opts: { orderIds?: string[]; count?: number } = {}) {
  const value = LEAD_VALUE * Math.max(1, opts.count ?? 1);
  const id = opts.orderIds?.join(", ");
  ga("generate_lead", { currency: CURRENCY, value, transaction_id: id });
  meta("Lead", { currency: CURRENCY, value, content_ids: opts.orderIds });
  tiktok("SubmitForm", { currency: CURRENCY, value });
}
