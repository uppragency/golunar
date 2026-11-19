import Link from "next/link";
import { getOps } from "@/lib/admin-ops";
import { money } from "@/lib/format";

export const metadata = { title: "Calendar" };

type Ev = { day: string; label: string; href: string; tone: "ok" | "warn" | "bad" | "acc" | "" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const d = await getOps();
  const { m } = await searchParams;
  const now = new Date();
  const [y, mo] = /^\d{4}-\d{2}$/.test(m ?? "") ? m!.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const key = (dt: Date) => dt.toISOString().slice(0, 10);
  const inMonth = (iso: string | null | undefined) => Boolean(iso && iso.slice(0, 7) === `${y}-${String(mo).padStart(2, "0")}`);
  const name = (id: string) => d.company.get(id)?.name ?? "—";
  const demo = (id: string) => Boolean(d.company.get(id)?.is_demo);
  const today = key(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));

  const ev: Ev[] = [];
  for (const i of d.installmentsAll) {
    if (!inMonth(i.due_date) || demo(i.company_id)) continue;
    const late = i.status !== "paid" && i.due_date < today;
    ev.push({ day: i.due_date, label: `${name(i.company_id)} · rata ${i.number} · ${money(i.amount_net, i.currency as "RON" | "EUR")}`, href: `/admin/clienti/${i.company_id}`, tone: i.status === "paid" ? "ok" : late ? "bad" : "acc" });
  }
  for (const p of d.production) if (p.due && inMonth(p.due) && p.stage !== "live") ev.push({ day: p.due.slice(0, 10), label: `Lansare · ${p.name}`, href: "/admin/lansari", tone: p.tone === "bad" ? "bad" : "warn" });
  for (const w of d.sites) {
    if (inMonth(w.domain_expires_at)) ev.push({ day: String(w.domain_expires_at).slice(0, 10), label: `Domeniu expiră · ${w.domain}`, href: "/admin/tehnic", tone: "bad" });
    if (inMonth(w.ssl_expires_at)) ev.push({ day: String(w.ssl_expires_at).slice(0, 10), label: `SSL expiră · ${w.domain}`, href: "/admin/tehnic", tone: "warn" });
  }

  const startPad = (first.getUTCDay() + 6) % 7; // luni = 0
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((startPad + days) / 7) * 7 }, (_, i) => {
    const dn = i - startPad + 1;
    return dn >= 1 && dn <= days ? key(new Date(Date.UTC(y, mo - 1, dn))) : null;
  });
  const prev = `${mo === 1 ? y - 1 : y}-${String(mo === 1 ? 12 : mo - 1).padStart(2, "0")}`;
  const next = `${mo === 12 ? y + 1 : y}-${String(mo === 12 ? 1 : mo + 1).padStart(2, "0")}`;
  const due = ev.filter((e) => e.tone === "acc" || e.tone === "bad").length;
  return (
    <div>
      <div className="topbar">
        <div><h1 style={{ textTransform: "capitalize" }}>{first.toLocaleDateString("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" })}</h1><p>Rate de încasat, lansări, domenii și certificate SSL care expiră. {due} evenimente de urmărit.</p></div>
        <div className="tb-r"><Link className="btn-plain" href={`?m=${prev}`}>←</Link><Link className="btn-plain" href="?">Azi</Link><Link className="btn-plain" href={`?m=${next}`}>→</Link></div>
      </div>
      <div className="cal">
        {["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"].map((x) => <div className="cal-h" key={x}>{x}</div>)}
        {cells.map((c, i) => (
          <div className={`cal-d${c === today ? " now" : ""}${c ? "" : " off"}`} key={i}>
            {c && <span className="cal-n">{Number(c.slice(8))}</span>}
            {c && ev.filter((e) => e.day === c).slice(0, 4).map((e, k) => <Link key={k} href={e.href} className={`cal-e ${e.tone}`} title={e.label}>{e.label}</Link>)}
            {c && ev.filter((e) => e.day === c).length > 4 && <small className="muted">+{ev.filter((e) => e.day === c).length - 4}</small>}
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Verde: încasată · portocaliu: de încasat · roșu: restantă sau expiră · galben: lansare sau SSL.</p>
    </div>
  );
}
