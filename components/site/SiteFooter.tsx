"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "./visuals";
import { LeadModal } from "./LeadModal";
import { RESOURCES } from "@/lib/resources";
import { CITY_LINKS, INDUSTRY_LINKS } from "@/lib/landing-links";
import { PAYEE } from "@/lib/bank";

function addWorkdays(d: Date, n: number) {
  const x = new Date(d);
  while (n > 0) {
    x.setDate(x.getDate() + 1);
    const w = x.getDay();
    if (w && w !== 6) n--;
  }
  return x;
}

/** Footer „Eclipsă”. When onLead is not given, it opens its own lead modal. */
export default function SiteFooter({ onLead }: { onLead?: () => void }) {
  const [launch, setLaunch] = useState("—");
  const [lead, setLead] = useState(false);
  const [allInd, setAllInd] = useState(false);
  const [allCity, setAllCity] = useState(false);
  const wordRef = useRef<HTMLDivElement>(null);
  const openLead = onLead ?? (() => setLead(true));

  useEffect(() => {
    setLaunch(addWorkdays(new Date(), 10).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }));
    const el = wordRef.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = "100px";
      el.style.fontSize = `${(100 * (document.documentElement.clientWidth - 40)) / el.scrollWidth}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <>
      <footer className="fb">
        <div className="fb-sky" aria-hidden="true" /><div className="fb-stars" aria-hidden="true" /><div className="fb-moon" aria-hidden="true" />
        <div className="wrap">
          <div className="fb-cta">
            <div className="fb-card">
              <div className="eyebrow">Dacă începi azi</div>
              <h2 style={{ marginTop: 18 }}>Online pe <span>{launch}</span></h2>
              <p className="fb-guar">Începi cu 6 lei în prima lună. Garanție: dacă întârziem lansarea, luna următoare e gratuită.</p>
              <div className="fb-tl">
                {[["ZIUA 1", "Brief"], ["ZIUA 4", "Design"], ["ZIUA 7", "Dezvoltare"], ["ZIUA 10", "Lansare"]].map(([d, l]) => (
                  <div key={d}><b />{d}<br />{l}</div>
                ))}
              </div>
            </div>
            <div className="fb-card hot">
              <h2>Începe website-ul tău. <span>Fără investiție inițială.</span></h2>
              <Link className="fb-btn" href="/?comanda=1"><span className="ic"><Arrow /></span>Comandă website cu 6 lei</Link>
              <button className="fb-sec" onClick={openLead}>sau programează o discuție gratuită de 20 min</button>
            </div>
          </div>
          <div className="fb-cols">
            <div>
              <Link href="/" className="logo"><i />LUNAR</Link>
              <p>Website-ul tău, mai bun lună de lună. Al tău după 12 plăți.</p>
              <a className="fb-mail" href="mailto:hello@golunar.ro">hello@golunar.ro</a>
            </div>
            <div>
              <h6>Explorează</h6>
              <Link href="/#proces">Proces</Link><Link href="/#portofoliu">Portofoliu</Link><Link href="/#abonamente">Abonamente</Link><Link href="/#intrebari">Întrebări</Link>
              <Link href="/website-6-lei">Website de la 6 lei</Link><Link href="/portofoliu">Portofoliu</Link><Link href="/tehnologii">Tehnologii</Link><Link href="/cum-lucram">Cum lucrăm</Link><Link href="/garantii">Garanții</Link><Link href="/lunar-vs-agentie-vs-ai">LUNAR vs agenție vs AI</Link><Link href="/audit">Audit SEO gratuit</Link>
            </div>
            <div>
              <h6>Resurse</h6>
              {RESOURCES.map((r) => <Link key={r.slug} href={`/resurse/${r.slug}`}>{r.title.split(":")[0]}</Link>)}
              <Link href="/resurse">Toate resursele →</Link>
            </div>
            <div>
              <h6>Website pentru</h6>
              {INDUSTRY_LINKS.map(([slug, label], i) => <Link key={slug} href={`/${slug}`} className={i && !allInd ? "fb-x" : undefined}>{label}</Link>)}
              <button type="button" className="fb-more" aria-expanded={allInd} onClick={() => setAllInd((v) => !v)}>{allInd ? "Arată mai puțin" : `Vezi toate paginile (${INDUSTRY_LINKS.length})`}</button>
            </div>
            <div>
              <h6>Creare site</h6>
              {CITY_LINKS.map(([slug, label], i) => <Link key={slug} href={`/${slug}`} className={i && !allCity ? "fb-x" : undefined}>{label}</Link>)}
              <button type="button" className="fb-more" aria-expanded={allCity} onClick={() => setAllCity((v) => !v)}>{allCity ? "Arată mai puțin" : `Vezi toate paginile (${CITY_LINKS.length})`}</button>
            </div>
            <div><h6>Cont</h6><Link href="/cont">Contul meu</Link><Link href="/#abonamente">Începe proiectul</Link><Link href="/cont/cereri">Cere o îmbunătățire</Link><Link href="/cont/recomanda">Recomandă și câștigă</Link></div>
          </div>
        </div>
        <div className="fb-word" ref={wordRef} aria-hidden="true"><span className="go">GO</span><span>LUNAR</span></div>
        <div className="fb-legal">
          <div className="wrap">
            <span className="fb-co">© {new Date().getFullYear()} LUNAR este un serviciu {PAYEE.name} · CIF {PAYEE.cif} · {PAYEE.regCom}</span>
            <nav><Link href="/legal/termeni">Termeni</Link><Link href="/legal/confidentialitate">Confidențialitate</Link><Link href="/legal/cookies">Cookie-uri</Link><button type="button" className="ck-link" onClick={() => window.dispatchEvent(new Event("lunar:cookies"))}>Preferințe cookie</button><a href="https://anpc.ro" rel="noopener" target="_blank">ANPC · SOL</a></nav>
          </div>
        </div>
      </footer>
      {!onLead && <LeadModal open={lead} onClose={() => setLead(false)} plan="growth" />}
    </>
  );
}
