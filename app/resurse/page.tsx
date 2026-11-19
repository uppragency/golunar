import type { Metadata } from "next";
import Link from "next/link";
import SubHeader from "@/components/site/SubHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ResourceHub from "@/components/site/ResourceHub";
import { RESOURCES } from "@/lib/resources";
import { SITE_URL } from "@/lib/env";
import { JsonLd, ORG_ID } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Resurse gratuite despre website-uri pentru firme",
  description: "Resurse gratuite despre website-uri pentru firme: ghiduri, calculator de costuri, model de brief și checklist de migrare, pentru decizii fără jargon.",
  alternates: { canonical: "/resurse" },
  openGraph: { title: "Resurse gratuite despre website-uri pentru firme", url: "/resurse", type: "website" },
};

export default function ResourcesPage() {
  return (
    <div id="top">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: "Resurse LUNAR", url: `${SITE_URL}/resurse`, inLanguage: "ro-RO", publisher: { "@id": ORG_ID },
          mainEntity: { "@type": "ItemList", itemListElement: RESOURCES.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/resurse/${r.slug}`, name: r.title })) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "LUNAR", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Resurse", item: `${SITE_URL}/resurse` },
        ] },
      ]} />
      <SubHeader />
      <header className="r-hero dots">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">LUNAR</Link><span aria-hidden="true">/</span><span aria-current="page">Resurse</span></nav>
          <div className="eyebrow">Resurse gratuite despre website-uri</div>
          <h1>Decide informat. <span className="dim" style={{ color: "var(--mute2)" }}>Gratuit.</span></h1>
          <p className="lede">Ghiduri, instrumente și template-uri pentru antreprenorii care aleg între abonament, plată unică sau DIY. Fără email obligatoriu, fără jargon.</p>
        </div>
      </header>
      <main className="wrap" style={{ paddingBottom: 120 }}>
        <ResourceHub />
      </main>
      <SiteFooter />
    </div>
  );
}
