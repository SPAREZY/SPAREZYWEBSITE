import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Chassis / VIN: accept any real-world format — 17-char VINs, JDM chassis codes
// (e.g. "GF-BH5"), short chassis numbers, etc. Require a few alphanumerics so a
// blank or stray keystroke is still rejected.
export function isValidChassis(value: string): boolean {
  return (value.match(/[A-Za-z0-9]/g) || []).length >= 3;
}

// UAE phone: accepts +9715XXXXXXXX, 9715XXXXXXXX, 05XXXXXXXX
export function isValidUaePhone(phone: string): boolean {
  const p = phone.replace(/[\s-]/g, "");
  return /^\+9715\d{8}$/.test(p) || /^9715\d{8}$/.test(p) || /^05\d{8}$/.test(p);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// SPZ-YYYY-NNNN
export function nextHumanId(seq: number, year: number = new Date().getFullYear()): string {
  return `SPZ-${year}-${String(seq).padStart(4, "0")}`;
}

export function formatAed(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function agingTier(receivedAt: Date | string): "fresh" | "aging" | "overdue" {
  const d = typeof receivedAt === "string" ? new Date(receivedAt) : receivedAt;
  const hrs = (Date.now() - d.getTime()) / 3_600_000;
  if (hrs < 2) return "fresh";
  if (hrs < 24) return "aging";
  return "overdue";
}

// Normalize a UAE phone to digits-only international form (e.g. 9715XXXXXXXX).
export function normalizeWhatsappPhone(raw: string): string {
  let p = raw.replace(/[\s\-()+]/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) p = "971" + p.slice(1); // 05XXXXXXXX -> 9715XXXXXXXX
  else if (p.startsWith("5") && p.length === 9) p = "971" + p; // 5XXXXXXXX -> 9715XXXXXXXX
  return p;
}

// wa.me deep-link builder. Strips +/spaces, converts 05… -> +9715…
export function whatsappLink(rawPhone: string, message: string): string {
  const num = normalizeWhatsappPhone(rawPhone);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

// Tailwind className merge helper
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const STATUS_FLOW = ["RECEIVED", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED"] as const;
export type Status = (typeof STATUS_FLOW)[number] | "DECLINED";

export const STATUS_LABEL: Record<Status, string> = {
  RECEIVED: "New Lead",
  SOURCING: "Sourcing",
  QUOTED: "Quoted",
  CONFIRMED: "Won",
  COMPLETED: "Delivered",
  DECLINED: "Lost",
};

// Tailwind text colour per status — used for dots, pills and chips.
export const STATUS_COLOR: Record<Status, string> = {
  RECEIVED: "text-sky-300",
  SOURCING: "text-amber-300",
  QUOTED: "text-yellow-300",
  CONFIRMED: "text-emerald-300",
  COMPLETED: "text-emerald-400",
  DECLINED: "text-red-400",
};
export const STATUS_DOT: Record<Status, string> = {
  RECEIVED: "bg-sky-400",
  SOURCING: "bg-amber-400",
  QUOTED: "bg-yellow-400",
  CONFIRMED: "bg-emerald-400",
  COMPLETED: "bg-emerald-500",
  DECLINED: "bg-red-400",
};

// Lead priority (back-office triage).
export const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};
export const PRIORITY_CLASS: Record<Priority, string> = {
  LOW: "border-white/20 text-white/50",
  NORMAL: "border-white/25 text-white/70",
  HIGH: "border-amber-400/60 text-amber-300",
  URGENT: "border-red-400/70 text-red-300 bg-red-500/10",
};

export function isOpenStatus(status: string): boolean {
  return status !== "COMPLETED" && status !== "DECLINED";
}

// The five kanban columns, in order. "Won" buckets CONFIRMED + COMPLETED.
export const BOARD_COLUMNS: { key: string; label: string; statuses: Status[] }[] = [
  { key: "RECEIVED", label: "New Lead", statuses: ["RECEIVED"] },
  { key: "SOURCING", label: "Sourcing", statuses: ["SOURCING"] },
  { key: "QUOTED", label: "Quoted", statuses: ["QUOTED"] },
  { key: "WON", label: "Won", statuses: ["CONFIRMED", "COMPLETED"] },
  { key: "LOST", label: "Lost", statuses: ["DECLINED"] },
];

export type PartLine = { name: string; qty: number; condition: string };

export function parseParts(partsJson: string | null | undefined): PartLine[] {
  if (!partsJson) return [];
  try {
    const arr = JSON.parse(partsJson);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
