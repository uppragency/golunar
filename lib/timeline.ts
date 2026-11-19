type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type TlEvent = { at: string; title: string; sub?: string; tone: "" | "acc" | "ok" | "bad" };

const TPL: Record<string, string> = {
  welcome: "Email de bun venit", bank_order: "Email cu datele de plată", order_reminder_1: "Reamintire plată comandă (ziua 2)", order_reminder_2: "Reamintire plată comandă (ziua 5)",
  order_reminder_manual: "Reamintire plată trimisă manual", order_expired: "Email: comandă expirată", brief_reminder_1: "Reamintire brief (48h)", brief_reminder_2: "Reamintire brief (96h)",
  brief_reminder_manual: "Reamintire brief trimisă manual", free_month: "Email: lună gratuită (garanție)", overdue_1: "Reamintire rată restantă (ziua 1)", overdue_5: "Reamintire rată restantă (ziua 5)",
  overdue_10: "Reamintire rată restantă (ziua 10)", monthly_report: "Raport lunar trimis", upgrade_offer: "Propunere de upgrade trimisă", request_received: "Confirmare cerere",
};
const STAGE: Record<string, string> = { brief: "brief", design: "design", build: "dezvoltare", qa: "testare", live: "lansat" };

/** Toate evenimentele unui client, de la cel mai recent. */
export function buildTimeline({ company, subs, inst, reqs, mails, brief, launch, notes }: { company: Row; subs: Row[]; inst: Row[]; reqs: Row[]; mails: Row[]; brief: Row | null; launch: Row | null; notes: Row[] }): TlEvent[] {
  const e: TlEvent[] = [{ at: company.created_at, title: "Cont de firmă creat", tone: "" }];
  for (const s of subs) {
    e.push({ at: s.created_at, title: `Comandă plasată · plan ${({ essential: "Esențial", growth: "Creștere", partner: "Partener" } as Record<string, string>)[s.plan] ?? s.plan}`, sub: s.payment_mode === "card" ? "card" : "transfer bancar", tone: "acc" });
    if (s.canceled_at) e.push({ at: s.canceled_at, title: "Abonament anulat", sub: s.cancel_reason ?? undefined, tone: "bad" });
  }
  for (const i of inst) if (i.paid_at) e.push({ at: i.paid_at, title: `Rata ${i.number} din 12 încasată`, sub: `${(+i.amount_net).toFixed(2)} ${i.currency === "EUR" ? "€" : "lei"}${i.method ? ` · ${i.method}` : ""}`, tone: "ok" });
  for (const r of reqs) {
    e.push({ at: r.created_at, title: `Cerere: ${r.title}`, tone: "" });
    if (r.delivered_at) e.push({ at: r.delivered_at, title: `Cerere livrată: ${r.title}`, tone: "ok" });
  }
  for (const m of mails) e.push({ at: m.sent_at, title: TPL[m.template] ?? `Email: ${m.template}`, sub: m.status === "sent" ? m.to_email : "eșuat", tone: m.status === "sent" ? "" : "bad" });
  if (brief?.submitted_at) e.push({ at: brief.submitted_at, title: "Brief trimis", tone: "acc" });
  if (launch?.stage_changed_at && launch.stage !== "brief") e.push({ at: launch.stage_changed_at, title: `Producție: etapa ${STAGE[launch.stage] ?? launch.stage}`, tone: launch.stage === "live" ? "ok" : "acc" });
  if (launch?.free_month_applied_at) e.push({ at: launch.free_month_applied_at, title: "Lună gratuită acordată (întârziere lansare)", tone: "bad" });
  for (const n of notes) e.push({ at: n.created_at, title: "Notiță internă", sub: String(n.body).slice(0, 80), tone: "" });
  return e.filter((x) => x.at).sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
