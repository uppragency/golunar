import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { date } from "@/lib/format";

export const metadata = { title: "Căutare" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw = "" } = await searchParams;
  const q = raw.replace(/[^\p{L}\p{N}@._ -]/gu, "").trim().slice(0, 80);
  const s = await requireAdmin();
  const db = s.supabase;
  const like = `%${q}%`;
  const star = `*${q.replace(/\s+/g, "*")}*`;
  const [byCo, bySite, byLead] = q.length < 2 ? [{ data: [] }, { data: [] }, { data: [] }] : await Promise.all([
    db.from("companies").select("id, name, cui, bank_reference, billing_email, notify_email, phone").or(`name.ilike.${star},cui.ilike.${star},bank_reference.ilike.${star},billing_email.ilike.${star},notify_email.ilike.${star},phone.ilike.${star},legal_rep.ilike.${star}`).limit(20),
    db.from("websites").select("company_id, domain, companies(name)").ilike("domain", like).limit(20),
    db.from("leads").select("id, name, email, company, source, created_at").or(`name.ilike.${star},email.ilike.${star},company.ilike.${star},phone.ilike.${star}`).order("created_at", { ascending: false }).limit(20),
  ]);
  const clients = new Map<string, { id: string; name: string; sub: string }>();
  for (const c of byCo.data ?? []) clients.set(c.id, { id: c.id, name: c.name, sub: [c.cui, c.bank_reference, c.notify_email || c.billing_email, c.phone].filter(Boolean).join(" · ") });
  for (const w of (bySite.data ?? []) as unknown as { company_id: string; domain: string; companies: { name: string } | null }[]) if (!clients.has(w.company_id)) clients.set(w.company_id, { id: w.company_id, name: w.companies?.name ?? "—", sub: w.domain });
  const list = [...clients.values()];
  if (list.length === 1 && !(byLead.data ?? []).length) redirect(`/admin/clienti/${list[0].id}`);
  return (
    <div>
      <div className="topbar"><div><h1>Căutare</h1><p>Firmă, CUI, email, telefon, număr comandă LNR-xxxx sau domeniu.</p></div></div>
      <form action="/admin/cauta" className="gsearch"><input name="q" defaultValue={q} autoFocus placeholder="Caută" aria-label="Căutare globală" /><button className="btn-plain sm">Caută</button></form>
      <div className="g g-2">
        <div className="panel">
          <h3>Clienți · {list.length}</h3>
          {list.length ? list.map((c) => <div className="req" key={c.id}><div><Link href={`/admin/clienti/${c.id}`}>{c.name}</Link><small>{c.sub}</small></div></div>) : <div className="empty">{q.length < 2 ? "Scrie cel puțin 2 caractere." : "Niciun client găsit."}</div>}
        </div>
        <div className="panel">
          <h3>Lead-uri · {(byLead.data ?? []).length}</h3>
          {(byLead.data ?? []).length ? (byLead.data ?? []).map((l) => <div className="req" key={l.id}><div><Link href="/admin/lead-uri?s=all">{l.name}{l.company ? ` · ${l.company}` : ""}</Link><small>{l.email} · {l.source} · {date(l.created_at, { day: "numeric", month: "short" })}</small></div></div>) : <div className="empty">Niciun lead găsit.</div>}
        </div>
      </div>
    </div>
  );
}
