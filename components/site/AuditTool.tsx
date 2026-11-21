"use client";

import { track } from "@/lib/track";
import { mkCustom, mkIdentify } from "@/lib/mktr";
import { useEffect, useState } from "react";
import { Arrow } from "./visuals";

type Check = { id: string; label: string; ok: boolean; detail?: string };
type Result = {
  finalUrl: string;
  psi: boolean;
  scores: { performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null };
  metrics: { lcp?: string; cls?: string; tbt?: string; fcp?: string; ttfbMs?: number; htmlKb?: number };
  checks: Check[];
  opportunities: string[];
  screenshot: string | null;
};

const STEPS = ["Deschidem site-ul pe un telefon simulat", "Măsurăm viteza de încărcare", "Verificăm SEO și structura paginii", "Pregătim raportul"];

function Gauge({ label, value, note }: { label: string; value: number | null; note?: string }) {
  const tone = value == null ? "na" : value >= 90 ? "ok" : value >= 50 ? "mid" : "bad";
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className={`gauge ${tone}`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={r} className="bg" />
        <circle cx="40" cy="40" r={r} className="fg" strokeDasharray={c} strokeDashoffset={value == null ? c : c * (1 - value / 100)} />
      </svg>
      <b>{value ?? "—"}</b>
      <span>{label}{note ? <small>{note}</small> : null}</span>
    </div>
  );
}

export default function AuditTool() {
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<{ result: Result; issues: string[] } | null>(null);

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 6000);
    return () => clearInterval(t);
  }, [busy]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Auditul nu a putut fi realizat.");
      setRes(j);
      track("generate_lead", { lead_source: "audit" });
      mkIdentify(String(data.email ?? ""), String(data.name ?? ""));
      mkCustom("lead_audit", String(data.email ?? ""), { url: String(data.url ?? "") });
      requestAnimationFrame(() => document.getElementById("rezultat")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Eroare");
    } finally {
      setBusy(false);
    }
  }

  const r = res?.result;
  return (
    <>
      <form className="audit-form card form-dark" onSubmit={submit} aria-busy={busy}>
        <div className="fld audit-url">
          <label htmlFor="au-url">Adresa site-ului</label>
          <input id="au-url" name="url" placeholder="firmata.ro" required inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false} />
        </div>
        <div className="grid2">
          <div className="fld"><label htmlFor="au-name">Numele tău</label><input id="au-name" name="name" required autoComplete="name" /></div>
          <div className="fld"><label htmlFor="au-email">Email pentru raport</label><input id="au-email" name="email" type="email" required autoComplete="email" /></div>
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
        <label className="check mk-opt"><input type="checkbox" name="marketing" value="1" /><span>Vreau și 5 emailuri scurte cu sfaturi și oferte LUNAR, în 14 zile. Mă pot dezabona oricând.</span></label>
        <p className="audit-note">Primești raportul și pe email. Te putem contacta o singură dată despre rezultate. <a href="/legal/confidentialitate">Confidențialitate</a></p>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn btn-accent" disabled={busy}><span className="ic"><Arrow /></span>{busy ? "Analizăm…" : "Pornește auditul gratuit"}</button>
        {busy && (
          <ol className="audit-steps" aria-live="polite">
            {STEPS.map((s, i) => <li key={s} className={i < step ? "done" : i === step ? "on" : ""}>{s}</li>)}
          </ol>
        )}
      </form>

      {r && res && (
        <section id="rezultat" className="audit-res" aria-label="Rezultatul auditului">
          <div className="audit-head">
            <div>
              <div className="eyebrow">Rezultat · mobil</div>
              <h2>{new URL(r.finalUrl).hostname}</h2>
              <p className="muted">{r.psi ? "Măsurat cu Google Lighthouse, pe un telefon simulat cu conexiune 4G." : "Viteza detaliată Google nu a fost disponibilă acum. Scorul SEO este estimat din verificările noastre."}</p>
            </div>
            {r.screenshot && <img className="audit-shot" src={r.screenshot} alt={`Captură pe mobil a site-ului ${new URL(r.finalUrl).hostname}`} width={180} height={320} />}
          </div>
          <div className="gauges">
            {r.psi && <Gauge label="Viteză" value={r.scores.performance} />}
            <Gauge label="SEO" value={r.scores.seo} note={r.psi ? undefined : "estimat"} />
            {r.psi && <Gauge label="Accesibilitate" value={r.scores.accessibility} />}
            {r.psi && <Gauge label="Bune practici" value={r.scores.bestPractices} />}
          </div>
          {(r.metrics.lcp || r.metrics.ttfbMs) && (
            <div className="audit-metrics">
              {r.metrics.lcp && <div><span>Conținut principal (LCP)</span><b>{r.metrics.lcp}</b></div>}
              {r.metrics.tbt && <div><span>Timp de blocare</span><b>{r.metrics.tbt}</b></div>}
              {r.metrics.cls && <div><span>Stabilitate (CLS)</span><b>{r.metrics.cls}</b></div>}
              {r.metrics.ttfbMs != null && <div><span>Răspuns server</span><b>{r.metrics.ttfbMs} ms</b></div>}
            </div>
          )}
          {res.issues.length > 0 && (
            <div className="audit-fix">
              <h3>Ce aș repara întâi</h3>
              <ol>{res.issues.map((i) => <li key={i}>{i}</li>)}</ol>
            </div>
          )}
          <h3 className="audit-h">Toate verificările</h3>
          <ul className="audit-checks">
            {r.checks.map((c) => (
              <li key={c.id} className={c.ok ? "ok" : "bad"}>
                <i aria-hidden="true" />
                <div><b>{c.label}</b>{c.detail && <span>{c.detail}</span>}</div>
                <em className="sr-only">{c.ok ? "trecut" : "de reparat"}</em>
              </li>
            ))}
          </ul>
          <div className="audit-cta">
            <p>Vrei problemele rezolvate? Începi cu 4,99 lei în prima lună. <a href="/?discutie=1" className="inl">Sau discutăm rezultatele, gratuit.</a></p>
            <a href="/?comanda=1" className="btn btn-accent"><span className="ic"><Arrow /></span>Comandă website cu 4,99 lei</a>
          </div>
        </section>
      )}
    </>
  );
}
