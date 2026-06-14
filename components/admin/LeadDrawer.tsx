"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  parseParts,
  timeAgo,
  whatsappLink,
  STATUS_LABEL,
  STATUS_FLOW,
  type Status,
} from "@/lib/utils";
import type { Lead } from "./types";
import QuoteForm from "./QuoteForm";

const ALL_STATUSES: Status[] = [...STATUS_FLOW, "DECLINED"];

function buildQuoteMessage(lead: Lead): string {
  const q = lead.quote!;
  const firstName = lead.customerName.split(" ")[0] || lead.customerName;
  const car = [lead.make, lead.model, lead.year].filter(Boolean).join(" ") || "your car";
  const pos = lead.position ? ` (${lead.position})` : "";
  const warr = q.warranty ? ` · ${q.warranty} warranty` : "";
  const eta = q.eta ? ` · ETA ${q.eta}` : "";
  const note = q.note ? `\n\n${q.note}` : "";
  return `Hey ${firstName} — Sparezy here.\n\nFound your ${lead.partName}${pos} for ${car}.\n\nPrice: AED ${q.price} · ${q.condition}${warr}${eta}.${note}\n\nOrder: ${lead.humanId}.\n\nWant it? Just reply 👍`;
}

export default function LeadDrawer({
  lead,
  onClose,
  onStatusChange,
  onSaved,
}: {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => void;
  onSaved: () => void;
}) {
  const [zoom, setZoom] = useState(false);

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-royal-darkest/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 z-[61] h-[100dvh] w-full max-w-[640px] bg-royal-deep overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[0.72rem] tracking-wider2 text-white/55">{lead.humanId}</div>
                  <h2 className="mt-1 font-display text-2xl leading-tight tracking-tightest">{lead.partName}</h2>
                  <span className="mt-2 inline-block border border-white/25 bg-white/5 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider2">
                    {STATUS_LABEL[lead.status as Status] ?? lead.status}
                  </span>
                </div>
                <button onClick={onClose} className="text-[0.8rem] font-bold uppercase tracking-wider2 text-white/70 hover:text-white">
                  Close
                </button>
              </div>

              {/* Part number + photo callout */}
              {(lead.partNumber || lead.photoUrl) && (
                <div className="mt-6 grid grid-cols-2 gap-4 border border-white/15 bg-white/5 p-4">
                  {lead.partNumber && (
                    <div>
                      <div className="field-label">Part number</div>
                      <div className="mt-1 font-mono tracking-wider2">{lead.partNumber}</div>
                    </div>
                  )}
                  {lead.photoUrl && (
                    <button onClick={() => setZoom(true)} className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lead.photoUrl} alt="Part" className="h-24 w-full object-cover" />
                    </button>
                  )}
                </div>
              )}

              {/* Parts ordered */}
              <Section title="Parts ordered">
                <ul className="divide-y divide-white/10">
                  {parseParts(lead.partsJson).map((p, i) => (
                    <li key={i} className="flex items-center justify-between py-2">
                      <span className="font-bold">{p.name}</span>
                      <span className="font-mono text-[0.78rem] tracking-wider2 text-white/60">
                        Qty {p.qty} · {p.condition}
                      </span>
                    </li>
                  ))}
                </ul>
                {lead.customerNote && (
                  <p className="mt-3 text-[0.85rem] text-white/75">“{lead.customerNote}”</p>
                )}
              </Section>

              {/* Customer */}
              <Section title="Customer">
                <Row k="Name" v={lead.customerName} />
                <Row k="Phone" v={lead.phone ?? "—"} strong={lead.contactPref !== "email"} />
                <Row k="Email" v={lead.email ?? "—"} strong={lead.contactPref === "email"} />
                <Row k="Location" v={[lead.city, lead.country].filter(Boolean).join(", ") || "—"} />
                {lead.address && <Row k="Delivery" v={lead.address} />}
                <Row k="Prefers" v={STATUS_PREF[lead.contactPref] ?? lead.contactPref} />
                <Row k="Received" v={timeAgo(lead.receivedAt)} />
              </Section>

              {/* Car */}
              <Section title="Car">
                <Row k="VIN" v={lead.vin} mono />
                <Row k="Make / Model / Year" v={[lead.make, lead.model, lead.year].filter(Boolean).join(" ") || "—"} />
              </Section>

              {/* AI transcript */}
              {lead.aiTranscript && lead.aiTranscript.trim().length > 2 && (
                <Section title="Transcript">
                  <pre className="whitespace-pre-wrap text-[0.8rem] text-white/70">{lead.aiTranscript}</pre>
                </Section>
              )}

              {/* Status pills */}
              <Section title="Move to">
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((s) => {
                    const active = lead.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => onStatusChange(lead.id, s)}
                        className={`px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-wider2 border transition-colors ${
                          active ? "bg-white text-royal-deep border-white" : "border-white/25 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Quote form */}
              <Section title="Quote">
                <QuoteForm lead={lead} onSaved={onSaved} />
              </Section>

              {/* Send quote on WhatsApp */}
              {lead.phone && lead.quote && (
                <a
                  href={whatsappLink(lead.phone, buildQuoteMessage(lead))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full border-2 border-white/80 py-3 text-center text-sm font-bold uppercase tracking-wider2 hover:bg-white/10 transition-colors"
                >
                  Send quote on WhatsApp
                </a>
              )}
            </div>
          </motion.aside>

          {zoom && lead.photoUrl && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-6"
              onClick={() => setZoom(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lead.photoUrl} alt="Part" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

const STATUS_PREF: Record<string, string> = {
  whatsapp: "WhatsApp",
  call: "Phone call",
  email: "Email",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 border-t border-white/12 pt-5">
      <h3 className="field-label mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ k, v, strong, mono }: { k: string; v: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/45">{k}</span>
      <span className={`text-right ${mono ? "font-mono tracking-wider2" : ""} ${strong ? "font-bold text-white" : "text-white/80"}`}>
        {v}
      </span>
    </div>
  );
}
