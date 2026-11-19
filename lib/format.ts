import type { Currency } from "@/lib/plans";

export function money(amount: number | string | null | undefined, cur: Currency = "RON", decimals?: number) {
  const v = Number(amount ?? 0);
  const d = decimals ?? (Number.isInteger(v) ? 0 : 2);
  const s = v.toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  return cur === "EUR" ? `${s} €` : `${s} lei`;
}

const TZ = "Europe/Bucharest";
export function date(d: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ro-RO", { timeZone: TZ, ...opts });
}
export const dateShort = (d: string | Date | null | undefined) => date(d, { day: "numeric", month: "short" });
export const dateNum = (d: string | Date | null | undefined) => date(d, { day: "2-digit", month: "2-digit", year: "numeric" });
export const monthShort = (d: string | Date) => new Date(d).toLocaleDateString("ro-RO", { month: "short", timeZone: TZ }).replace(".", "");

export function num(n: number, d = 0) {
  return n.toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}
