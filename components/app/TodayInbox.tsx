import Link from "next/link";
import type { getOps } from "@/lib/admin-ops";
import { money } from "@/lib/format";
import { PLAN_NAME } from "@/lib/labels";
import { markInstallmentPaid, sendUpgradeOffer } from "@/app/admin/actions";

type Ops = Awaited<ReturnType<typeof getOps>>;
type Item = { key: string; href: string; title: string; sub: string; tone: "bad" | "warn" | "acc" | "ok"; action?: React.ReactNode };

/** Un singur ecran cu tot ce cere atenție azi, grupat pe tipuri. */
export default function TodayInbox({ d }: { d: Ops }) {
  const groups: { title: string; items: Item[] }[] = [
    { title: "Plăți de confirmat", items: [
      ...d.orders.map((o) => ({ key: o.subId, href: "/admin/comenzi", title: `${o.name} · ${o.reference}`, sub: `${money(o.amount, o.currency, 2)} · comandă de acum ${o.age} ${o.age === 1 ? "zi" : "zile"}`, tone: (o.expiresIn <= 3 ? "bad" : "warn") as Item["tone"],
        action: o.installmentId ? <form action={markInstallmentPaid}><input type="hidden" name="id" value={o.installmentId} /><input type="hidden" name="method" value="Transfer" /><button className="btn-plain sm acc">Confirmă</button></form> : null })),
      ...d.unmatched.map((t) => ({ key: t.id, href: "/admin/incasari", title: `${t.payer_name} · transfer neidentificat`, sub: `${money(+t.amount, t.currency, 2)} · ${t.reference ?? "fără referință"}`, tone: "warn" as const })),
    ] },
    { title: "Rate restante", items: d.overdue.map((o) => ({ key: o.id, href: `/admin/clienti/${o.companyId}`, title: `${o.name} · rata ${o.number}`, sub: `${money(o.amount, o.currency, 2)} · întârziere ${o.late} ${o.late === 1 ? "zi" : "zile"} · ${o.reminders} reamintiri`, tone: (o.late >= 10 ? "bad" : "warn") as Item["tone"],
      action: <form action={markInstallmentPaid}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="method" value="Transfer" /><button className="btn-plain sm acc">Încasată</button></form> })) },
    { title: "Cereri noi", items: d.newRequests.map((r) => ({ key: r.id, href: "/admin/cereri", title: `${(r.companies as unknown as { name: string } | null)?.name ?? "—"} · ${r.title}`, sub: new Date(r.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), tone: "acc" as const })) },
    { title: "Producție", items: [
      ...d.freshBriefs.map((p) => ({ key: `b${p.id}`, href: "/admin/lansari", title: `${p.name} · brief primit`, sub: `termen ${p.due ? new Date(p.due).toLocaleDateString("ro-RO", { day: "numeric", month: "short" }) : "—"}`, tone: "acc" as const })),
      ...d.production.filter((p) => p.tone === "bad" || p.tone === "warn").map((p) => ({ key: p.id, href: "/admin/lansari", title: `${p.name} · ${p.left! < 0 ? `întârziat ${-p.left!} z` : `${p.left} zile rămase`}`, sub: p.paused ? `pauză: ${p.reason}` : p.domain, tone: (p.tone === "bad" ? "bad" : "warn") as Item["tone"] })),
      ...d.missingBrief.filter((p) => p.briefHours >= 48).map((p) => ({ key: `m${p.id}`, href: "/admin/lansari", title: `${p.name} · brief lipsă`, sub: `plătit acum ${Math.floor(p.briefHours / 24)} zile · ${p.briefReminders} reamintiri`, tone: "warn" as const })),
    ] },
    { title: "Site-uri", items: d.sites.filter((w) => w.issues.length).map((w) => ({ key: w.id, href: "/admin/tehnic", title: `${w.domain}`, sub: w.issues.join(" · "), tone: (w.down || w.issues.some((x) => x.startsWith("SSL") || x.startsWith("HTTP")) ? "bad" : "warn") as Item["tone"] })) },
    { title: "Oportunități", items: [
      ...d.upgrades.map((c) => ({ key: `u${c.id}`, href: `/admin/clienti/${c.id}`, title: `${c.name} · upgrade la ${PLAN_NAME[c.to]}`, sub: `${c.per[0]} îmbunătățiri luna aceasta, planul include ${c.incl}${c.offered ? " · ofertă trimisă" : ""}`, tone: "ok" as const,
        action: c.offered ? null : <form action={sendUpgradeOffer}><input type="hidden" name="company_id" value={c.id} /><input type="hidden" name="from" value={c.plan} /><input type="hidden" name="to" value={c.to} /><input type="hidden" name="used" value={c.per[0]} /><button className="btn-plain sm">Propune</button></form> })),
      ...d.nearOwnership.map((c) => ({ key: `o${c.id}`, href: `/admin/clienti/${c.id}`, title: `${c.name} · ${c.paid}/12 rate`, sub: `devine proprietar în ${c.left} ${c.left === 1 ? "lună" : "luni"}: propune continuarea mentenanței`, tone: "ok" as const })),
    ] },
  ];
  const total = groups.reduce((a, g) => a + g.items.length, 0);
  return (
    <div className="panel today">
      <h3>De făcut azi <span className="muted" style={{ fontWeight: 400 }}>{total ? `${total} ${total === 1 ? "lucru" : "lucruri"}` : "nimic urgent"}</span></h3>
      {total ? (
        <div className="today-g">
          {groups.filter((g) => g.items.length).map((g) => (
            <section key={g.title}>
              <h4>{g.title}<span>{g.items.length}</span></h4>
              {g.items.slice(0, 6).map((i) => (
                <div className={`ti ${i.tone}`} key={i.key}>
                  <Link href={i.href}><b>{i.title}</b><small>{i.sub}</small></Link>
                  {i.action}
                </div>
              ))}
              {g.items.length > 6 && <small className="muted">și încă {g.items.length - 6}</small>}
            </section>
          ))}
        </div>
      ) : <div className="empty">Totul e la zi.</div>}
    </div>
  );
}
