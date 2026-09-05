import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { notifyCustomer } from "@/lib/notify";
import { isValidPhone, isValidEmail } from "@/lib/utils";
import { getOrderPattern } from "@/lib/settings";
import { renderOrderNumber } from "@/lib/order-number";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

type PartInput = { name?: string; qty?: number; condition?: string };
const CONDITIONS = ["genuine", "oem", "aftermarket", "any"];

export async function POST(req: Request) {
  const prisma = await getPrisma();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    vin,
    make,
    model,
    year,
    customerName,
    phone,
    email,
    city,
    state,
    country,
    address,
    contactPref,
    partPreference,
    partsJson,
    partNumber,
    photoUrl,
    customerNote,
  } = body as Record<string, any>;

  // The car is identified by its brand + the parts requested; VIN is optional.
  const vinClean = typeof vin === "string" ? vin.trim().toUpperCase() : "";
  const finalVin = vinClean || "—";

  // The storefront has no contact form on purpose — the customer taps through
  // to WhatsApp and the conversation carries their details. Those leads still
  // belong on the board (car, chassis, photo, parts), so accept them without
  // a name or number. Every other caller keeps the full requirements.
  const fromStore = (body as { source?: unknown }).source === "storefront";

  const hasPhone = typeof phone === "string" && phone.trim().length > 0;
  const hasEmail = typeof email === "string" && email.trim().length > 0;

  if (!fromStore) {
    if (typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }
    if (!["whatsapp", "call", "email"].includes(contactPref)) {
      return NextResponse.json(
        { error: "contactPref must be whatsapp, call, or email." },
        { status: 400 },
      );
    }
    if (!hasPhone && !hasEmail) {
      return NextResponse.json({ error: "At least one of phone or email is required." }, { status: 400 });
    }
  }
  if (hasPhone && !isValidPhone(phone)) {
    return NextResponse.json({ error: "That doesn't look like a valid phone number." }, { status: 400 });
  }
  if (hasEmail && !isValidEmail(email)) {
    return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 400 });
  }
  if (!fromStore && (contactPref === "whatsapp" || contactPref === "call") && !hasPhone) {
    return NextResponse.json({ error: "Phone is required for the chosen contact preference." }, { status: 400 });
  }
  if (!fromStore && contactPref === "email" && !hasEmail) {
    return NextResponse.json({ error: "Email is required when preferred contact is email." }, { status: 400 });
  }

  if (!Array.isArray(partsJson) || partsJson.length === 0) {
    return NextResponse.json({ error: "At least one part is required." }, { status: 400 });
  }
  const parts = (partsJson as PartInput[])
    .map((p) => ({
      name: String(p?.name ?? "").trim(),
      qty: Math.trunc(Number(p?.qty)),
      condition: CONDITIONS.includes(String(p?.condition)) ? String(p?.condition) : "any",
    }))
    .filter((p) => p.name.length >= 2);
  if (parts.length === 0) {
    return NextResponse.json({ error: "At least one part with a name is required." }, { status: 400 });
  }
  if (parts.some((p) => !Number.isFinite(p.qty) || p.qty < 1)) {
    return NextResponse.json({ error: "Each part needs a quantity of at least 1." }, { status: 400 });
  }

  const yearNum = year === undefined || year === null || year === "" ? null : Number(year);
  const validYear = yearNum !== null && Number.isFinite(yearNum) ? Math.trunc(yearNum) : null;
  const pref = CONDITIONS.includes(String(partPreference)) ? String(partPreference) : "any";

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const orderPattern = await getOrderPattern();

  try {
    let created = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const countThisYear = await prisma.partRequest.count({
        where: { createdAt: { gte: startOfYear } },
      });
      const humanId = renderOrderNumber(orderPattern, countThisYear + 1 + attempt, now);
      try {
        created = await prisma.partRequest.create({
          data: {
            humanId,
            partName: parts[0].name,
            category: parts.length > 1 ? "Multiple" : "Single",
            partsJson: JSON.stringify(parts),
            partNumber: typeof partNumber === "string" && partNumber.trim() ? partNumber.trim() : null,
            photoUrl: typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : null,
            customerNote: typeof customerNote === "string" && customerNote.trim() ? customerNote.trim() : null,
            vin: finalVin,
            make: typeof make === "string" && make.trim() ? make.trim() : null,
            model: typeof model === "string" && model.trim() ? model.trim() : null,
            year: validYear,
            customerName:
              typeof customerName === "string" && customerName.trim()
                ? customerName.trim()
                : "WhatsApp lead",
            phone: hasPhone ? phone.trim() : null,
            email: hasEmail ? email.trim() : null,
            city: typeof city === "string" && city.trim() ? city.trim() : null,
            state: typeof state === "string" && state.trim() ? state.trim() : null,
            country: typeof country === "string" && country.trim() ? country.trim() : null,
            address: typeof address === "string" && address.trim() ? address.trim() : null,
            contactPref: ["whatsapp", "call", "email"].includes(contactPref)
              ? contactPref
              : "whatsapp",
            partPreference: pref,
          },
        });
        break;
      } catch (e) {
        if ((e as { code?: string })?.code === "P2002") continue; // humanId collision, retry
        throw e;
      }
    }

    if (!created) {
      return NextResponse.json({ error: "Could not create the request. Please try again." }, { status: 500 });
    }

    const actor = (body as { source?: unknown }).source === "admin" ? "Admin" : "Customer";
    await logActivity(created.id, "CREATED", `Lead received — ${created.partName}`, actor);
    await notifyCustomer(created, null);

    return NextResponse.json(
      { id: created.id, humanId: created.humanId, status: created.status },
      { status: 201 },
    );
  } catch (e) {
    console.error("[POST /api/requests]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
