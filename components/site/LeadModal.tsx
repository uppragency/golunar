"use client";

import { useState } from "react";
import type { PlanCode } from "@/lib/plans";
import { Arrow } from "./visuals";

export function LeadModal({ open, onClose, plan }: { open: boolean; onClose: () => void; plan: PlanCode }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, plan }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Mesajul nu a putut fi trimis");
      setOk(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Eroare");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`modal${open ? " on" : ""}`} role="dialog" aria-modal="true" aria-label="Discuție gratuită" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" style={{ position: "relative", gridTemplateColumns: "1fr", width: "min(560px,100%)" }} onSubmit={submit}>
        <div className="f">
          <span className="eyebrow">Discuție gratuită · 20 min</span>
          <h3 style={{ marginTop: 14 }}>Hai să vorbim despre site-ul tău</h3>
          <p style={{ color: "var(--inkmute)", fontSize: 14, marginBottom: 20 }}>Îți propunem 2 intervale pe Google Meet în maximum o zi lucrătoare.</p>
          {ok ? (
            <div className="lead-ok">Am primit cererea. Revenim pe email în cel mult o zi lucrătoare.</div>
          ) : (
            <>
              <div className="grid2">
                <div className="fld"><label htmlFor="ld-name">Nume</label><input id="ld-name" name="name" required autoComplete="name" /></div>
                <div className="fld"><label htmlFor="ld-co">Firmă</label><input id="ld-co" name="company" autoComplete="organization" /></div>
              </div>
              <div className="grid2">
                <div className="fld"><label htmlFor="ld-email">Email</label><input id="ld-email" name="email" type="email" required autoComplete="email" /></div>
                <div className="fld"><label htmlFor="ld-phone">Telefon</label><input id="ld-phone" name="phone" type="tel" autoComplete="tel" /></div>
              </div>
              <div className="fld"><label htmlFor="ld-msg">Ce face afacerea ta?</label><textarea id="ld-msg" name="message" rows={4} placeholder="Ex: clinică stomatologică în Iași, avem site vechi din 2018" /></div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden="true" />
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn btn-ink" style={{ width: "100%", justifyContent: "space-between", marginTop: 8 }} disabled={busy}>
                <span className="ic"><Arrow /></span><span>{busy ? "Se trimite…" : "Trimite"}</span><span style={{ width: 8 }} />
              </button>
            </>
          )}
        </div>
        <button type="button" className="x" style={{ background: "rgba(0,0,0,.08)", color: "var(--ink)" }} onClick={onClose} aria-label="Închide">✕</button>
      </form>
    </div>
  );
}
