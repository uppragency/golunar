import Link from "next/link";
import SubHeader from "./SubHeader";
import SiteFooter from "./SiteFooter";
import { Arrow } from "./visuals";
import { SITE_URL } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { JsonLd } from "@/lib/seo";

export type Crumb = [href: string, label: string];

/** Cadru comun pentru paginile de marketing: header, breadcrumb, hero, CTA, footer și JSON-LD (inclusiv BreadcrumbList). */
export default function PageShell({
  crumbs, eyebrow, title, lede, meta, jsonLd = [], cta = true, ctaTitle, children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: React.ReactNode;
  jsonLd?: object[];
  cta?: boolean;
  ctaTitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  const trail: Crumb[] = [["/", "LUNAR"], ...crumbs];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([h, l], i) => ({ "@type": "ListItem", position: i + 1, name: l, item: `${SITE_URL}${h === "/" ? "" : h}` })),
  };
  return (
    <div id="top">
      <JsonLd data={[breadcrumb, ...jsonLd]} />
      <SubHeader />
      <header className="r-hero dots">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            {trail.map(([h, l], i) => (
              <span key={h} style={{ display: "contents" }}>
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < trail.length - 1 ? <Link href={h}>{l}</Link> : <span aria-current="page">{l}</span>}
              </span>
            ))}
          </nav>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {lede && <p className="lede">{lede}</p>}
          {meta && <div className="r-meta">{meta}</div>}
        </div>
      </header>
      <main className="wrap">
        {children}
        {cta && (
          <div className="r-cta">
            <h3>{ctaTitle ?? <>Începi cu 4,99 lei în prima lună. <span>Apoi {PLANS.essential.ron} lei pe lună pe planul Esențial, TVA inclus. Live în 10 zile lucrătoare.</span></>}</h3>
            <Link href="/?comanda=1" className="btn"><span className="ic"><Arrow /></span>Comandă website cu 4,99 lei</Link>
          </div>
        )}
        <div style={{ height: 120 }} />
      </main>
      <SiteFooter />
    </div>
  );
}
