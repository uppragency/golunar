"use client";

import { useState } from "react";
import Link from "next/link";
import { Arrow } from "./visuals";
import { PARTNERS, PARTNERS_TITLE } from "@/lib/partners";
import { COMP } from "@/lib/compare";
import { GUAR } from "@/lib/guarantees";

/* ---------- parteneri ---------- */
export function PartnersStrip() {
  const row = [...PARTNERS, ...PARTNERS];
  return (
    <section className="partners" aria-label={PARTNERS_TITLE}>
      <div className="wrap"><p className="partners-t">{PARTNERS_TITLE}</p></div>
      <div className="partners-track" aria-hidden="false">
        <ul className="partners-row">
          {row.map((p, i) => (
            <li key={`${p.name}-${i}`} aria-hidden={i >= PARTNERS.length}>
              {p.logo ? <img src={p.logo} alt={p.name} loading="lazy" height={28} /> : <span>{p.name}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- de ce LUNAR ---------- */
const WHY: [string, string, string][] = [
  ["Cost", "Mii de lei plătiți în avans, înainte să vezi ceva.", "Începi cu 4,99 lei. Fără avans, fără taxă de creare."],
  ["Timp", "Săptămâni sau luni de așteptare.", "Live în 10 zile lucrătoare, garantat. Dacă întârziem, luna următoare e gratuită."],
  ["După lansare", "Site predat și uitat. Orice modificare se plătește separat.", "Îmbunătățiri lunare incluse în abonament."],
  ["Liniște", "Erori, site căzut, mesaje fără răspuns.", "Monitorizare la 10 minute, backup zilnic, răspuns în 48 de ore."],
  ["Preț", "Costuri ascunse: hosting, domeniu, SSL, mentenanță.", "Un singur preț lunar, cu TVA inclus."],
  ["Control", "Ești legat de furnizor.", "Domeniul e al tău din prima zi, site-ul după 12 plăți."],
];

export function WhySection({ onOrder }: { onOrder: () => void }) {
  const [whyAll, setWhyAll] = useState(false);
  return (
    <section className="sec why" id="de-ce">
      <div className="wrap">
        <div className="sec-head reveal">
          <div><div className="eyebrow">De ce LUNAR</div><h2 style={{ marginTop: 20 }}>Un website nu ar trebui <span className="dim">să fie un proiect riscant.</span></h2></div>
          <p>Am construit LUNAR pentru antreprenorii care au plătit mult, au așteptat mult și au primit un site pe care nu-l mai actualizează nimeni.</p>
        </div>
        <div className="why-table reveal" role="table" aria-label="Cum e de obicei, comparat cu LUNAR">
          <div className="why-row why-h" role="row"><span role="columnheader" /><span role="columnheader">Cum e de obicei</span><span role="columnheader">Cum e la LUNAR</span></div>
          {WHY.map(([k, bad, good], i) => (
            <div className={`why-row${i > 1 && !whyAll ? " why-m-hide" : ""}`} role="row" key={k}>
              <span role="rowheader" className="why-k">{k}</span>
              <span role="cell" className="why-bad"><i aria-hidden="true">×</i>{bad}</span>
              <span role="cell" className="why-good"><i aria-hidden="true">✓</i>{good}</span>
            </div>
          ))}
        </div>
        {!whyAll && (
          <button type="button" className="why-more" onClick={() => setWhyAll(true)}>Arată mai mult</button>
        )}
        <div className="why-cta reveal">
          <button className="btn btn-accent" onClick={onOrder}><span className="ic"><Arrow /></span>Comandă website cu 4,99 lei</button>
        </div>
      </div>
    </section>
  );
}

/* ---------- comparație ---------- */
export function CompareSection({ onOrder, guide = true }: { onOrder: () => void; guide?: boolean }) {
  return (
    <section className="sec compare" id="comparatie">
      <div className="wrap">
        <div className="sec-head reveal">
          <div><div className="eyebrow">Comparație</div><h2 style={{ marginTop: 20 }}>LUNAR, agenție sau AI. <span className="dim">Pe scurt.</span></h2></div>
          <p>Am pus alături cele trei drumuri pe care le au antreprenorii.{guide && <> Detaliile sunt în <Link href="/resurse/diy-ai-builder-sau-agentie" className="inl">ghidul complet</Link>.</>}</p>
        </div>
        <div className="cmp-scroll reveal">
          <table className="cmp">
            <thead>
              <tr><th scope="col"><span className="sr-only">Criteriu</span></th><th scope="col" className="cmp-l">LUNAR</th><th scope="col">Agenție clasică</th><th scope="col">Site făcut cu AI</th></tr>
            </thead>
            <tbody>
              {COMP.map((r) => (
                <tr key={r.k}>
                  <th scope="row">{r.k}</th>
                  <td className="cmp-l"><i aria-hidden="true">✓</i>{r.lunar.t}</td>
                  <td>{r.agency.t}</td>
                  <td>{r.ai.t}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td /><td className="cmp-l"><button className="btn btn-accent" onClick={onOrder}><span className="ic"><Arrow /></span>Comandă cu 4,99 lei</button></td><td /><td /></tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------- previzualizare portal ---------- */
const TABS = ["Prezentare", "Brief", "Plăți", "Cereri"] as const;

function PortalMock({ tab }: { tab: (typeof TABS)[number] }) {
  if (tab === "Prezentare") {
    return (
      <div className="pm-body">
        <div className="pm-h"><b>Bună, Andreea.</b><span>Website-ul tău e online și funcționează.</span></div>
        <div className="pm-grid">
          <div className="pm-card pm-site"><span className="pm-pill ok">● Online · 99,98% uptime</span><b>clinica-exemplu.ro</b><span>Lansat pe 12 noiembrie</span></div>
          <div className="pm-card"><span className="pm-k">Drumul spre proprietate</span><b className="pm-big">7 din 12</b><div className="pm-bar"><i style={{ width: "58%" }} /></div><span>Al tău în mai 2027</span></div>
          <div className="pm-card"><span className="pm-k">Vizitatori luna aceasta</span><b className="pm-big">1.284</b><span className="pm-up">+18% față de luna trecută</span></div>
          <div className="pm-card"><span className="pm-k">Cereri din formular</span><b className="pm-big">37</b><span className="pm-up">+9 față de luna trecută</span></div>
        </div>
      </div>
    );
  }
  if (tab === "Brief") {
    return (
      <div className="pm-body">
        <div className="pm-h"><b>Brief</b><span>Despre firmă, ce site vrei, exemple și poze.</span></div>
        <div className="pm-form">
          <div><span>Ce face firma ta?</span><p>Clinică stomatologică în Cluj, cu accent pe implanturi și ortodonție.</p></div>
          <div><span>Scopul principal</span><p>Programări</p></div>
          <div><span>Pagini</span><p className="pm-chips"><i>Acasă</i><i>Servicii</i><i>Prețuri</i><i>Echipa</i><i>Programare</i></p></div>
          <div><span>Poze și materiale</span><p className="pm-files"><i>logo.svg</i><i>echipa.jpg</i><i>cabinet-1.jpg</i><i>+6</i></p></div>
        </div>
      </div>
    );
  }
  if (tab === "Plăți") {
    return (
      <div className="pm-body">
        <div className="pm-h"><b>Plăți și facturi</b><span>Calendarul celor 12 rate și facturile din SPV.</span></div>
        <div className="pm-list">
          {[["01", "12 nov. 2026", "4,99 lei", "Plătită"], ["02", "12 dec. 2026", "269 lei", "Plătită"], ["03", "12 ian. 2027", "269 lei", "Următoarea"], ["04", "12 feb. 2027", "269 lei", "Programată"]].map(([n, d, a, s]) => (
            <div key={n}><span className="mono">{n}/12</span><span>{d}</span><b>{a}</b><em className={s === "Plătită" ? "ok" : s === "Următoarea" ? "acc" : ""}>{s}</em></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="pm-body">
      <div className="pm-h"><b>Cereri și suport</b><span>Îmbunătățirile lunare, cerute dintr-un click.</span></div>
      <div className="pm-list">
        {[["Pagină nouă: Ortodonție pentru copii", "Livrată"], ["Ofertă de sezon pe homepage", "În lucru"], ["Integrare WhatsApp", "Livrată"]].map(([t, s]) => (
          <div key={t}><span style={{ gridColumn: "1 / 4" }}>{t}</span><em className={s === "Livrată" ? "ok" : "acc"}>{s}</em></div>
        ))}
      </div>
      <div className="pm-quota"><span>Îmbunătățiri luna aceasta</span><b>1 din 2 folosite</b></div>
    </div>
  );
}

export function PortalPreview({ onOrder }: { onOrder: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Prezentare");
  return (
    <section className="sec portal-prev" id="portal">
      <div className="wrap">
        <div className="sec-head reveal">
          <div><div className="eyebrow">Portalul de client</div><h2 style={{ marginTop: 20 }}>Totul într-un singur loc. <span className="dim">Fără emailuri pierdute.</span></h2></div>
          <p>Brief, plăți, facturi, cereri de modificare și progresul spre proprietate. Vezi oricând ce se întâmplă cu site-ul tău.</p>
        </div>
        <div className="pm-wrap reveal">
          <div className="pm-tabs" role="tablist" aria-label="Secțiuni portal">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="pm-window" role="tabpanel" aria-label={`Previzualizare: ${tab}`}>
            <div className="pm-bar-top"><i /><i /><i /><span>golunar.ro/cont</span></div>
            <div className="pm-app">
              <aside className="pm-side">
                <span className="pm-logo"><i />LUNAR</span>
                {["Prezentare", "Brief", "Website", "Plăți", "Cereri", "Contract"].map((x) => <span key={x} className={x === tab ? "on" : ""}>{x}</span>)}
              </aside>
              <PortalMock tab={tab} />
            </div>
          </div>
          <p className="pm-note">Previzualizare cu date de exemplu.</p>
        </div>
        <div className="why-cta reveal"><button className="btn btn-accent" onClick={onOrder}><span className="ic"><Arrow /></span>Vreau acces în portal · comandă cu 4,99 lei</button></div>
      </div>
    </section>
  );
}

/* ---------- garanții ---------- */
export function Guarantees() {
  return (
    <section className="sec guar" id="garantii">
      <div className="wrap">
        <div className="sec-head reveal">
          <div><div className="eyebrow">Garanții</div><h2 style={{ marginTop: 20 }}>Riscul e la noi. <span className="dim">Nu la tine.</span></h2></div>
          <p>Promisiunile LUNAR, toate într-un loc. Le găsești și în contractul-cadru.</p>
        </div>
        <div className="guar-grid">
          {GUAR.map(([t, d], i) => (
            <div className="card guar-card reveal" key={t}>
              <span className="mono">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
