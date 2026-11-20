import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/env";

const key = () => process.env.CRON_SECRET || "";

/** Token semnat pentru dezabonare (fără cont, fără bază de date). */
export function unsubToken(email: string) {
  return createHmac("sha256", key()).update(email.trim().toLowerCase()).digest("base64url").slice(0, 24);
}

export function unsubValid(email: string, token: string) {
  if (!key() || !email || !token) return false;
  const a = Buffer.from(unsubToken(email)), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubLinks(email: string) {
  const q = `e=${encodeURIComponent(email.trim().toLowerCase())}&t=${unsubToken(email)}`;
  return {
    page: `${SITE_URL}/dezabonare?${q}`,
    headers: {
      "List-Unsubscribe": `<${SITE_URL}/api/dezabonare?${q}>, <mailto:hello@golunar.ro?subject=dezabonare>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
