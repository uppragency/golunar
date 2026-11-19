import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import { CITIES, INDUSTRIES, LANDINGS, landingBySlug, type City, type Industry } from "@/lib/landings";
import { PLANS } from "@/lib/plans";
import { CITY_LINKS, INDUSTRY_LINKS } from "@/lib/landing-links";
import { SITE_URL } from "@/lib/env";

export const dynamicParams = false;

export function generateStaticParams() {
  const linked = [...INDUSTRY_LINKS, ...CITY_LINKS].map(([s]) => s).sort().join();
  if (linked !== LANDINGS.map((l) => l.slug).sort().join()) throw new Error("lib/landing-links.ts nu corespunde cu lib/landings.ts");
  return LANDINGS.map((l) => ({ pagina: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pagina: string }> }): Promise<Metadata> {
  const l = landingBySlug((await params).pagina);
  if (!l) return {};
  return {
    title: { absolute: l.metaTitle },
    description: l.desc,
    alternates: { canonical: `/${l.slug}` },
    openGraph: { title: `${l.h1} ${l.h1Dim}`, description: l.desc, url: `/${l.slug}`, type: "website" },
  };
}

const faqLd = (faq: [string, string][]) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });

const serviceLd = (name: string, desc: string, url: string, area?: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description: desc,
  url,
  serviceType: "Creare și administrare website pe abonament",
  provider: { "@id": `${SITE_URL}/#org` },
  areaServed: area ? { "@type": "City", name: area } : { "@type": "Country", name: "România" },
  offers: (["essential", "growth", "partner"] as const).map((p) => ({
    "@type": "Offer", name: `Plan ${PLANS[p].name}`, price: PLANS[p].ron, priceCurrency: "RON",
    priceSpecification: { "@type": "UnitPriceSpecification", price: PLANS[p].ron, priceCurrency: "RON", unitText: "lună", valueAddedTaxIncluded: true },
  })),
});

