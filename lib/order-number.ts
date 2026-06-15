// Order-number pattern engine. The admin can configure a template made of
// literal text plus tokens; this renders it for a given sequence + date.
// Pure functions only (no DB / server deps) so it is safe to import in
// client components for live previews.

export const DEFAULT_ORDER_PATTERN = "SPZ-{YYYY}-{SEQ:4}";

// Tokens the template understands. Anything else in the string is kept literal.
export const ORDER_TOKENS: { token: string; meaning: string }[] = [
  { token: "{YYYY}", meaning: "4-digit year (e.g. 2026)" },
  { token: "{YY}", meaning: "2-digit year (e.g. 26)" },
  { token: "{MM}", meaning: "2-digit month (01–12)" },
  { token: "{DD}", meaning: "2-digit day (01–31)" },
  { token: "{SEQ}", meaning: "running number (default 4 digits)" },
  { token: "{SEQ:N}", meaning: "running number padded to N digits, e.g. {SEQ:5}" },
];

const TOKEN_RE = /\{(YYYY|YY|MM|DD|SEQ(?::\d+)?)\}/g;

export function renderOrderNumber(
  pattern: string,
  seq: number,
  date: Date = new Date(),
): string {
  const year = date.getFullYear();
  return pattern.replace(TOKEN_RE, (_match, token: string) => {
    if (token === "YYYY") return String(year);
    if (token === "YY") return String(year).slice(-2);
    if (token === "MM") return String(date.getMonth() + 1).padStart(2, "0");
    if (token === "DD") return String(date.getDate()).padStart(2, "0");
    const seqMatch = token.match(/^SEQ(?::(\d+))?$/);
    const pad = seqMatch && seqMatch[1] ? parseInt(seqMatch[1], 10) : 4;
    return String(seq).padStart(pad, "0");
  });
}

export function validateOrderPattern(pattern: unknown): { ok: boolean; error?: string } {
  if (typeof pattern !== "string") return { ok: false, error: "Pattern must be text." };
  const trimmed = pattern.trim();
  if (trimmed.length < 1) return { ok: false, error: "Pattern cannot be empty." };
  if (trimmed.length > 60) return { ok: false, error: "Pattern is too long (max 60 characters)." };
  if (!/\{SEQ(?::\d+)?\}/.test(trimmed)) {
    return { ok: false, error: "Pattern must include a {SEQ} token so every order number is unique." };
  }
  // Catch typo'd tokens like {YEAR} or {seq} before they ship.
  const unknown = trimmed.match(/\{(?!(?:YYYY|YY|MM|DD|SEQ(?::\d+)?)\})[^}]*\}/g);
  if (unknown) {
    return { ok: false, error: `Unknown token(s): ${unknown.join(", ")}` };
  }
  return { ok: true };
}
