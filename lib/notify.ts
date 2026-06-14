import type { PartRequest, Quote } from "@prisma/client";

export async function notifyCustomer(
  request: PartRequest,
  quote: Quote | null,
): Promise<{ delivered: boolean; channel: string; preview: string }> {
  const channel = request.contactPref;
  const dest = channel === "email" ? request.email : request.phone;
  const preview = quote
    ? `Sparezy — your ${request.partName} for VIN ${request.vin.slice(-6)} is ${quote.condition} @ AED ${quote.price}. Tap to confirm.`
    : `Sparezy — your request ${request.humanId} is in. We'll ping you the moment it's located.`;
  console.log(`[notify ${channel} -> ${dest}] ${preview}`);
  // TODO: WhatsApp Cloud API (channel === "whatsapp")
  // TODO: Resend / SES (channel === "email")
  // TODO: Twilio (channel === "call")
  return { delivered: false, channel, preview };
}
