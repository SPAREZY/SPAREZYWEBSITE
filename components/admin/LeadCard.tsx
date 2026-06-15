"use client";

import {
  agingTier,
  parseParts,
  timeAgo,
  whatsappLink,
  STATUS_LABEL,
  PRIORITY_CLASS,
  type Status,
  type Priority,
} from "@/lib/utils";
import type { Lead } from "./types";

const AGING_DOT: Record<string, string> = {
  fresh: "bg-green",
  aging: "bg-amber-400",
  overdue: "bg-red-400",
};

const ALL_STATUSES: Status[] = ["RECEIVED", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED", "DECLINED"];

export default function LeadCard({
  lead,
  onOpen,
  onStatusChange,
}: {
  lead: Lead;
  onOpen: (lead: Lead) => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const parts = parseParts(lead.partsJson);
  const extra = parts.length > 1 ? parts.length - 1 : 0;
  const tier = agingTier(lead.receivedAt);
  const prefPhone = lead.contactPref === "whatsapp" || lead.contactPref === "call";

  return (
    <div
      onClick={() => onOpen(lead)}
      className="cursor-pointer border border-white/15 bg-white/5 hover:bg-white/10 transition-colors p-3"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[0.68rem] tracking-wider2 text-white/55">
            {lead.humanId}
          </span>
          {lead.priority && lead.priority !== "NORMAL" && (
            <span
              className={`rounded-sm border px-1 py-0.5 text-[0.5rem] font-bold uppercase tracking-wider2 ${
                PRIORITY_CLASS[(lead.priority as Priority) ?? "NORMAL"]
              }`}
            >
              {lead.priority}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 text-[0.65rem] text-white/55">
          <span className={`inline-block h-2 w-2 rounded-full ${AGING_DOT[tier]}`} />
          {timeAgo(lead.receivedAt)}
        </span>
      </div>

      <div className="mt-2 flex items-start gap-2">
        <span className="font-bold leading-snug">{lead.partName}</span>
        {extra > 0 && (
          <span className="shrink-0 rounded-sm bg-white/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider2">
            +{extra} more
          </span>
        )}
      </div>

      <div className="mt-1 font-mono text-[0.72rem] tracking-wider2 text-white/50">
        ···{lead.vin.slice(-6)}
      </div>

      <div className="mt-2 text-[0.8rem]">
        <span className="font-semibold">{lead.customerName}</span>
        {prefPhone && lead.phone && (
          <span className="ml-2 font-bold text-white">{lead.phone}</span>
        )}
        {!prefPhone && lead.email && <span className="ml-2 font-bold text-white">{lead.email}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {lead.partNumber && <Tag>PN</Tag>}
        {lead.photoUrl && <Tag>Photo</Tag>}
        <Tag>{lead.partPreference.charAt(0).toUpperCase() + lead.partPreference.slice(1)}</Tag>
        {lead.phone && (
          <a
            href={whatsappLink(lead.phone, "")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto rounded-sm bg-green/80 px-1.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-wider2 text-white hover:bg-green"
            title="WhatsApp"
          >
            WA
          </a>
        )}
        {lead.phone && (lead.contactPref === "call" || lead.contactPref === "whatsapp") && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm bg-white/15 px-1.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-wider2 hover:bg-white/25"
            title="Call"
          >
            ☎
          </a>
        )}
      </div>

      <select
        value={lead.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(lead.id, e.target.value as Status)}
        className="mt-3 w-full bg-royal-deep border border-white/20 text-white text-[0.72rem] font-bold uppercase tracking-wider2 py-1.5 px-2 outline-none"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-white/20 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider2 text-white/70">
      {children}
    </span>
  );
}
