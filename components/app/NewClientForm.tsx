"use client";

import { useActionState, useState } from "react";
import { Feedback } from "./forms";
import { Arrow } from "@/components/site/visuals";

type State = { ok?: string; error?: string } | null;

export default function NewClientForm({ action }: { action: (s: State, f: FormData) => Promise<State> }) {
  const [state, run, pending] = useActionState(action, null);
  const [co, setCo] = useState({ cui: "", name: "", reg_com: "", address: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function lookup() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/anaf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cui: co.cui }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setCo({ cui: j.cui, name: j.name, reg_com: j.regCom, address: j.address, phone: j.phone || co.phone });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ANAF indisponibil");
    } finally {
      setBusy(false);
    }
  }
  const bind = (k: keyof typeof co) => ({ name: k, value: co[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCo((x) => ({ ...x, [k]: e.target.value })) });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={run} className="g g-2 form-dark">
      <div className="panel">
        <h3>Firmă</h3>
        <div className="fld">
          <label htmlFor="n-cui">CUI</label>
          <div className="cui"><input id="n-cui" required {...bind("cui")} /><button type="button" className="btn-plain" onClick={lookup} disabled={busy}>{busy ? "Caut…" : "ANAF"}</button></div>
          {err && <p className="err">{err}</p>}
        </div>
        <div className="grid2">
          <div className="fld"><label htmlFor="n-name">Denumire</label><input id="n-name" required {...bind("name")} /></div>
          <div className="fld"><label htmlFor="n-reg">Nr. Reg. Com.</label><input id="n-reg" {...bind("reg_com")} /></div>
        </div>
        <div className="fld"><label htmlFor="n-addr">Adresă</label><input id="n-addr" {...bind("address")} /></div>
        <div className="grid2">
          <div className="fld"><label htmlFor="n-contact">Persoană de contact</label><input id="n-contact" name="contact" required /></div>
          <div className="fld"><label htmlFor="n-email">Email (acces portal)</label><input id="n-email" name="email" type="email" required /></div>
        </div>
        <div className="grid2">
          <div className="fld"><label htmlFor="n-phone">Telefon</label><input id="n-phone" {...bind("phone")} /></div>
          <div className="fld"><label htmlFor="n-dom">Domeniu</label><input id="n-dom" name="domain" placeholder="firma.ro" /></div>
        </div>
      </div>
      <div className="panel">
        <h3>Abonament</h3>
        <div className="grid2">
          <div className="fld"><label htmlFor="n-plan">Plan</label><select id="n-plan" name="plan" defaultValue="growth"><option value="essential">Esențial</option><option value="growth">Creștere</option><option value="partner">Partener</option></select></div>
          <div className="fld"><label htmlFor="n-cur">Monedă</label><select id="n-cur" name="currency" defaultValue="RON"><option>RON</option><option>EUR</option></select></div>
        </div>
        <div className="grid2">
          <div className="fld"><label htmlFor="n-mode">Plată</label><select id="n-mode" name="mode" defaultValue="bank_transfer"><option value="bank_transfer">Transfer bancar</option><option value="card">Card (Stripe)</option></select></div>
          <div className="fld"><label htmlFor="n-start">Data primei rate</label><input id="n-start" name="start" type="date" defaultValue={today} required /></div>
        </div>
        <div className="grid2">
          <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="brand" />Identitate vizuală</label>
          <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="local" />Vizibilitate locală</label>
        </div>
        <div className="fld"><label htmlFor="n-langs">Limbi suplimentare</label><input id="n-langs" name="langs" type="number" min={0} max={5} defaultValue={0} /></div>
        <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="first_paid" />Prima rată e deja încasată (pornește lansarea)</label>
        <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="send_welcome" defaultChecked />Trimite email de bun venit</label>
        <Feedback state={state} />
        <button className="btn btn-accent" disabled={pending} style={{ marginTop: 8 }}><span className="ic"><Arrow size={16} /></span>{pending ? "Se creează…" : "Creează clientul"}</button>
      </div>
    </form>
  );
}
