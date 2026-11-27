"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ADDONS, PLANS, PRICE_NOTE, cartLines, type Cart, type PlanCode } from "@/lib/plans";
import { LAUNCH, PLAN_FEATURES, discountFor, toDiscount, type Discount } from "@/lib/discount";
import { PORTFOLIO } from "@/lib/portfolio";
import { FAQ, FAQ_EXTRA } from "@/lib/faq";
import { CompareSection, PortalPreview } from "./HomeSections";
import { GUAR } from "@/lib/guarantees";
import { PlanCard } from "./Landing";
import { CheckoutModal } from "./CheckoutModal";
import Reviews from "./Reviews";
import { Arrow } from "./visuals";

const lei = (v: number) => v.toLocaleString("ro-RO", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }) + " lei";
const E = PLANS.essential.ron;
const FIRST_YEAR = LAUNCH.ron + 11 * E;

function addWorkdays(d: Date, n: number) {
  const x = new Date(d);
  while (n > 0) { x.setDate(x.getDate() + 1); const w = x.getDay(); if (w && w !== 6) n--; }
  return x;
}

const PAINS: [string, string][] = [
  ["Ți se cer mii de lei în avans", "Înainte să vezi un singur ecran. Bani scoși din stoc, din salarii sau din reclame."],
  ["Proiectul se întinde pe luni", "Termene care alunecă, mesaje fără răspuns, un freelancer care dispare la jumătate."],
  ["După lansare, nimeni nu-l mai atinge", "Orice modificare se plătește separat, așa că site-ul rămâne la fel ani la rând."],
  ["Arată bine, dar nu aduce cereri", "Fără texte gândite pentru clienți, fără SEO, fără măsurare. Un pliant online."],
];

const INCLUDES: [string, string][] = [
  ["Design personalizat", "Pornim de la brandul și clienții tăi, nu de la un șablon cumpărat. Aprobi designul înainte să construim."],
  ["Texte scrise pentru clienți", "Scriem noi textele, cu structură care duce vizitatorul spre apel, programare sau cerere de ofertă."],
  ["Gândit întâi pentru telefon", "Majoritatea vizitatorilor vin de pe mobil. Butoanele de contact sunt mereu la îndemână."],
  ["Rapid și pregătit pentru Google", "SEO tehnic, date structurate și viteză mare configurate din prima zi, plus vizibilitate în AI la planurile mari."],
  ["Domeniu, hosting, SSL, backup", "Hosting în Uniunea Europeană, certificat SSL, backup zilnic. Domeniul se înregistrează pe firma ta."],
  ["Monitorizare la 10 minute", "Dacă site-ul are o problemă, aflăm noi primii. Starea e publică pe pagina de status."],
  ["Îmbunătățiri lunare incluse", "În fiecare lună ceri din portal o modificare: o pagină nouă, o ofertă, o integrare."],
  ["Portal și raport lunar", "Brief, plăți, facturi și cereri într-un singur loc. Primești lunar un raport pe email."],
];

const BENEFITS: [string, string, string][] = [
  ["01", "Banii rămân în firmă", `Plătești ${lei(E)} pe lună în loc de o sumă mare la început. Costul se acoperă din clienții pe care îi aduce site-ul.`],
  ["02", "Ești online în 2 săptămâni", "10 zile lucrătoare de la brief până la lansare. Dacă întârziem din vina noastră, luna următoare e gratuită."],
  ["03", "Site-ul crește odată cu firma", "Îmbunătățirile lunare țin site-ul actual: servicii noi, oferte de sezon, pagini pentru campanii."],
  ["04", "Un singur furnizor, un singur preț", "Design, hosting, mentenanță, securitate și suport. Fără facturi separate și fără costuri ascunse."],
  ["05", "Rămâi proprietar", "Domeniul e al tău din prima zi. După 12 plăți, site-ul e al tău: îl păstrezi la noi sau îl muți."],
  ["06", "Totul se face online", "Brief în 5 minute, design aprobat pe link, cereri din portal. Fără ședințe și fără emailuri pierdute."],
];

