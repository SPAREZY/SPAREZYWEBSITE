"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  parseParts,
  timeAgo,
  whatsappLink,
  normalizeWhatsappPhone,
  STATUS_LABEL,
  STATUS_FLOW,
  PRIORITIES,
  PRIORITY_LABEL,
  PRIORITY_CLASS,
  type Status,
  type Priority,
} from "@/lib/utils";
import type { Lead, ActivityT } from "./types";
import QuoteForm from "./QuoteForm";

const ALL_STATUSES: Status[] = [...STATUS_FLOW, "DECLINED"];

const ACTIVITY_ICON: Record<string, string> = {
  CREATED: "✦",
  STATUS: "→",
  QUOTE: "₳",
  NOTE: "✎",
  CONTACT: "☎",
  PRIORITY: "!",
  ASSIGN: "@",
};

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
  const [detail, setDetail] = useState<Lead | null>(lead);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [internal, setInternal] = useState("");
  const [assignee, setAssignee] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const reload = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/requests/${id}`, { cache: "no-store" });
    if (res.ok) {
      const d = (await res.json()) as { request: Lead };
      setDetail(d.request);
      setInternal(d.request.internalNote ?? "");
      setAssignee(d.request.assignee ?? "");
    }
  }, []);

  useEffect(() => {
    setDetail(lead);
    setInternal(lead?.internalNote ?? "");
    setAssignee(lead?.assignee ?? "");
    setNote("");
    if (lead) reload(lead.id);
  }, [lead, reload]);

  const cur = detail ?? lead;

  const patch = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!cur) return;
      const res = await fetch(`/api/admin/requests/${cur.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const d = (await res.json()) as { request: Lead };
        setDetail(d.request);
        setInternal(d.request.internalNote ?? "");
        setAssignee(d.request.assignee ?? "");
        onSaved();
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
      }
    },
    [cur, onSaved],
  );

  function changeStatus(s: Status) {
    if (!cur) return;
    onStatusChange(cur.id, s);
    setDetail((d) => (d ? { ...d, status: s } : d));
    setTimeout(() => reload(cur.id), 400);
  }

  async function addNote() {
    if (!cur || !note.trim()) return;
    setSavingNote(true);
    const res = await fetch(`/api/admin/requests/${cur.id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: note.trim() }),
    });
    setSavingNote(false);
    if (res.ok) {
      const d = (await res.json()) as { request: Lead };
      setDetail(d.request);
      setNote("");
    }
  }

  const activities: ActivityT[] = cur?.activities ?? [];

  return (
    <AnimatePresence>
      {cur && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-royal-darkest/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 z-[61] h-[100dvh] w-full max-w-[660px] overflow-y-auto bg-royal-deep"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[0.72rem] tracking-wider2 text-white/55">
                    {cur.humanId}
                  </div>
                  <h2 className="mt-1 font-display text-2xl leading-tight tracking-tightest">
                    {cur.partName}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-block border border-white/25 bg-white/5 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider2">
                      {STATUS_LABEL[cur.status as Status] ?? cur.status}
                    </span>
                    <span
                      className={`inline-block rounded-sm border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider2 ${
                        PRIORITY_CLASS[(cur.priority as Priority) ?? "NORMAL"]
                      }`}
                    >
                      {PRIORITY_LABEL[(cur.priority as Priority) ?? "NORMAL"]}
                    </span>
                    {savedFlash && (
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider2 text-emerald-300">
                        Saved ✓
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-[0.8rem] font-bold uppercase tracking-wider2 text-white/70 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Quick contact */}
              <div className="mt-5 flex flex-wrap gap-2">
                {cur.phone && (
                  <>
                    <a
                      href={`tel:${cur.phone}`}
                      className="rounded-sm bg-white/10 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider2 hover:bg-white/20"
                    >
                      ☎ Call
                    </a>
                    <a
                      href={whatsappLink(cur.phone, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm bg-green/80 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider2 hover:bg-green"
                    >
                      WhatsApp
                    </a>
                    <button
                      onClick={() => navigator.clipboard?.writeText(normalizeWhatsappPhone(cur.phone!))}
                      className="rounded-sm bg-white/10 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider2 hover:bg-white/20"
                    >
                      ⧉ Copy #
                    </button>
                  </>
                )}
                {cur.email && (
                  <a
                    href={`mailto:${cur.email}`}
                    className="rounded-sm bg-white/10 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider2 hover:bg-white/20"
                  >
                    ✉ Email
                  </a>
                )}
                <button
                  onClick={() => patch({ markContacted: true })}
                  className="rounded-sm border border-white/20 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider2 text-white/80 hover:bg-white/10"
                >
                  ✓ Mark contacted
                </button>
              </div>
              {cur.lastContactedAt && (
                <p className="mt-2 text-[0.66rem] text-white/45">
                  Last contacted {timeAgo(cur.lastContactedAt)}
                </p>
              )}

              {/* Part number + photo callout */}
              {(cur.partNumber || cur.photoUrl) && (
                <div className="mt-6 grid grid-cols-2 gap-4 border border-white/15 bg-white/5 p-4">
                  {cur.partNumber && (
                    <div>
                      <div className="field-label">Part number</div>
                      <div className="mt-1 font-mono tracking-wider2">{cur.partNumber}</div>
                    </div>
                  )}
                  {cur.photoUrl && (
                    <button onClick={() => setZoom(true)} className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cur.photoUrl} alt="Part" className="h-24 w-full object-cover" />
                    </button>
                  )}
                </div>
              )}

              {/* Parts ordered */}
              <Section title="Parts ordered">
                <ul className="divide-y divide-white/10">
                  {parseParts(cur.partsJson).map((p, i) => (
                    <li key={i} className="flex items-center justify-between py-2">
                      <span className="font-bold">{p.name}</span>
                      <span className="font-mono text-[0.78rem] tracking-wider2 text-white/60">
                        Qty {p.qty} · {p.condition}
                      </span>
                    </li>
                  ))}
                </ul>
                {cur.customerNote && (
                  <p className="mt-3 text-[0.85rem] text-white/75">“{cur.customerNote}”</p>
                )}
              </Section>

              {/* Customer */}
              <Section title="Customer">
                <Row k="Name" v={cur.customerName} />
                <Row k="Phone" v={cur.phone ?? "—"} strong={cur.contactPref !== "email"} />
                <Row k="Email" v={cur.email ?? "—"} strong={cur.contactPref === "email"} />
                <Row k="Location" v={[cur.city, cur.state, cur.country].filter(Boolean).join(", ") || "—"} />
                {cur.address && <Row k="Delivery" v={cur.address} />}
                <Row k="Prefers" v={STATUS_PREF[cur.contactPref] ?? cur.contactPref} />
                <Row k="Received" v={timeAgo(cur.receivedAt)} />
              </Section>

              {/* Car */}
              <Section title="Car">
                <Row k="VIN" v={cur.vin} mono />
                <Row
                  k="Make / Model / Year"
                  v={[cur.make, cur.model, cur.year].filter(Boolean).join(" ") || "—"}
                />
              </Section>

              {/* Ops — priority, assignee, internal note */}
              <Section title="Ops">
                <div className="field-label mb-2">Priority</div>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => {
                    const active = (cur.priority ?? "NORMAL") === p;
                    return (
                      <button
                        key={p}
                        onClick={() => patch({ priority: p })}
                        className={`rounded-sm border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider2 transition-colors ${
                          active ? PRIORITY_CLASS[p] + " bg-white/10" : "border-white/15 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {PRIORITY_LABEL[p]}
                      </button>
                    );
                  })}
                </div>

                <label className="mt-4 block">
                  <span className="field-label">Assignee</span>
                  <input
                    className="field-input"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    onBlur={() => {
                      if ((cur.assignee ?? "") !== assignee.trim()) patch({ assignee });
                    }}
                    placeholder="Who's handling this?"
                  />
                </label>

                <div className="mt-4">
                  <span className="field-label">Internal note (private)</span>
                  <textarea
                    className="field-input mt-1 min-h-[64px] resize-y"
                    value={internal}
                    onChange={(e) => setInternal(e.target.value)}
                    placeholder="Notes only your team can see…"
                  />
                  <button
                    onClick={() => patch({ internalNote: internal })}
                    className="mt-2 rounded-sm border border-white/20 px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-wider2 text-white/80 hover:bg-white/10"
                  >
                    Save note
                  </button>
                </div>
              </Section>

              {/* Status pills */}
              <Section title="Move to">
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((s) => {
                    const active = cur.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => changeStatus(s)}
                        className={`border px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-wider2 transition-colors ${
                          active
                            ? "border-white bg-white text-royal-deep"
                            : "border-white/25 text-white/80 hover:bg-white/10"
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
                <QuoteForm lead={cur} onSaved={() => reload(cur.id)} />
              </Section>

              {/* Send quote on WhatsApp */}
              {cur.phone && cur.quote && (
                <a
                  href={whatsappLink(cur.phone, buildQuoteMessage(cur))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full border-2 border-white/80 py-3 text-center text-sm font-bold uppercase tracking-wider2 transition-colors hover:bg-white/10"
                >
                  Send quote on WhatsApp
                </a>
              )}

              {/* Activity timeline */}
              <Section title="Activity">
                <div className="flex gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addNote();
                    }}
                    placeholder="Add a note to the timeline…"
                    className="field-input flex-1"
                  />
                  <button
                    onClick={addNote}
                    disabled={savingNote || !note.trim()}
                    className="shrink-0 rounded-sm bg-white/10 px-4 text-[0.7rem] font-bold uppercase tracking-wider2 hover:bg-white/20 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {activities.length === 0 ? (
                  <p className="mt-4 text-[0.78rem] text-white/40">No activity logged yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {activities.map((a) => (
                      <li key={a.id} className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.62rem] text-white/70">
                          {ACTIVITY_ICON[a.type] ?? "•"}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[0.82rem] text-white/85">{a.message}</div>
                          <div className="mt-0.5 text-[0.62rem] text-white/40">
                            {timeAgo(a.createdAt)}
                            {a.actor ? ` · ${a.actor}` : ""}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* AI transcript */}
              {cur.aiTranscript && cur.aiTranscript.trim().length > 2 && (
                <Section title="Transcript">
                  <pre className="whitespace-pre-wrap text-[0.8rem] text-white/70">
                    {cur.aiTranscript}
                  </pre>
                </Section>
              )}
            </div>
          </motion.aside>

          {zoom && cur.photoUrl && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-6"
              onClick={() => setZoom(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.photoUrl} alt="Part" className="max-h-full max-w-full object-contain" />
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
      <span
        className={`text-right ${mono ? "font-mono tracking-wider2" : ""} ${
          strong ? "font-bold text-white" : "text-white/80"
        }`}
      >
        {v}
      </span>
    </div>
  );
}
