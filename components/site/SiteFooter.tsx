"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "./visuals";
import { LeadModal } from "./LeadModal";
import { RESOURCES } from "@/lib/resources";

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
  const wordRef = useRef<HTMLDivElement>(null);
  const openLead = onLead ?? (() => setLead(true));

  useEffect(() => {
    setLaunch(addWorkdays(new Date(), 10).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }));
    const el = wordRef.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = "100px";
      el.style.fontSize = `${(100 * (window.innerWidth - 40)) / el.scrollWidth}px`;
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
              <div className="fb-tl">
                {[["ZIUA 1", "Brief"], ["ZIUA 4", "Design"], ["ZIUA 7", "Dezvoltare"], ["ZIUA 10", "Lansare"]].map(([d, l]) => (
                  <div key={d}><b />{d}<br />{l}</div>
                ))}
              </div>
            </div>
            <div className="fb-card hot">
              <h2>Începe website-ul tău. <span>Fără investiție inițială.</span></h2>
              <button className="fb-btn" onClick={openLead}><span className="ic"><Arrow /></span>Discuție gratuită de 20 min</button>
            </div>
          </div>
          <div className="fb-cols">
            <div>
              <Link href="/" className="logo"><i />LUNAR</Link>
              <p>Website-ul tău, mai bun lună de lună. Al tău după 12 plăți.</p>
            </div>
            <div><h6>Explorează</h6><Link href="/#proces">Proces</Link><Link href="/#portofoliu">Portofoliu</Link><Link href="/#abonamente">Abonamente</Link><Link href="/#intrebari">Întrebări</Link></div>
            <div>
              <h6>Resurse</h6>
              {RESOURCES.map((r) => <Link key={r.slug} href={`/resurse/${r.slug}`}>{r.title.split(":")[0]}</Link>)}
              <Link href="/resurse">Toate resursele →</Link>
            </div>
            <div><h6>Cont</h6><Link href="/cont">Contul meu</Link><Link href="/#abonamente">Începe proiectul</Link><Link href="/cont/cereri">Cere o îmbunătățire</Link></div>
            <div><h6>Contact</h6><a href="mailto:hello@golunar.ro">hello@golunar.ro</a></div>
          </div>
        </div>
        <div className="fb-word" ref={wordRef} aria-hidden="true"><span className="go">GO</span> LUNAR</div>
        <div className="fb-legal">
          <div className="wrap">
            <span>© {new Date().getFullYear()} LUNAR · golunar.ro · Prețuri finale</span>
            <nav><Link href="/legal/termeni">Termeni</Link><Link href="/legal/confidentialitate">Confidențialitate</Link><Link href="/legal/cookies">Cookie-uri</Link><a href="https://anpc.ro" rel="noopener" target="_blank">ANPC · SOL</a></nav>
            <a href="#top">Înapoi sus ↑</a>
          </div>
        </div>
      </footer>
      {!onLead && <LeadModal open={lead} onClose={() => setLead(false)} plan="growth" />}
    </>
  );
}