const OBJECTIONS: [string, string][] = [
  ["„4,99 lei sună prea bine ca să fie adevărat.”", `Prima lună e redusă ca să ne poți încerca fără risc. Din luna a doua plătești ${lei(E)} pe lună pe planul Esențial, iar perioada minimă este de 3 luni. Costul total până devine al tău este ${lei(FIRST_YEAR)} în primul an, TVA inclus. Îl vezi afișat înainte de plată.`],
  ["„Abonament înseamnă că plătesc la nesfârșit.”", "Nu. După 12 plăți, website-ul devine al tău. Din acel moment alegi: rămâi la noi pentru hosting și mentenanță sau îl muți unde vrei. Domeniul este pe firma ta din prima zi."],
  ["„Și dacă vreau să renunț?”", "După perioada minimă a planului anulezi oricând, fără penalități, iar abonamentul se oprește la finalul lunii plătite. Dacă vrei să păstrezi site-ul înainte de 12 luni, plătești ratele rămase și îl preiei."],
  ["„La prețul ăsta primesc un șablon.”", "Nu folosim șabloane cumpărate. Fiecare site pornește de la brief-ul tău, iar în ziua 4 primești designul complet pe care îl aprobi sau îl modifici. Uită-te mai sus la proiectele reale."],
  ["„Nu am timp să mă ocup de un site.”", "Brief-ul durează 5 minute. Textele le scriem noi, structura o propunem noi, testarea și publicarea sunt treaba noastră. Tu aprobi designul și răspunzi la câteva întrebări."],
  ["„Nu am texte, poze sau logo.”", `Pornim de la ce ai. Textele sunt incluse, iar dacă nu ai identitate vizuală, o adaugi ca opțiune la comandă (${lei(ADDONS.brand.ron)} pe lună, maximum 12 luni).`],
  ["„Am deja un site.”", "Îl mutăm gratuit. Preluăm paginile importante, construim site-ul nou în 10 zile lucrătoare și facem redirecturi de pe adresele vechi, ca să nu pierzi pozițiile din Google."],
  ["„E un credit? Verificați la bancă?”", "Nu. Este un abonament pentru un serviciu, cu factură fiscală pe firmă în e-Factura. Fără dobândă, fără bancă sau IFN, fără verificare în Biroul de Credit."],
  ["„Cine îmi garantează că livrați la timp?”", "Garanția e în contract: lansare în 10 zile lucrătoare de la brief sau luna următoare de abonament e gratuită. Zilele în care așteptăm materiale de la tine nu se numără."],
];

const FIT: string[] = [
  "Firme de servicii, clinici, cabinete, saloane, firme de construcții, consultanți și HoReCa.",
  "Magazine online cu catalog de produse, coș și plăți online.",
  "Firme care au un site vechi, lent sau pe care nu-l mai actualizează nimeni.",
  "Antreprenori care vor un buget lunar previzibil în loc de o investiție mare la început.",
];
const NOT_FIT: string[] = [
  "Aplicații complexe: marketplace-uri, platforme cu conturi de utilizatori și logică personalizată.",
  "Proiecte care au nevoie de lansare în mai puțin de 10 zile lucrătoare.",
];

