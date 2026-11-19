import Link from "next/link";
import { getOps, businessDays } from "@/lib/admin-ops";
import { date } from "@/lib/format";
import { REQ_TYPE } from "@/lib/labels";
import { Pill } from "@/components/app/charts";

export const metadata = { title: "Săptămâna" };

const addBiz = (from: Date, n: number) => { const d = new Date(from); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6 !== 0) n--; } return d; };

export default async function WeekPage() {
  const d = await getOps();
  const now = new Date();
  const end = new Date(now); end.setDate(now.getDate() + ((7 - now.getDay()) % 7)); end.setHours(23, 59, 59);
  type Item = { key: string; due: Date; kind: string; title: string; sub: string; href: string; tone: "bad" | "warn" | "acc" | "ok" };
  const items: Item[] = [];
  for (const r of d.requests.filter((x) => x.status === "new" || x.status === "in_progress")) {
    const due = addBiz(new Date(r.created_at), 2);
    items.push({ key: r.id, due, kind: REQ_TYPE[r.type] ?? "Cerere", title: `${(r.companies as unknown as { name: string } | null)?.name ?? "—"} · ${r.title}`, sub: r.status === "new" ? "nouă" : "în lucru", href: "/admin/cereri", tone: due < now ? "bad" : businessDays(now, due) <= 1 ? "warn" : "acc" });
  }
  for (const p of d.production.filter((x) => x.stage !== "live" && x.stage !== "brief")) {
    if (!p.due) continue;
    items.push({ key: p.id, due: new Date(p.due), kind: "Lansare", title: `${p.name} · etapa ${p.stage === "design" ? "Design" : p.stage === "build" ? "Dezvoltare" : "Testare"}`, sub: p.paused ? `pauză: ${p.reason}` : p.domain, href: "/admin/lansari", tone: p.tone === "bad" ? "bad" : p.tone === "warn" ? "warn" : "acc" });
  }
  for (const p of d.production.filter((x) => x.stage === "design" && x.designStatus === "changes")) {
    items.push({ key: `c${p.id}`, due: now, kind: "Design", title: `${p.name} · ajustări cerute`, sub: p.designFeedback ?? "", href: "/admin/lansari", tone: "warn" });
  }
  const sorted = items.sort((a, b) => +a.due - +b.due);
  const thisWeek = sorted.filter((i) => i.due <= end);
  const later = sorted.filter((i) => i.due > end);
  const Row = ({ i }: { i: Item }) => (
    <div className="req" style={{ gridTemplateColumns: "90px 1fr auto" }}>
      <span className="mono" style={{ fontSize: 12, color: i.tone === "bad" ? "#FF8A80" : "var(--mute)" }}>{i.due < now ? "depășit" : date(i.due.toISOString(), { weekday: "short", day: "numeric", month: "short" })}</span>
      <div><Link href={i.href}>{i.title}</Link><small>{i.kind} · {i.sub}</small></div>
      <Pill tone={i.tone}>{i.kind}</Pill>
    </div>
  );
  return (
    <div>
      <div className="topbar"><div><h1>Coada săptămânii</h1><p>Cereri (termen 48h lucrătoare) și lansări, ordonate după termen. {thisWeek.length} până duminică.</p></div></div>
      <div className="panel"><h3>Săptămâna aceasta</h3>{thisWeek.length ? thisWeek.map((i) => <Row i={i} key={i.key} />) : <div className="empty">Nimic programat până duminică.</div>}</div>
      <div className="panel" style={{ marginTop: 12 }}><h3>Mai departe</h3>{later.length ? later.map((i) => <Row i={i} key={i.key} />) : <div className="empty">—</div>}</div>
    </div>
  );
}
