import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { PORTFOLIO, PORTFOLIO_NOTE } from "@/lib/portfolio";

const DESC = "Portofoliu de website-uri realizate de echipa LUNAR: clinici stomatologice, academii, evenimente, magazine online și servicii profesionale. Vezi paginile complete.";

export const metadata: Metadata = {
  title: { absolute: "Portofoliu website-uri de prezentare și magazine · LUNAR" },
  description: DESC,
  alternates: { canonical: "/portofoliu" },
  openGraph: { title: "Portofoliu LUNAR", description: DESC, url: "/portofoliu", type: "website" },
};

export default function PortfolioPage() {
  return (
    <PageShell
      crumbs={[["/portofoliu", "Portofoliu"]]}
      eyebrow="Portofoliu"
      title={<>Făcut pentru tine. <span className="dim">Fără șabloane.</span></>}
      lede="Website-uri construite de echipa din spatele LUNAR pentru clinici, academii, evenimente, magazine online și servicii profesionale. Derulează în fiecare captură pentru a vedea pagina completă."
      meta={<><span className="pill acc"><span className="d" />{PORTFOLIO.length} proiecte</span><span className="pill">Design unic pentru fiecare client</span><p className="pf-note-acc">{PORTFOLIO_NOTE}</p></>}
    >
      <div className="wide-block">
        <div className="pf-grid">
          {PORTFOLIO.map((p, i) => (
            <article className="pf-card" id={p.slug} key={p.slug}>
              <div className="bar"><i /><i /><i /><span>{p.url ? p.url.replace(/^https?:\/\/(www\.)?/, "") : p.name}</span></div>
              <div className="pf-scroll" tabIndex={0} aria-label={`Pagina completă ${p.name}, derulabilă`}>
                <img src={`/portfolio/${p.slug}.webp`} alt={`Captură completă: ${p.name}, ${p.category}`} width={1200} height={p.h} loading={i < 2 ? "eager" : "lazy"} />
              </div>
              <div className="pf-meta">
                <div><b>{p.name}</b><span>{p.category}</span></div>
                <span className="pf-actions">
                  <a href={`/portfolio/${p.slug}.webp`} target="_blank" rel="noopener">Mărește</a>
                  {p.url && <a href={p.url} target="_blank" rel="noopener" className="live">Vezi live ↗</a>}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <article className="article">
        <h2>Vrei un site ca acestea?</h2>
        <p>Fiecare proiect pornește de la un brief scurt și ajunge online în 10 zile lucrătoare. Pe planul Esențial, prima lună costă 4,99 lei. Vezi <Link className="inl" href="/cum-lucram">cum lucrăm</Link> sau <Link className="inl" href="/?comanda=1">comandă acum</Link>.</p>
      </article>
    </PageShell>
  );
}
