import type { PartRequest, Quote } from "@prisma/client";
import { normalizeWhatsappPhone } from "@/lib/utils";

type NotifyResult = { delivered: boolean; channel: string; preview: string };

function buildPreview(request: PartRequest, quote: Quote | null): string {
  return quote
    ? `Sparezy — your ${request.partName} for VIN ${request.vin.slice(-6)} is ${quote.condition} @ AED ${quote.price}. Order ${request.humanId}. Tap to confirm.`
    : `Sparezy — request ${request.humanId} received. We're sourcing your ${request.partName} now and will message you the moment it's located.`;
}

// Sends the customer an update. WhatsApp + email are attempted only when their
// credentials are configured; otherwise it logs (so dev/preview still works).
//   WhatsApp Cloud API:  WHATSAPP_TOKEN + WHATSAPP_PHONE_ID
//   Email (Resend):      RESEND_API_KEY + RESEND_FROM
export async function notifyCustomer(
  request: PartRequest,
  quote: Quote | null,
): Promise<NotifyResult> {
  const channel = request.contactPref;
  const preview = buildPreview(request, quote);
  let delivered = false;

  try {
    if ((channel === "whatsapp" || channel === "call") && request.phone) {
      delivered = await sendWhatsApp(request.phone, preview);
    } else if (channel === "email" && request.email) {
      delivered = await sendEmail(request.email, "Your Sparezy request", preview);
    }
  } catch (e) {
    console.error("[notifyCustomer]", e);
  }

  if (!delivered) {
    const dest = channel === "email" ? request.email : request.phone;
    console.log(`[notify ${channel} -> ${dest}] ${preview}`);
  }

  return { delivered, channel, preview };
}

async function sendWhatsApp(rawPhone: string, body: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;

  const to = normalizeWhatsappPhone(rawPhone);
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) {
    console.error("[sendWhatsApp]", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text: body }),
  });
  if (!res.ok) {
    console.error("[sendEmail]", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}