function Faq({ faq }: { faq: [string, string][] }) {
  return (
    <>
      <h2>Întrebări frecvente</h2>
      {faq.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
    </>
  );
}

function IndustryPage({ l }: { l: Industry }) {
  const others = INDUSTRIES.filter((x) => x.slug !== l.slug);
  const plan = PLANS[l.plan];
  return (
    <PageShell
      crumbs={[[`/${l.slug}`, `Site pentru ${l.name}`]]}
      eyebrow={`Website pentru ${l.name}`}
      title={<>{l.h1} <span className="dim">{l.h1Dim}</span></>}
      lede={l.lede}
      meta={<><span className="pill acc"><span className="d" />Lansare în 10 zile lucrătoare</span><Link href="/website-4-99-lei" className="pill acc">Prima lună 4,99 lei</Link><span className="pill">Apoi {PLANS.essential.ron} lei / lună, TVA inclus</span><span className="pill">Al tău după 12 plăți</span></>}
      jsonLd={[serviceLd(`Site pentru ${l.name}`, l.desc, `${SITE_URL}/${l.slug}`), faqLd(l.faq)]}
    >
      <article className="article">
        <h2>Problemele pe care le rezolvă site-ul</h2>
        <ul>{l.pains.map((p) => <li key={p}>{p}</li>)}</ul>
        <h2>Ce include un {l.keyword} făcut de LUNAR</h2>
      </article>
      <div className="wide-block">
        <div className="lp-grid">
          {l.features.map(([t, d]) => (<div className="card lp-feat" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </div>
      <article className="article">
        <h2>Structura recomandată</h2>
        <p>Pornim de la paginile de mai jos și le adaptăm serviciilor tale. Fiecare pagină are un singur scop: să ducă vizitatorul spre programare sau cerere de ofertă.</p>
        <ol>{l.pages.map((p) => <li key={p}>{p}</li>)}</ol>
        <h2>SEO pentru {l.name}</h2>
        <ul>{l.seo.map((s) => <li key={s}>{s}</li>)}</ul>
        <h2>Integrări</h2>
        <ul>{l.integrations.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="callout"><b>Planul recomandat: {plan.name} · {plan.ron} lei / lună</b><p>{l.planWhy}</p></div>
        <p>Nu știi de unde să începi? Fă un <Link className="inl" href="/audit">audit gratuit al site-ului actual</Link> sau vezi <Link className="inl" href="/cum-lucram">cum lucrăm, zi cu zi</Link>.</p>
        <Faq faq={l.faq} />
        <h2>Lucrăm și pentru</h2>
        <ul className="lp-links">{others.map((o) => <li key={o.slug}><Link href={`/${o.slug}`}>Site pentru {o.name}</Link></li>)}</ul>
      </article>
    </PageShell>
  );
}

function CityPage({ l }: { l: City }) {
  const others = CITIES.filter((x) => x.slug !== l.slug);
  return (
    <PageShell
      crumbs={[[`/${l.slug}`, `Creare site ${l.city}`]]}
      eyebrow={`Website ${l.inCity}`}
      title={<>{l.h1} <span className="dim">{l.h1Dim}</span></>}
      lede={l.lede}
      meta={<><span className="pill acc"><span className="d" />Lansare în 10 zile lucrătoare</span><Link href="/website-4-99-lei" className="pill acc">Prima lună 4,99 lei</Link><span className="pill">Apoi {PLANS.essential.ron} lei / lună, TVA inclus</span><span className="pill">0 lei taxă de creare</span></>}
      jsonLd={[serviceLd(`Creare site ${l.city}`, l.desc, `${SITE_URL}/${l.slug}`, l.city), faqLd(l.faq)]}
    >
      <article className="article">
        <h2>Ce contează pentru un site {l.inCity}</h2>
        {l.market.map((p) => <p key={p}>{p}</p>)}
        <h2>Zone în care te ajutăm să fii găsit</h2>
        <p>Optimizăm site-ul și profilul Google pentru zonele în care lucrezi efectiv, cu conținut scris pentru fiecare, nu doar cu numele schimbat.</p>
      </article>
      <div className="wide-block"><div className="lp-chips">{l.areas.map((a) => <span key={a} className="pill">{a}</span>)}</div></div>
      <article className="article">
        <h2>Ce primești în abonament</h2>
        <ul>
          <li><strong>Design personalizat</strong>, gândit întâi pentru mobil, fără șabloane.</li>
          <li><strong>Texte scrise pentru clienții tăi</strong> și structură orientată spre cereri de ofertă.</li>
          <li><strong>Domeniu, hosting în UE, SSL și backup zilnic</strong>, incluse.</li>
          <li><strong>Monitorizare la fiecare 10 minute</strong>, vizibilă public pe <Link className="inl" href="/status">pagina de status</Link>.</li>
          <li><strong>Îmbunătățiri lunare</strong> și raport pe email în fiecare lună.</li>
          <li><strong>Proprietate după 12 plăți</strong>. Domeniul e al tău din prima zi.</li>
        </ul>
        <h2>SEO local {l.inCity}</h2>
        <ul>{l.localSeo.map((s) => <li key={s}>{s}</li>)}</ul>
        <h2>Domenii pentru care lucrăm des</h2>
        <ul>{l.sectors.map((s) => <li key={s}>{s}</li>)}</ul>
        <p>Vezi paginile dedicate: {INDUSTRIES.map((i, n) => <span key={i.slug}>{n ? ", " : ""}<Link className="inl" href={`/${i.slug}`}>{i.short.toLowerCase()}</Link></span>)}.</p>
        <div className="callout"><b>Cum lucrăm cu firme {l.inCity}</b><p>Totul online: discuția de 20 de minute pe Google Meet, brief-ul în portal, designul aprobat pe link. Lansarea are loc în 10 zile lucrătoare, iar dacă întârziem din vina noastră, luna următoare e gratuită.</p></div>
        <Faq faq={l.faq} />
        <h2>Creare site în alte orașe</h2>
        <ul className="lp-links">{others.map((o) => <li key={o.slug}><Link href={`/${o.slug}`}>Creare site {o.city}</Link></li>)}</ul>
      </article>
    </PageShell>
  );
}

export default async function LandingPage({ params }: { params: Promise<{ pagina: string }> }) {
  const l = landingBySlug((await params).pagina);
  if (!l) notFound();
  return l.kind === "industry" ? <IndustryPage l={l} /> : <CityPage l={l} />;
}
