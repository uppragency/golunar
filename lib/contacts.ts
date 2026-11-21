import "server-only";
import { reportError } from "@/lib/report";

/**
 * Contactele (lead-uri și clienți) se păstrează în theMarketer, cu tag-uri pe sursă.
 * Abonarea la emailurile de marketing doar cu acord: lead-urile fără bifă sunt salvate ca contacte nedezabonate de nimic,
 * dar fără canalul email activ. Clienții sunt abonați (relație contractuală existentă, cu dezabonare în fiecare email).
 * Emailurile tranzacționale (confirmări, amintiri, facturi) rămân în Resend (lib/email.ts).
 */

const API = "https://t.themarketer.com/api/v1";

type Sync = {
  email: string;
  name?: string | null;
  phone?: string | null;
  kind: "lead" | "client";
  /** Lead: bifa de acord pentru emailuri de marketing. */
  marketing?: boolean;
  /** Tag-uri suplimentare, de exemplu sursa lead-ului sau planul comandat. */
  tags?: string[];
};

const creds = () => {
  const k = process.env.MKTR_REST_KEY, u = process.env.MKTR_CUSTOMER_ID;
  return k && u ? { k, u } : null;
};

const split = (name?: string | null) => {
  const p = (name || "").trim().split(/\s+/).filter(Boolean);
  return { firstname: p[0] || "", lastname: p.slice(1).join(" ") || "" };
};

async function call(path: string, params: Record<string, string>, method: "GET" | "POST" = "POST") {
  const c = creds()!;
  const q = new URLSearchParams({ ...c, ...params });
  const r = method === "GET"
    ? await fetch(`${API}/${path}?${q}`, { signal: AbortSignal.timeout(8000) })
    : await fetch(`${API}/${path}`, { method: "POST", body: q, signal: AbortSignal.timeout(8000) });
  const text = await r.text();
  if (!r.ok) throw new Error(`theMarketer ${path} ${r.status}: ${text.slice(0, 200)}`);
  try { return JSON.parse(text) as Record<string, unknown>; } catch { return {}; }
}

const slug = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Salvează contactul în theMarketer cu tag-urile lui. Nu aruncă erori: nu trebuie să blocheze formularele.
 * Un contact deja abonat rămâne abonat; unul fără acord este salvat cu canalul email dezactivat.
 */
export async function syncContact({ email, name, phone, kind, marketing, tags = [] }: Sync) {
  if (!creds() || !email) return;
  const mail = email.trim().toLowerCase();
  const subscribe = kind === "client" || marketing === true;
  const allTags = [...new Set([kind, ...tags].map(slug).filter(Boolean))].join(",");
  try {
    const status = await call("status_subscriber", { email: mail }, "GET").catch((): Record<string, unknown> => ({}));
    const wasSubscribed = Array.isArray(status.subscribed) && (status.subscribed as string[]).includes("email");
    const { firstname, lastname } = split(name);
    await call("add_subscriber_sync", {
      email: mail,
      add_tags: allTags,
      channels: "email",
      ...(firstname ? { firstname } : {}),
      ...(lastname ? { lastname } : {}),
      ...(phone ? { phone } : {}),
    });
    // Fără acord și fără abonare anterioară: contactul rămâne salvat, dar nu primește marketing.
    if (!subscribe && !wasSubscribed) await call("remove_subscriber", { email: mail, channels: "email" });
  } catch (e) {
    reportError("themarketer-contact", e);
  }
}

/** Dezabonare din linkul din emailurile LUNAR: se propagă în theMarketer. */
export async function unsubscribeContact(email: string) {
  if (!creds() || !email) return;
  try {
    await call("remove_subscriber", { email: email.trim().toLowerCase(), channels: "email" });
  } catch (e) {
    reportError("themarketer-unsubscribe", e);
  }
}
