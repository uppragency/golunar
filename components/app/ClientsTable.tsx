"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientRow } from "@/lib/admin-data";

const TONE: Record<string, string> = { Activ: "ok", Restant: "bad", Lansare: "warn", Proprietar: "acc", Anulat: "" };
const FILTERS = [["all", "Toți"], ["Activ", "Activi"], ["Restant", "Restanți"], ["Lansare", "În lansare"], ["Proprietar", "Proprietari"], ["Anulat", "Anulați"]] as const;

export default function ClientsTable({ rows, impr = {}, tags = {}, health = {} }: { rows: ClientRow[]; impr?: Record<string, { used: number; included: number }>; tags?: Record<string, string[]>; health?: Record<string, { score: number; reasons: string[] }> }) {
  const [tag, setTag] = useState("");
  const allTags = useMemo(() => [...new Set(Object.values(tags).flat())].sort(), [tags]);
  const [f, setF] = useState<string>("all");
  const [q, setQ] = useState("");
  const router = useRouter();
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows
      .filter((c) => f === "all" || c.status === f)
      .filter((c) => !tag || (tags[c.id] ?? []).includes(tag))
      .filter((c) => !t || [c.name, c.cui, c.domain].some((v) => v.toLowerCase().includes(t)))
      .sort((a, b) => b.mrrEur - a.mrrEur);
  }, [rows, f, q, tag, tags]);
  const fmt = (v: number, cur: string) => v.toLocaleString("ro-RO") + (cur === "EUR" ? " €" : " lei");
  return (
    <>
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap", marginBottom: 12 }}>
        <div className="filters">
          {FILTERS.map(([k, l]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{l} · {k === "all" ? rows.length : rows.filter((r) => r.status === k).length}</button>)}
        </div>
        {allTags.length > 0 && <select className="search" style={{ maxWidth: 200 }} value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Etichetă"><option value="">Toate etichetele</option>{allTags.map((t) => <option key={t} value={t}>{t}</option>)}</select>}
        <input className="search" placeholder="Caută firmă, CUI, domeniu" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Caută" />
      </div>
      <div className="panel"><div className="tbl"><table>
        <thead><tr><th>Client</th><th>Domeniu</th><th>Plan</th><th className="r">MRR</th><th>Rată</th><th title="Îmbunătățiri folosite luna aceasta din cele incluse">Îmbun.</th><th>Plată</th><th>Următoarea</th><th title="Scor de sănătate 0–100">Sănătate</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} className="row-link" onClick={() => router.push(`/admin/clienti/${c.id}`)}>
              <td><b style={{ fontWeight: 500 }}>{c.name}</b>{c.isDemo && <span className="pill" style={{ marginLeft: 8, height: 20 }}>demo</span>}{(tags[c.id] ?? []).length > 0 && <div>{tags[c.id].map((t) => <span className="tagpill" key={t}>{t}</span>)}</div>}</td>
              <td className="muted">{c.domain}</td><td>{c.planName}</td><td className="r">{fmt(c.mrr, c.currency)}</td>
              <td className="mono">{c.paid}/12{c.ownerDone ? " ✓" : ""}</td>
              <td>{impr[c.id]?.included ? <span className={`impr${impr[c.id].used > impr[c.id].included ? " over" : impr[c.id].used === impr[c.id].included ? " full" : ""}`}>{impr[c.id].used}/{impr[c.id].included}</span> : <span className="muted">—</span>}</td><td>{c.mode === "card" ? "Card" : "Transfer"}</td>
              <td>{c.status === "Restant" ? "Restant" : c.nextDue ? new Date(c.nextDue).toLocaleDateString("ro-RO", { day: "numeric", month: "short" }) : "—"}</td>
              <td>{health[c.id] ? <span className={`hs ${health[c.id].score >= 80 ? "g" : health[c.id].score >= 60 ? "m" : "b"}`} title={health[c.id].reasons.join(" · ") || "Totul în regulă"}>{health[c.id].score}</span> : <span className="muted">—</span>}</td>
              <td><span className={`pill ${TONE[c.status]}`}><span className="d" />{c.status}</span></td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={10} className="muted" style={{ textAlign: "center", padding: 28 }}>Niciun client.</td></tr>}
        </tbody>
      </table></div></div>
    </>
  );
}