const FOLIO_SLUGS = ["as-dental", "amaliss", "sports-diplomacy", "hasha-tattoo", "jona-clinic", "artdent"];
const FOLIO = FOLIO_SLUGS.map((s) => PORTFOLIO.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

const FAQ_PICK = [
  ...FAQ[Object.keys(FAQ)[0]] ?? [],
  ...(Object.values(FAQ).flat().filter(([q]) => /prima lună|perioadă minimă|plec înainte|întârzie|poziții în Google|factură/i.test(q))),
  ...(Object.values(FAQ_EXTRA).flat().filter(([q]) => /vorbi cu cineva/i.test(q)).map(([q]) => [q, "Da. Scrie-ne la hello@golunar.ro și îți răspundem în cel mult o zi lucrătoare. Poți cere și o discuție de 20 de minute pe Google Meet."] as [string, string])),
].filter(([q], i, a) => a.findIndex(([x]) => x === q) === i);

export default function AdsLanding() {
  const [cart, setCart] = useState<Cart>({ plan: "essential", brand: false, local: false, langs: 0 });
  const [checkout, setCheckout] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [launch, setLaunch] = useState("");
  const [sticky, setSticky] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const { net } = useMemo(() => cartLines(cart, "RON"), [cart]);
  const disc = discountFor(discount, net, "RON");

  // Codul GOLUNAR se aplică automat pe Esențial, ca pe homepage.
  useEffect(() => {
    if (cart.plan !== "essential") { if (discount?.code === LAUNCH.code) setDiscount(null); return; }
    if (discount) return;
    let live = true;
    fetch("/api/discount", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: LAUNCH.code, plan: "essential" }) })
      .then((r) => r.json()).then((j) => { if (live) setDiscount(toDiscount(j)); }).catch(() => {});
    return () => { live = false; };
  }, [cart.plan, discount]);

  useEffect(() => {
    setLaunch(addWorkdays(new Date(), 10).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }));
    const els = root.current?.querySelectorAll(".reveal") ?? [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    const onScroll = () => setSticky(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const pick = (plan: PlanCode) => setCart((c) => ({ ...c, plan }));
  const order = () => { pick("essential"); setCheckout(true); };
  const Cta = ({ label = "Începe cu 4,99 lei" }: { label?: string }) => (
    <button className="btn btn-accent" onClick={order}><span className="ic"><Arrow /></span>{label}</button>
  );

  return (
    <div ref={root} className="ads">
      <header className="ads-bar">
        <span className="logo"><i />LUNAR</span>
        <button className="ads-bar-cta" onClick={order}>Începe cu 4,99 lei</button>
      </header>

      {/* 1. Promisiunea */}
      <section className="ads-hero dots">
        <div className="hero-glow" />
        <div className="wrap ads-hero-in">
          <span className="pill acc"><span className="d" />Prima lună 4,99 lei · pentru firme noi la LUNAR</span>
          <h1>Website pentru firma ta, fără avans. <span className="dim">Plătești lunar, e al tău după 12 plăți.</span></h1>
          <p className="ads-lede">Design personalizat, texte, hosting, mentenanță și îmbunătățiri lunare într-un singur abonament. Lansare în 10 zile lucrătoare, garantat în contract.</p>
          <div className="ads-hero-cta">
            <Cta label="Comandă website cu 4,99 lei" />
            <span className="ads-launch">Dacă începi azi, ești online {launch ? <>pe <b>{launch}</b></> : "în 10 zile lucrătoare"}.</span>
          </div>
          <ul className="ads-proof">
            <li><b>0 lei</b><span>avans sau taxă de creare</span></li>
            <li><b>10 zile</b><span>lucrătoare până la lansare</span></li>
            <li><b>{lei(E)}</b><span>pe lună din luna a doua, TVA inclus</span></li>
            <li><b>12 plăți</b><span>și site-ul devine al tău</span></li>
          </ul>
        </div>
      </section>

      {/* 2. Problema */}
      <section className="sec ads-sec">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">De ce amână firmele site-ul</div><h2 style={{ marginTop: 20 }}>Nu din lipsă de nevoie. <span className="dim">Din cauza felului în care se vinde.</span></h2></div>
            <p>Majoritatea antreprenorilor cu care vorbim au mai trecut prin asta cel puțin o dată.</p>
          </div>
          <div className="ads-pains">
            {PAINS.map(([t, d]) => (
              <div className="card ads-pain reveal" key={t}><i aria-hidden="true">×</i><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
          <p className="ads-turn reveal">LUNAR schimbă modelul: <b>noi investim în construirea site-ului</b>, tu îl plătești lunar, cât timp îți aduce valoare.</p>
        </div>
      </section>

      {/* 3. Ce primești */}
      <section className="sec ads-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Ce include abonamentul</div><h2 style={{ marginTop: 20 }}>Tot ce ține de site. <span className="dim">Într-un singur preț.</span></h2></div>
            <p>Nu plătești separat designul, programarea, hostingul sau modificările. Toate sunt în abonament.</p>
          </div>
          <div className="lp-grid ads-inc">
            {INCLUDES.map(([t, d]) => (<div className="card lp-feat reveal" key={t}><h3>{t}</h3><p>{d}</p></div>))}
          </div>
        </div>
      </section>

      {/* 4. Portofoliu */}
      <section className="sec ads-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Portofoliu</div><h2 style={{ marginTop: 20 }}>Proiecte reale. <span className="dim">Fără șabloane.</span></h2></div>
            <p>Clinici, magazine online, evenimente, servicii. Fiecare pornește de la identitatea și clienții afacerii.</p>
          </div>
          <div className="ads-folio">
            {FOLIO.map((p) => (
              <figure className="ads-shot reveal" key={p.slug}>
                <div className="ads-shot-img"><img src={`/portfolio/${p.slug}-thumb.webp`} alt={`Captură de ecran: ${p.name}, ${p.category}`} loading="lazy" width={800} height={500} /></div>
                <figcaption><b>{p.name}</b><span>{p.category}</span>{p.url && <a href={p.url} target="_blank" rel="noopener" className="live">Vezi live ↗</a>}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Reviews />

      {/* 5. Beneficii */}
      <section className="sec light dots-ink ads-sec">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Ce câștigi</div><h2 style={{ marginTop: 20 }}>Un site care lucrează. <span className="dim">Nu un proiect de administrat.</span></h2></div>
            <p>Abonamentul mută riscul și munca la noi. Tu te ocupi de clienții pe care îi aduce site-ul.</p>
          </div>
          <div className="ads-ben">
            {BENEFITS.map(([n, t, d]) => (<div className="ads-ben-i reveal" key={n}><span className="mono">{n}</span><h3>{t}</h3><p>{d}</p></div>))}
          </div>
          <div className="why-cta reveal"><button className="btn btn-ink" onClick={order}><span className="ic"><Arrow /></span>Începe cu 4,99 lei</button></div>
        </div>
      </section>

      {/* 6. Procesul */}
      <section className="sec ads-sec">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Cum lucrăm</div><h2 style={{ marginTop: 20 }}>Trei pași. <span className="dim">Zece zile lucrătoare.</span></h2></div>
            <p>Tu ne spui ce face afacerea ta. Noi ne ocupăm de design, texte, dezvoltare, testare și publicare.</p>
          </div>
          <ol className="ads-steps">
            {[["Ziua 1", "Comanzi și completezi brief-ul", "Plătești prima lună, primești acces în portal și răspunzi la un chestionar de 5 minute: servicii, obiective, stil, materiale."],
              ["Ziua 4", "Aprobi designul", "Primești propunerea vizuală completă pe link. Ne dai feedback, ajustăm, tu aprobi direcția finală."],
              ["Ziua 10", "Website-ul e live", "Construim, testăm pe telefon și desktop și publicăm pe domeniul tău. Din ziua 11 începe îmbunătățirea lunară."]].map(([d, t, x], i) => (
              <li className="card ads-step reveal" key={d}><span className="mono">0{i + 1} · {d}</span><h3>{t}</h3><p>{x}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <CompareSection onOrder={order} guide={false} />

      {/* 7. Obiecții */}
      <section className="sec ads-sec" id="obiectii">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Întrebările pe care ți le pui acum</div><h2 style={{ marginTop: 20 }}>Le-am auzit pe toate. <span className="dim">Răspunsurile sunt în contract.</span></h2></div>
            <p>Dacă ai o îndoială, probabil e aici. Fiecare răspuns corespunde condițiilor din contractul-cadru.</p>
          </div>
          <div className="ads-obj">
            {OBJECTIONS.map(([q, a]) => (<div className="ads-obj-i reveal" key={q}><h3>{q}</h3><p>{a}</p></div>))}
          </div>
        </div>
      </section>

      {/* 8. Pentru cine */}
      <section className="sec ads-sec" style={{ paddingTop: 0 }}>
        <div className="wrap ads-fit">
          <div className="card ads-fit-c reveal"><h3>Pentru cine este LUNAR</h3><ul>{FIT.map((f) => <li key={f}><i aria-hidden="true">✓</i>{f}</li>)}</ul></div>
          <div className="card ads-fit-c no reveal"><h3>Pentru cine nu este</h3><ul>{NOT_FIT.map((f) => <li key={f}><i aria-hidden="true">×</i>{f}</li>)}</ul><p>Pentru aceste proiecte îți spunem sincer înainte de comandă și îți recomandăm altă variantă.</p></div>
        </div>
      </section>

      <PortalPreview onOrder={order} />

      <section className="sec ads-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Garanții</div><h2 style={{ marginTop: 20 }}>Riscul e la noi. <span className="dim">Nu la tine.</span></h2></div>
            <p>Promisiunile LUNAR, toate într-un loc. Le găsești și în contractul-cadru.</p>
          </div>
          <div className="lp-grid">
            {GUAR.map(([t, d], i) => (<div className="card lp-feat reveal" key={t}><span className="mono" style={{ color: "var(--accent2)" }}>0{i + 1}</span><h3 style={{ marginTop: 12 }}>{t}</h3><p>{d}</p></div>))}
          </div>
        </div>
      </section>

      {/* 9. Prețuri */}
      <section className="sec light dots-ink ads-sec" id="abonamente">
        <div className="wrap">
          <div className="sec-head reveal">
            <div><div className="eyebrow">Abonamente</div><h2 style={{ marginTop: 20 }}>Alege ritmul. <span className="dim">Prețul e final.</span></h2></div>
            <p>Toate prețurile includ TVA. Fără taxă de creare. Opțiunile suplimentare le alegi la comandă, dacă ai nevoie de ele.</p>
          </div>
          <div className="plans ads-plans" role="radiogroup" aria-label="Plan">
            <PlanCard code="essential" sel={cart.plan} onPick={pick} price={lei(E)} promo="4,99 lei" tag="Prima lună 4,99 lei" lead="Prezență online profesionistă și credibilă." items={PLAN_FEATURES.essential} />
            <PlanCard code="growth" sel={cart.plan} onPick={pick} price={lei(PLANS.growth.ron)} cls="pop" tag="Cel mai ales" lead="Mai multă vizibilitate și mai multe cereri de ofertă." items={PLAN_FEATURES.growth} />
            <PlanCard code="partner" sel={cart.plan} onPick={pick} price={lei(PLANS.partner.ron)} cls="dark" lead="Echipa ta digitală externă, lună de lună." items={PLAN_FEATURES.partner} />
          </div>
          <div className="ads-sum reveal">
            <div>
              <span className="muted">Plan {PLANS[cart.plan].name} · {disc > 0 ? "prima lună" : "pe lună"}</span>
              <b>{lei(net - disc)}</b>
              <small>{PRICE_NOTE}{disc > 0 ? ` · apoi ${lei(net)} pe lună` : ""} · al tău după 12 plăți</small>
            </div>
            <button className="btn btn-accent" onClick={() => setCheckout(true)}><span className="ic"><Arrow /></span>Continuă spre comandă</button>
          </div>
        </div>
      </section>

      {/* 10. Întrebări */}
      <section className="sec faq-wrap ads-sec" style={{ paddingTop: 80 }}>
        <div className="wrap ads-faq">
          <div className="sec-head"><div><div className="eyebrow">Întrebări frecvente</div><h2 style={{ marginTop: 20 }}>Răspunsuri clare. <span className="dim">Înainte să comanzi.</span></h2></div></div>
          <div>{FAQ_PICK.map(([q, a]) => (<details className="qa" key={q}><summary>{q}<i>+</i></summary><p>{a}</p></details>))}</div>
        </div>
      </section>

      {/* 11. Ultimul pas */}
      <section className="end dots">
        <div className="wrap">
          <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 24 }}>Ultimul pas</div>
          <h2>Online {launch ? <>pe {launch}.</> : "în 10 zile."}<br /><span className="dim">Primul pas costă 4,99 lei.</span></h2>
          <p className="end-promo">Codul {LAUNCH.code} este deja aplicat. Comanda durează 2 minute.</p>
          <div className="row"><Cta label="Comandă website cu 4,99 lei" /></div>
        </div>
      </section>

      <footer className="ads-foot">
        <div className="wrap">
          <span>© {new Date().getFullYear()} LUNAR · UPPRMARKETING S.R.L. · CIF 52762670 · hello@golunar.ro</span>
          <nav><Link href="/legal/termeni">Termeni</Link><Link href="/legal/confidentialitate">Confidențialitate</Link><Link href="/legal/cookies">Cookie-uri</Link><button type="button" className="ck-link" onClick={() => window.dispatchEvent(new Event("lunar:cookies"))}>Preferințe cookie</button><a href="https://anpc.ro/ce-este-sal/" rel="noopener" target="_blank">ANPC · SAL</a></nav>
        </div>
      </footer>

      <div className={`ads-sticky${sticky && !checkout ? " on" : ""}`} aria-hidden={!sticky}>
        <span><b>4,99 lei</b> prima lună · live în 10 zile</span>
        <button className="btn btn-accent" onClick={order} tabIndex={sticky ? 0 : -1}><span className="ic"><Arrow /></span>Începe</button>
      </div>

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} cart={cart} cur="RON" discount={discount} onDiscount={setDiscount} />
    </div>
  );
}
