"use client";

import type { Lead } from "./types";

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function StatsStrip({ leads }: { leads: Lead[] }) {
  const open = leads.filter((l) => l.status !== "COMPLETED" && l.status !== "DECLINED").length;

  const quotedToday = leads.filter((l) => isToday(l.quotedAt) && l.quotedAt);
  const avgMinutes =
    quotedToday.length > 0
      ? Math.round(
          quotedToday.reduce((sum, l) => {
            const mins = (new Date(l.quotedAt!).getTime() - new Date(l.receivedAt).getTime()) / 60000;
            return sum + Math.max(0, mins);
          }, 0) / quotedToday.length,
        )
      : null;

  const everQuoted = leads.filter((l) => l.quotedAt);
  const wonFromQuoted = everQuoted.filter((l) => l.status === "CONFIRMED" || l.status === "COMPLETED").length;
  const conversion = everQuoted.length > 0 ? Math.round((wonFromQuoted / everQuoted.length) * 100) : null;

  const cards = [
    { label: "Open leads", value: String(open) },
    { label: "Avg response · today", value: avgMinutes === null ? "—" : `${avgMinutes}m` },
    { label: "Conversion", value: conversion === null ? "—" : `${conversion}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="border border-white/15 bg-white/5 px-4 py-4">
          <div className="font-display text-2xl sm:text-3xl tracking-tightest">{c.value}</div>
          <div className="mt-1 text-[0.62rem] sm:text-[0.7rem] font-bold uppercase tracking-wider2 text-white/55">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
