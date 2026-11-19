"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ADDONS, PLANS, PRICE_NOTE, cartLines, type Cart, type Currency, type PlanCode } from "@/lib/plans";
import { Arrow, Matrix, Tower } from "./visuals";
import { CheckoutModal } from "./CheckoutModal";
import { LeadModal } from "./LeadModal";
import SiteFooter from "./SiteFooter";
import { RESOURCES } from "@/lib/resources";

const fmt = (v: number, cur: Currency, d?: number) => {
  const dec = d ?? (Number.isInteger(v) ? 0 : 2);
  return v.toLocaleString("ro-RO", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (cur === "EUR" ? " €" : " lei");
};

const FOLIO = [
  ["nordicdental.ro", "Nordic Dental Studio", "Clinică stomatologică", "Zâmbete\nfără grabă.", "#E9EEF2", "#12324A", "#12324A", "#fff"],
  ["miraflori.ro", "Mira Flori", "Florărie · livrare", "Flori care\nspun tot.", "#F3E4E1", "#6B2B2B", "#6B2B2B", "#fff"],
  ["bistrotei.ro", "Bistro Tei", "Restaurant", "Gătit încet.\nServit cald.", "#1E1A16", "#F1E6D2", "#E8A04C", "#1E1A16"],
  ["ionescu-avocat.ro", "Cabinet Ionescu", "Avocatură", "Claritate\njuridică.", "#0F1A2B", "#E6E9EE", "#C9A86A", "#0F1A2B"],
  ["formafitness.ro", "Forma Fitness", "Sală de sport", "Mai puternic\nîn fiecare zi.", "#D9F15B", "#111", "#111", "#D9F15B"],
  ["vilabradet.ro", "Vila Brădet", "Pensiune · munte", "Liniștea\nde sus.", "#2F3A2C", "#EDE7DA", "#EDE7DA", "#2F3A2C"],
] as const;

const FAQ: Record<string, [string, string][]> = {
  Abonament: [
    ["Ce primesc concret?", "Website personalizat, domeniu, hosting, SSL, mentenanță, backup zilnic, suport și numărul de îmbunătățiri lunare din plan."],
    ["Există taxă de creare sau de setup?", "Nu. Designul și dezvoltarea sunt incluse în abonament. Plătești doar prima lună la comandă."],
    ["Prețurile includ TVA?", "Da. Prețul afișat este prețul final pe care îl plătești, fără TVA adăugat la factură."],
    ["Ce diferență este între planuri?", "Esențial acoperă prezența online. Creștere adaugă SEO, vizibilitate în AI și tracking de conversii. Partener adaugă landing pages, CRO și automatizări."],
  ],
  "Plată și facturare": [
    ["Cum plătesc?", "Cu cardul, prin debitare automată lunară, sau prin transfer bancar pe baza proformei trimise cu 7 zile înainte de scadență."],
    ["Primesc factură fiscală?", "Da. Fiecare plată generează factură, transmisă automat în SPV prin e-Factura și disponibilă în contul tău."],
    ["Ce se întâmplă dacă plata eșuează?", "Reîncercăm automat de 3 ori în 7 zile și te anunțăm pe email. După 14 zile fără plată, site-ul intră în mentenanță."],
  ],
  "Anulare și proprietate": [
    ["Pot anula oricând?", "Da, fără perioadă minimă. Abonamentul se oprește la finalul perioadei deja plătite."],
    ["Când devine website-ul al meu?", "După 12 plăți lunare și încheierea primei perioade de 12 luni. Domeniul este al tău din prima zi."],
    ["Ce se întâmplă dacă plec înainte de 12 luni?", "Renunți la website fără alte costuri sau plătești ratele rămase până la 12, la valoarea lunară curentă, și preiei site-ul."],
    ["Primesc codul-sursă?", "Da, după transferul proprietății, la cerere, în maximum 15 zile lucrătoare. Componentele terțe rămân sub licențele lor."],
  ],
  "Livrare și suport": [
    ["Ce se întâmplă dacă lansarea întârzie?", "Dacă întârzierea ne aparține, îți returnăm integral abonamentul perioadei afectate. Zilele în care așteptăm materiale de la tine nu se numără."],
    ["Ce înseamnă o îmbunătățire?", "O modificare delimitată: conținut, o secțiune nouă, o ajustare de navigare sau o integrare. Cererile mari se împart, cu acordul tău."],
    ["Se reportează îmbunătățirile nefolosite?", "Nu. Fiecare lună are propriul număr de îmbunătățiri."],
    ["Garantați poziții în Google?", "Nu. Nimeni nu poate garanta poziții, trafic sau mențiuni în răspunsurile AI. Garantăm munca, raportarea și transparența."],
  ],
};

function addWorkdays(d: Date, n: number) {
  const x = new Date(d);
  while (n > 0) {
    x.setDate(x.getDate() + 1);
    const w = x.getDay();
    if (w && w !== 6) n--;
  }
  return x;
}

export default function Landing() {
  const [cur, setCur] = useState<Currency>("RON");
  const [cart, setCart] = useState<Cart>({ plan: "growth", brand: false, local: false, langs: 0 });
  const [checkout, setCheckout] = useState(false);
  const [lead, setLead] = useState(false);
  const [faqCat, setFaqCat] = useState(0);
  const [launch, setLaunch] = useState("—");
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [railEdge, setRailEdge] = useState({ start: true, end: false });

  const { lines, net } = useMemo(() => cartLines(cart, cur), [cart, cur]);
  const p = (eur: number, ron: number) => fmt(cur === "EUR" ? eur : ron, cur);

  useEffect(() => {
    setLaunch(addWorkdays(new Date(), 10).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }));
    try {
      const saved = localStorage.getItem("lunar_cur");
      if (saved === "EUR" || saved === "RON") setCur(saved);
    } catch {}
    const els = root.current?.querySelectorAll(".reveal") ?? [];
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          if (e.target.id === "tl") {
            const fill = e.target.querySelector<HTMLElement>(".tl-track .fill");
            if (fill) fill.style.width = "100%";
            e.target.querySelectorAll(".tl-track .m").forEach((m, i) => setTimeout(() => m.classList.add("on"), i * 600));
          }
          io.unobserve(e.target);
        }),
      { threshold: 0.15 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const r = railRef.current;
    if (!r) return;
    const upd = () => setRailEdge({ start: r.scrollLeft < 8, end: r.scrollLeft + r.clientWidth >= r.scrollWidth - 8 });
    upd();
    r.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => { r.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); };
  }, []);
  const slide = (dir: 1 | -1) => {
    const r = railRef.current;
    const card = r?.querySelector<HTMLElement>(".shot");
    if (!r || !card) return;
    r.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  const switchCur = (c: Currency) => {
    setCur(c);
    document.documentElement.lang = c === "EUR" ? "en" : "ro";
    try {
      localStorage.setItem("lunar_cur", c);
    } catch {}
    flash(c === "RON" ? "Română · prețuri în lei" : "English · prices in EUR");
  };
  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 2400);
  };
  const pick = (plan: PlanCode) => setCart((c) => ({ ...c, plan }));
  const k = cur === "EUR" ? "eur" : "ron";

  return (
    <div ref={root}>
      <div className={`toast${toast ? " on" : ""}`} role="status">{toast}</div>

      <nav className="nav" aria-label="Principal">
        <a href="#top" className="logo"><i />LUNAR</a>
        <ul>
          <li><a href="#proces">Proces</a></li>
          <li><a href="#portofoliu">Portofoliu</a></li>
          <li><a href="#abonamente">Abonamente</a></li>
          <li><a href="#intrebari">Întrebări</a></li>
          <li><a href="#resurse">Resurse</a></li>
        </ul>
        <div className="nav-r">
          <CurSeg cur={cur} onChange={switchCur} />
          <Link href="/cont" className="login">Contul meu</Link>
          <button className={`burger${menu ? " on" : ""}`} aria-label={menu ? "Închide meniul" : "Deschide meniul"} aria-expanded={menu} aria-controls="mnav" onClick={() => setMenu((m) => !m)}>
            <span /><span /><span />
          </button>
          <button className="cta" onClick={() => { setMenu(false); setLead(true); }}>Discuție<span className="lg">&nbsp;gratuită</span></button>
        </div>
      </nav>

      <div id="mnav" className={`mnav${menu ? " on" : ""}`} aria-hidden={!menu} onClick={(e) => e.target === e.currentTarget && setMenu(false)}>
        <div className="mnav-in">
          <ul>
            {[["#proces", "Proces"], ["#portofoliu", "Portofoliu"], ["#abonamente", "Abonamente"], ["#intrebari", "Întrebări"], ["#resurse", "Resurse"]].map(([href, label], i) => (
              <li key={href} style={{ transitionDelay: menu ? `${80 + i * 45}ms` : "0ms" }}>
                <a href={href} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}><span className="mono">0{i + 1}</span>{label}</a>
              </li>
            ))}
          </ul>
          <div className="mnav-foot" style={{ transitionDelay: menu ? "320ms" : "0ms" }}>
            <CurSeg cur={cur} onChange={switchCur} />
            <Link href="/cont" className="btn-plain" tabIndex={menu ? 0 : -1}>Contul meu</Link>
          </div>
        </div>
      </div>

      <header className="hero dots" id="top">
        <div className="hero-glow" />
        <div className="wrap">
          <div className="hero-top">
            <div>
              <div className="price-chip">
                <span className="muted" style={{ fontSize: 14 }}>de la</span>
                <b>{p(89, 449)}</b>
                <span className="muted" style={{ fontSize: 14 }}>/ lună ({PRICE_NOTE})</span>
              </div>
            </div>
            <p className="hero-tag">Website-ul tău, live în 10 zile. <span>O echipă care îl face mai bun în fiecare lună.</span></p>
          </div>
          <div className="wordmark" aria-hidden="true">LUNAR</div>
          <div className="bento">
            <div className="card intro reveal">
              <div>
                <h1 style={{ marginTop: 0, fontSize: "clamp(26px,2.4vw,34px)" }}>Un website care lucrează pentru tine.<br /><span className="muted">Nu invers.</span></h1>
                <p>Website personalizat, fără taxă de dezvoltare. Abonamentul acoperă designul, hostingul, mentenanța și optimizarea lunară. După 12 plăți, site-ul devine al tău.</p>
              </div>
              <div className="row">
                <button className="btn btn-accent" onClick={() => setLead(true)}><span className="ic"><Arrow /></span>Discuție gratuită de 20 min</button>
                <a href="#abonamente" className="btn btn-ghost"><span className="ic"><Arrow /></span>Vezi abonamentele</a>
              </div>
            </div>
            <Pillar n="01" t="Performanță" d="Construit să fie găsit. Gândit să aducă cereri." m="bars" />
            <Pillar n="02" t="Abonament" d="Crearea site-ului inclusă. Un buget lunar previzibil." m="flat" />
            <Pillar n="03" t="Îmbunătățire" d="Site-ul tău devine mai bun lunar. Ceri modificări din panoul tău de client." m="rows" />
            <Pillar n="04" t="Proprietate" d="Website-ul e al tău din luna a 13-a." m="own" />
          </div>
        </div>
      </header>

      <section className="sec" id="proces">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Procesul</div><h2 style={{ marginTop: 20 }}>Trei pași. <span className="dim">Zece zile lucrătoare.</span></h2></div>
            <p>Tu ne spui ce face afacerea ta. Noi ne ocupăm de design, texte, dezvoltare, testare și publicare.</p>
          </div>
          <div className="steps">
            <Step n={3} num="01 · Ziua 1" t="Completezi brief-ul" d="Un chestionar de 5 minute: servicii, obiective, stil vizual, materialele pe care le ai deja." />
            <Step n={6} num="02 · Ziua 4" t="Aprobi designul" d="Primești propunerea vizuală completă. Ne dai feedback, ajustăm, tu aprobi direcția finală." />
            <Step n={9} num="03 · Ziua 10" t="Website-ul e live" d="Dezvoltare, testare pe mobil și desktop, publicare. Din ziua 11 începe optimizarea lunară." />
          </div>
          <div className="card timeline reveal" id="tl">
            <div className="launch"><span className="mono muted">DACĂ ÎNCEPI AZI</span><b>Online pe {launch}</b></div>
            <div className="tl-track">
              <div className="bar" /><div className="fill" />
              {[["0%", "ZIUA 1", "Brief"], ["33.3%", "ZIUA 4", "Design"], ["66.6%", "ZIUA 7", "Dezvoltare"], ["100%", "ZIUA 10", "Lansare"]].map(([l, s, e]) => (
                <div className="m" style={{ left: l }} key={s}><span>{s}</span><b /><em>{e}</em></div>
              ))}
            </div>
            <span className="pill acc"><span className="d" />Garanție: abonament rambursat la întârziere</span>
          </div>
        </div>
      </section>

      <section className="sec folio" id="portofoliu" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Portofoliu</div><h2 style={{ marginTop: 20 }}>Făcut pentru tine. <span className="dim">Fără șabloane.</span></h2></div>
            <p>Fiecare site pornește de la identitatea și clienții afacerii. Clinici, restaurante, servicii profesionale, retail local.</p>
          </div>
        </div>
        <div className="rail" ref={railRef}>
          {FOLIO.map(([u, n, c, h, bg, fg, cb, ct]) => (
            <article className="shot" key={u}>
              <div className="bar"><i /><i /><i /><span>{u}</span></div>
              <div className="screen" style={{ background: bg, color: fg }}>
                <div className="tn"><b>{n.toUpperCase()}</b><u><span>Servicii</span><span>Despre</span><span>Contact</span></u></div>
                <h5 style={{ whiteSpace: "pre-line" }}>{h}</h5>
                <span className="cta" style={{ background: cb, color: ct }}>Programează →</span>
              </div>
              <div className="meta"><b>{n}</b><span>{c}</span></div>
            </article>
          ))}
        </div>
        <div className="rail-nav">
          <button aria-label="Proiectul anterior" onClick={() => slide(-1)} disabled={railEdge.start}><Arrow /></button>
          <button aria-label="Proiectul următor" onClick={() => slide(1)} disabled={railEdge.end}><Arrow /></button>
        </div>
      </section>

      <section className="sec light dots-ink" id="abonamente">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Abonamente</div><h2 style={{ marginTop: 20 }}>Alege ritmul. <span className="dim">Noi construim restul.</span></h2></div>
            <p>Toate prețurile includ TVA. Fără taxă de setup. Anulezi oricând, la finalul perioadei plătite.</p>
          </div>
          <div className="cfg">
            <div>
              <div className="plans" role="radiogroup" aria-label="Plan">
                <PlanCard code="essential" sel={cart.plan} onPick={pick} price={p(89, 449)} lead="Prezență online profesionistă și credibilă."
                  items={["Website personalizat", "Domeniu, hosting, SSL", "Mentenanță și backup", "1 îmbunătățire / lună", "Răspuns în 48h lucrătoare", "Statistici de trafic"]} />
                <PlanCard code="growth" sel={cart.plan} onPick={pick} price={p(189, 949)} cls="pop" tag="Cel mai ales" lead="Mai multă vizibilitate și mai multe cereri de ofertă."
                  items={["+Tot din Esențial, plus:", "SEO + vizibilitate în AI (GEO)", "2 îmbunătățiri / lună", "Tracking conversii", "Integrări marketing", "Raport lunar + recomandări"]} />
                <PlanCard code="partner" sel={cart.plan} onPick={pick} price={p(390, 1990)} cls="dark" lead="Echipa ta digitală externă, lună de lună."
                  items={["+Tot din Creștere, plus:", "4 îmbunătățiri / lună", "Landing pages campanii", "Optimizare conversii (CRO)", "Automatizări și integrări", "Suport prioritar"]} />
              </div>
              <div className="addons">
                <h3>Personalizează</h3>
                <div className="addon">
                  <div className="ico">B</div>
                  <div><h4>Identitate vizuală</h4><p>Logo, paletă, fonturi, kit de brand.</p><div className="pp">{fmt(ADDONS.brand[k], cur)} / lună · maximum 12 luni</div></div>
                  <button className={`tg${cart.brand ? " on" : ""}`} role="switch" aria-checked={cart.brand} aria-label="Identitate vizuală" onClick={() => setCart((c) => ({ ...c, brand: !c.brand }))} />
                </div>
                <div className="addon">
                  <div className="ico">G</div>
                  <div><h4>Vizibilitate locală Google</h4><p>Google Business Profile și Maps, actualizări, monitorizare.</p><div className="pp">{fmt(ADDONS.local[k], cur)} / lună</div></div>
                  <button className={`tg${cart.local ? " on" : ""}`} role="switch" aria-checked={cart.local} aria-label="Vizibilitate locală" onClick={() => setCart((c) => ({ ...c, local: !c.local }))} />
                </div>
                <div className="addon">
                  <div className="ico">Aa</div>
                  <div>
                    <h4>Limbă suplimentară</h4><p>Versiune completă în altă limbă, menținută lunar.</p><div className="pp">{fmt(ADDONS.lang[k], cur)} / lună / limbă</div>
                    <div className="stepper">
                      <button aria-label="Minus" onClick={() => setCart((c) => ({ ...c, langs: Math.max(0, c.langs - 1) }))}>−</button>
                      <b>{cart.langs}</b>
                      <button aria-label="Plus" onClick={() => setCart((c) => ({ ...c, langs: Math.min(5, c.langs + 1) }))}>+</button>
                    </div>
                  </div>
                  <span />
                </div>
              </div>
            </div>
            <aside className="summary">
              <h4>Rezumat abonament</h4>
              <div style={{ marginTop: 14 }}>
                {lines.map((l) => (
                  <div className="line" key={l.code}><span>{l.label}</span><span>{fmt(l.total, cur)}</span></div>
                ))}
              </div>
              <div className="total"><span className="muted">Total lunar</span><b>{fmt(net, cur)}</b></div>
              <div className="vat">{PRICE_NOTE} · fără costuri suplimentare</div>
              <div className="own">
                Website-ul devine al tău după <b>12 plăți</b>: <b>{fmt(net * 12, cur)}</b> în primul an.
                {cart.brand ? " Identitatea vizuală se oprește automat după rata 12." : ""}
                <div className="prog">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
              </div>
              <button className="btn btn-accent" style={{ width: "100%", justifyContent: "space-between" }} onClick={() => setCheckout(true)}>
                <span className="ic"><Arrow /></span>Continuă spre plată<span style={{ width: 8 }} />
              </button>
              <div className="secure"><span>Stripe</span>·<span>Card sau transfer bancar</span>·<span>e-Factura</span></div>
            </aside>
          </div>
          <div className="guar">
            <div><b>10 zile lucrătoare</b><span>Sau îți returnăm abonamentul perioadei afectate.</span></div>
            <div><b>{cur === "EUR" ? "0 €" : "0 lei"} la start</b><span>Dezvoltarea e inclusă în abonament.</span></div>
            <div><b>Anulezi oricând</b><span>Fără perioadă minimă. Se oprește la final de lună.</span></div>
            <div><b>Domeniul e al tău</b><span>Din prima zi, înregistrat pe firma ta.</span></div>
          </div>
        </div>
      </section>

      <section className="sec faq-wrap" id="intrebari" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="sec-head"><div><div className="eyebrow">Întrebări</div><h2 style={{ marginTop: 20 }}>Răspunsuri clare. <span className="dim">Înainte să semnezi.</span></h2></div></div>
          <div className="faq">
            <div className="faq-cats">
              {Object.keys(FAQ).map((c, i) => (
                <button key={c} className={i === faqCat ? "on" : ""} onClick={() => { setFaqCat(i); document.getElementById(`fq${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{c}</button>
              ))}
            </div>
            <div>
              {Object.entries(FAQ).map(([c, qs], i) => (
                <div className="faq-group" id={`fq${i}`} key={c}>
                  <h5>{c}</h5>
                  {qs.map(([q, a]) => (
                    <details className="qa" key={q}><summary>{q}<i>+</i></summary><p>{a}</p></details>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="resurse">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Resurse</div><h2 style={{ marginTop: 20 }}>Decide informat. <span className="dim">Gratuit.</span></h2></div>
            <p>Ghiduri și instrumente pentru antreprenorii care aleg între abonament, plată unică sau DIY.</p>
          </div>
          <div className="res">
            {RESOURCES.map((r) => (
              <Link href={`/resurse/${r.slug}`} className="card reveal" key={r.slug}>
                <span className="k">{r.kicker}</span><h4>{r.title}</h4><span>{r.minutes} min{r.extra ? ` · ${r.extra}` : ""}</span>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}><Link href="/resurse" className="btn-plain">Toate resursele →</Link></div>
        </div>
      </section>

      <section className="end dots" id="contact">
        <div className="wrap">
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 24 }}>Ritmul tău</div>
          <h2>Plătești lunar.<br /><span className="dim">Crești lunar.</span></h2>
          <div className="row">
            <a href="#abonamente" className="btn btn-accent"><span className="ic"><Arrow /></span>Vreau un site nou</a>
            <button className="btn btn-ghost" onClick={() => setLead(true)}><span className="ic"><Arrow /></span>Programează discuția</button>
          </div>
        </div>
      </section>

      <SiteFooter onLead={() => setLead(true)} />

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} cart={cart} cur={cur} />
      <LeadModal open={lead} onClose={() => setLead(false)} plan={cart.plan} />
    </div>
  );
}

function CurSeg({ cur, onChange }: { cur: Currency; onChange: (c: Currency) => void }) {
  return (
    <div className="seg" aria-label="Limbă și monedă">
      <button className={cur === "RON" ? "on" : ""} onClick={() => onChange("RON")}>RO · lei</button>
      <button className={cur === "EUR" ? "on" : ""} onClick={() => onChange("EUR")}>EN · €</button>
    </div>
  );
}

function Pillar({ n, t, d, m }: { n: string; t: string; d: string; m: "bars" | "flat" | "rows" | "own" }) {
  return (
    <div className="card pillar reveal">
      <div className="t"><h4>{t}</h4><p>{d}</p><span className="n">{n}</span></div>
      <div className="matrix"><Matrix type={m} /></div>
    </div>
  );
}

function Step({ n, num, t, d }: { n: number; num: string; t: string; d: string }) {
  return (
    <div className="card step reveal">
      <Tower n={n} />
      <span className="num">{num}</span><h3>{t}</h3><p>{d}</p>
    </div>
  );
}

function PlanCard({ code, sel, onPick, price, lead, items, cls = "", tag }: {
  code: PlanCode; sel: PlanCode; onPick: (p: PlanCode) => void; price: string; lead: string; items: string[]; cls?: string; tag?: string;
}) {
  const on = sel === code;
  return (
    <div className={`plan ${cls}${on ? " sel" : ""}`} role="radio" aria-checked={on} tabIndex={0} onClick={() => onPick(code)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(code); } }}>
      {tag && <span className="tag">{tag}</span>}
      <div>
        <h3>{PLANS[code].name}</h3>
        <p className="lead">{lead}</p>
        <ul>{items.map((i) => (i.startsWith("+") ? <li className="plus" key={i}>{i.slice(1)}</li> : <li key={i}>{i}</li>))}</ul>
      </div>
      <div className="pr"><span className="radio" /><div><b>{price}</b><br /><small>/ lună ({PRICE_NOTE})</small></div></div>
    </div>
  );
}
