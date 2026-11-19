"use client";

import { useEffect, useMemo, useState } from "react";
import { PLANS, type Currency, type PlanCode } from "@/lib/plans";

const RATE = 5.09;
const fmt = (v: number, cur: Currency) => Math.round(v).toLocaleString("ro-RO") + (cur === "EUR" ? " €" : " lei");

type Inputs = { dev: number; hosting: number; maint: number; hours: number; hourly: number; vat: boolean; plan: PlanCode };
const DEFAULT_EUR: Inputs = { dev: 2500, hosting: 180, maint: 360, hours: 2, hourly: 35, vat: false, plan: "growth" };

export default function CostCalculator() {
  const [cur, setCur] = useState<Currency>("RON");
  const [v, setV] = useState<Inputs>(DEFAULT_EUR);

  useEffect(() => {
    try {
      const c = localStorage.getItem("lunar_cur");
      if (c === "EUR" || c === "RON") setCur(c);
    } catch {}
  }, []);

  const k = cur === "EUR" ? 1 : RATE; // inputs are stored in EUR, displayed in the chosen currency
  const r = useMemo(() => {
    const vat = v.vat ? 1.21 : 1;
    const yearlyRecurring = (v.hosting + v.maint + v.hours * v.hourly * 12) * vat;
    const one = [1, 2, 3].map((y) => v.dev * vat + yearlyRecurring * y);
    const monthly = cur === "EUR" ? PLANS[v.plan].eur : PLANS[v.plan].ron / RATE;
    const sub = [1, 2, 3].map((y) => monthly * 12 * y);
    return { one, sub, monthly, yearlyRecurring };
  }, [v, cur]);

  const set = <K extends keyof Inputs>(key: K, val: Inputs[K]) => setV((x) => ({ ...x, [key]: val }));
  const max = Math.max(r.one[2], r.sub[2]);
  const diff = r.one[2] - r.sub[2];
  const breakEven = (() => {
    for (let m = 1; m <= 60; m++) {
      const o = v.dev * (v.vat ? 1.21 : 1) + (r.yearlyRecurring / 12) * m;
      if (r.monthly * m > o) return m;
    }
    return null;
  })();


  return (
    <div className="calc wide-block" id="calculator">
      <div className="panel form-dark">
        <h3>Website cu plată unică <span className="seg" aria-label="Monedă">
          <button className={cur === "RON" ? "on" : ""} onClick={() => setCur("RON")}>lei</button>
          <button className={cur === "EUR" ? "on" : ""} onClick={() => setCur("EUR")}>€</button>
        </span></h3>
        <Rng k={k} cur={cur} onSet={set} id="dev" label="Cost de dezvoltare" min={500} maxv={8000} step={100} value={v.dev} />
        <Rng k={k} cur={cur} onSet={set} id="hosting" label="Hosting, domeniu, SSL · pe an" min={0} maxv={1000} step={10} value={v.hosting} />
        <Rng k={k} cur={cur} onSet={set} id="maint" label="Mentenanță, actualizări, backup · pe an" min={0} maxv={2000} step={20} value={v.maint} />
        <div className="row2">
          <Rng k={k} cur={cur} onSet={set} id="hours" label="Modificări" min={0} maxv={10} step={0.5} value={v.hours} unit="h" />
          <Rng k={k} cur={cur} onSet={set} id="hourly" label="Tarif orar" min={15} maxv={80} step={1} value={v.hourly} />
        </div>
        <label className="check" style={{ color: "var(--mute)", marginTop: 0 }}>
          <input type="checkbox" checked={v.vat} onChange={(e) => set("vat", e.target.checked)} />
          <span>Agenția adaugă TVA 21%, iar firma mea nu îl poate deduce</span>
        </label>
        <div className="fld" style={{ marginTop: 8 }}>
          <label htmlFor="c-plan">Comparat cu abonamentul LUNAR</label>
          <select id="c-plan" value={v.plan} onChange={(e) => set("plan", e.target.value as PlanCode)}>
            {(Object.keys(PLANS) as PlanCode[]).map((p) => (
              <option key={p} value={p}>{PLANS[p].name} · {cur === "EUR" ? `${PLANS[p].eur} €` : `${PLANS[p].ron} lei`} / lună · {PLANS[p].improvements} {PLANS[p].improvements === 1 ? "îmbunătățire" : "îmbunătățiri"}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel" aria-live="polite">
        <h3>Costul total pe 3 ani</h3>
        <div className="g g-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div><span className="muted" style={{ fontSize: 13 }}>Plată unică</span><div className="big">{fmt(r.one[2] * k, cur)}</div></div>
          <div><span className="muted" style={{ fontSize: 13 }}>LUNAR · {PLANS[v.plan].name}</span><div className="big" style={{ color: "var(--accent2)" }}>{fmt(r.sub[2] * k, cur)}</div></div>
        </div>
        <div className="bars" style={{ marginTop: 26 }}>
          {[0, 1, 2].map((y) => (
            <div key={y} style={{ display: "grid", gap: 6 }}>
              <span className="mono muted">ANUL {y + 1} · CUMULAT</span>
              <div className="bar-row"><span className="muted">Plată unică</span><div className="track"><i style={{ width: `${(r.one[y] / max) * 100}%`, background: "rgba(255,255,255,.55)" }} /></div><b>{fmt(r.one[y] * k, cur)}</b></div>
              <div className="bar-row"><span className="muted">LUNAR</span><div className="track"><i style={{ width: `${(r.sub[y] / max) * 100}%`, background: "var(--accent)" }} /></div><b>{fmt(r.sub[y] * k, cur)}</b></div>
            </div>
          ))}
        </div>
        <div className="verdict">
          {diff > 0 ? (
            <>Cu cifrele tale, abonamentul costă cu <b style={{ color: "#fff" }}>{fmt(diff * k, cur)}</b> mai puțin pe 3 ani și nu plătești nimic la început. Din luna 13, website-ul este al tău.</>
          ) : (
            <>Cu cifrele tale, plata unică iese mai ieftin cu <b style={{ color: "#fff" }}>{fmt(-diff * k, cur)}</b> pe 3 ani{breakEven ? `, iar abonamentul o depășește după ${breakEven} luni` : ""}. Abonamentul are sens dacă nu ai {fmt(v.dev * k, cur)} disponibili acum sau dacă vrei îmbunătățiri lunare fără să le negociezi de fiecare dată.</>
          )}
        </div>
      </div>
    </div>
  );
}

function Rng({ id, label, min, maxv, step, value, unit = "money", k, cur, onSet }: {
  id: keyof Inputs; label: string; min: number; maxv: number; step: number; value: number; unit?: "money" | "h"; k: number; cur: Currency;
  onSet: <K extends keyof Inputs>(key: K, val: Inputs[K]) => void;
}) {
  return (
    <div className="rng">
      <label htmlFor={`c-${id}`}>{label}<b>{unit === "h" ? `${value} h / lună` : fmt(value * k, cur)}</b></label>
      <input id={`c-${id}`} type="range" min={min} max={maxv} step={step} value={value} onChange={(e) => onSet(id, Number(e.target.value) as never)} />
    </div>
  );
}
