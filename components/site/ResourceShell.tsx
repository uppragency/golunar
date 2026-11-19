import Link from "next/link";
import SubHeader from "./SubHeader";
import SiteFooter from "./SiteFooter";
import { RESOURCES, type Resource } from "@/lib/resources";
import { SITE_URL } from "@/lib/env";
import { Arrow } from "./visuals";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });

export default function ResourceShell({ r, children, faq }: { r: Resource; children: React.ReactNode; faq?: [string, string][] }) {
  const related = RESOURCES.filter((x) => x.slug !== r.slug).slice(0, 3);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: r.title,
      description: r.excerpt,
      datePublished: r.updated,
      dateModified: r.updated,
      inLanguage: "ro-RO",
      author: { "@type": "Organization", name: "LUNAR", url: SITE_URL },
      publisher: { "@type": "Organization", name: "LUNAR", url: SITE_URL },
      mainEntityOfPage: `${SITE_URL}/resurse/${r.slug}`,
    },
    ...(faq?.length
      ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }]
      : []),
  ];
  return (
    <div id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SubHeader />
      <header className="r-hero dots">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">LUNAR</Link><span>/</span><Link href="/resurse">Resurse</Link><span>/</span><span>{r.kicker}</span></nav>
          <div className="eyebrow">{r.kicker}</div>
          <h1>{r.title}</h1>
          <p className="lede">{r.excerpt}</p>
          <div className="r-meta">
            <span className="pill">{r.minutes} min de citit</span>
            {r.extra && <span className="pill acc"><span className="d" />{r.extra}</span>}
            <span className="pill">Actualizat {fmtDate(r.updated)}</span>
          </div>
        </div>
      </header>
      <main className="wrap">
        {children}
        <div className="r-cta">
          <h3>Vrei să-l facem noi? <span>Site live în 10 zile, de la 89 € pe lună.</span></h3>
          <Link href="/#abonamente" className="btn"><span className="ic"><Arrow /></span>Vezi abonamentele</Link>
        </div>
        <section className="r-related">
          <h2>Citește și</h2>
          <div className="res">
            {related.map((x) => (
              <Link key={x.slug} href={`/resurse/${x.slug}`} className="card">
                <span className="k">{x.kicker}</span><h4>{x.title}</h4><span>{x.minutes} min{x.extra ? ` · ${x.extra}` : ""}</span>
              </Link>
            ))}
            <Link href="/resurse" className="card"><span className="k">Toate</span><h4>Toate resursele LUNAR</h4><span>Ghiduri, instrumente, articole <span className="go-arrow">→</span></span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
