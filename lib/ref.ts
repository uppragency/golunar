import "server-only";
import { cookies } from "next/headers";

export const REF_COOKIE = "lunar_ref";
const RX = /^[A-Z0-9]{4,12}$/;

/** Codul de recomandare salvat din ?ref=COD (90 de zile). */
export async function getRef(): Promise<string | null> {
  const v = (await cookies()).get(REF_COOKIE)?.value?.toUpperCase() ?? "";
  return RX.test(v) ? v : null;
}

export type Attribution = { s: string; m: string; c: string; l: string };

/** Sursa primei vizite (cookie lunar_src): utm_source, site de proveniență sau „direct”. */
export async function getSource(): Promise<Attribution | null> {
  const raw = (await cookies()).get("lunar_src")?.value;
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    const t = (x: unknown, n: number) => String(x ?? "").replace(/[^\p{L}\p{N} ._/:-]/gu, "").slice(0, n);
    return { s: t(v.s, 60), m: t(v.m, 40), c: t(v.c, 80), l: t(v.l, 80) };
  } catch { return null; }
}
