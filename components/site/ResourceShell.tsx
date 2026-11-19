import Link from "next/link";
import SubHeader from "./SubHeader";
import SiteFooter from "./SiteFooter";
import { RESOURCES, type Resource } from "@/lib/resources";
import { SITE_URL } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { ORG_ID } from "@/lib/seo";
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
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: `${SITE_URL}/resurse/${r.slug}/opengraph-image`,
      keywords: r.keyword,
      mainEntityOfPage: `${SITE_URL}/resurse/${r.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "LUNAR", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Resurse", item: `${SITE_URL}/resurse` },
        { "@type": "ListItem", position: 3, name: r.title, item: `${SITE_URL}/resurse/${r.slug}` },
      ],
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
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">LUNAR</Link><span>/</span><Link href="/resurse">Resurse</Link><span>/</span><span aria-current="page">{r.kicker}</span></nav>
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
          <h3>Vrei să-l facem noi? <span>Începi cu 4,99 lei în prima lună, apoi {PLANS.essential.ron} lei pe lună. Live în 10 zile.</span></h3>
          <Link href="/?comanda=1" className="btn"><span className="ic"><Arrow /></span>Comandă website cu 4,99 lei</Link>
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
