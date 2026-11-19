import { getOps } from "@/lib/admin-ops";
import { requireAdmin } from "@/lib/session";
import { date } from "@/lib/format";
import { PLAN_NAME } from "@/lib/labels";
import BroadcastForm from "@/components/app/BroadcastForm";

export const metadata = { title: "Mesaje" };
export const maxDuration = 60;

export default async function MessagesPage() {
  const d = await getOps();
  const s = await requireAdmin();
  const active = d.clients.filter((c) => c.mrrEur > 0 && !c.isDemo);
  const withMail = (ids: string[]) => ids.filter((id) => { const c = d.company.get(id); return c && !c.is_demo && (c.notify_email || c.billing_email); }).length;
  const tags = [...new Set([...d.company.values()].flatMap((c) => (c.tags as string[]) ?? []))].sort();
  const audiences = [
    { value: "active", label: "Toți clienții activi", count: withMail(active.map((c) => c.id)) },
    ...(["essential", "growth", "partner"] as const).map((p) => ({ value: `plan:${p}`, label: `Plan ${PLAN_NAME[p]}`, count: withMail(active.filter((c) => c.plan === p).map((c) => c.id)) })),
    ...tags.map((t) => ({ value: `tag:${t}`, label: `Etichetă: ${t}`, count: withMail([...d.company.values()].filter((c) => ((c.tags as string[]) ?? []).includes(t)).map((c) => c.id)) })),
  ];
  const { data: sent } = await s.supabase.from("contact_log").select("subject, created_at").eq("channel", "broadcast").order("created_at", { ascending: false }).limit(300);
  const history = new Map<string, { at: string; n: number }>();
  for (const x of sent ?? []) { const k = `${x.subject}|${String(x.created_at).slice(0, 13)}`; const v = history.get(k) ?? { at: x.created_at, n: 0 }; v.n++; history.set(k, v); }
  return (
    <div>
      <div className="topbar"><div><h1>Mesaj către clienți</h1><p>Anunțuri, mentenanță, noutăți. Fiecare client primește un email separat, în designul LUNAR, fără să vadă ceilalți destinatari. Conturile demo sunt excluse.</p></div></div>
      <div className="g g-2">
        <div className="panel"><BroadcastForm audiences={audiences} /></div>
        <div className="panel">
          <h3>Trimise</h3>
          {history.size ? [...history.entries()].slice(0, 15).map(([k, v]) => <div className="kv" key={k}><span>{k.split("|")[0]}<small style={{ display: "block", color: "var(--mute)" }}>{date(v.at, { day: "numeric", month: "short", year: "numeric" })}</small></span><b>{v.n} clienți</b></div>) : <div className="empty">Niciun mesaj trimis încă.</div>}
        </div>
      </div>
    </div>
  );
}
