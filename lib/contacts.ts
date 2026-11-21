import "server-only";
import { Resend } from "resend";
import { reportError } from "@/lib/report";

/** Segmentele din Resend (Audience → Segments). */
const SEGMENT = {
  lead: process.env.RESEND_SEGMENT_LEADS || "15057e4d-f6ee-4ca8-b272-86fe9c3002b6",
  client: process.env.RESEND_SEGMENT_CLIENTS || "edada754-bbad-4efb-9354-fe6422899813",
} as const;

type Sync = {
  email: string;
  name?: string | null;
  kind: "lead" | "client";
  /** Lead: bifa de acord pentru emailuri de marketing. Clienții sunt abonați implicit (relație contractuală existentă, cu dezabonare în fiecare email). */
  marketing?: boolean;
};

const split = (name?: string | null) => {
  const p = (name || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: p[0] || undefined, lastName: p.slice(1).join(" ") || undefined };
};

/**
 * Adaugă sau actualizează contactul în Resend și îl pune în segmentul potrivit.
 * Un client iese din segmentul Lead-uri. Nu abonează niciodată din nou pe cineva care s-a dezabonat,
 * cu excepția unei bife noi și explicite de acord. Nu aruncă erori: nu trebuie să blocheze formularele.
 */
export async function syncContact({ email, name, kind, marketing }: Sync) {
  const key = process.env.RESEND_CONTACTS_API_KEY || process.env.RESEND_API_KEY;
  if (!key || !email) return;
  const resend = new Resend(key);
  const mail = email.trim().toLowerCase();
  const { firstName, lastName } = split(name);
  const subscribed = kind === "client" || marketing === true;
  try {
    const existing = await resend.contacts.get({ email: mail });
    const created = existing.data ? null : await resend.contacts.create({
      email: mail, firstName, lastName, unsubscribed: !subscribed, segments: [{ id: SEGMENT[kind] }],
    });
    if (!created || created.error) {
      // Contactul există deja: actualizăm numele, segmentul și (doar la acord nou) abonarea.
      // Starea de abonare existentă nu se schimbă altfel (un client care completează formularul rămâne abonat, un dezabonat rămâne dezabonat).
      const upd = await resend.contacts.update({
        email: mail,
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(marketing === true ? { unsubscribed: false } : {}),
      });
      if (upd.error) throw new Error(`${created?.error?.message ?? "exists"} / ${upd.error.message}`);
      const add = await resend.contacts.segments.add({ email: mail, segmentId: SEGMENT[kind] });
      if (add.error && !/already/i.test(add.error.message)) throw new Error(add.error.message);
    }
    if (kind === "client") await resend.contacts.segments.remove({ email: mail, segmentId: SEGMENT.lead }).catch(() => null);
  } catch (e) {
    reportError("resend-contact", e);
  }
}

/** Dezabonare din linkul din email: marcăm contactul și în Resend, ca broadcast-urile să îl excludă. */
export async function unsubscribeContact(email: string) {
  const key = process.env.RESEND_CONTACTS_API_KEY || process.env.RESEND_API_KEY;
  if (!key || !email) return;
  try {
    const r = await new Resend(key).contacts.update({ email: email.trim().toLowerCase(), unsubscribed: true });
    if (r.error && !/not.?found/i.test(r.error.message)) throw new Error(r.error.message);
  } catch (e) {
    reportError("resend-unsubscribe", e);
  }
}
