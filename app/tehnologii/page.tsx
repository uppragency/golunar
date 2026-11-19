import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { TECH, TECH_CORE, TECH_COUNT } from "@/lib/tech";

const DESC = "Tehnologiile cu care construim website-urile LUNAR: Next.js, Vercel și Supabase ca fundament, plus instrumente pentru SEO, email, măsurare și siguranță.";

export const metadata: Metadata = {
  title: { absolute: "Tehnologii website: Next.js, Vercel, Supabase · LUNAR" },
  description: DESC,
  alternates: { canonical: "/tehnologii" },
  openGraph: { title: "Tehnologiile LUNAR", description: DESC, url: "/tehnologii", type: "website" },
};

export default function TechPage() {
  return (
    <PageShell
      crumbs={[["/tehnologii", "Tehnologii"]]}
      eyebrow="Tehnologii"
      title={<>Construim pe tehnologii <span className="dim">de încredere.</span></>}
      lede="Aceleași unelte folosite de companii mari, puse la dispoziția afacerilor locale. Cod scris pentru tine, fără teme cumpărate și fără pluginuri de actualizat."
      meta={<><span className="pill acc"><span className="d" />{TECH_COUNT} tehnologii</span><span className="pill">Fundament: Next.js, Vercel, Supabase</span></>}
    >
      <div className="wide-block">
        <div className="tech-core">
          {TECH_CORE.map((t, i) => (
            <div className="card tech-core-card" key={t.n}>
              <span className="mono">0{i + 1} · Fundament</span>
              <h3>{t.n}</h3>
              <p>{t.d}</p>
            </div>
          ))}
        </div>
        {TECH.map((g) => (
          <section className="tech-group" id={g.id} key={g.id}>
            <div className="tech-head"><h2>{g.t}</h2><p>{g.lede}</p></div>
            <div className="tech-grid">
              {g.items.map((t) => (
                <div className="tech-item" key={t.n}><b>{t.n}</b><span>{t.d}</span></div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <article className="article">
        <h2>De ce am ales acest fundament</h2>
        <p>Next.js, Vercel și Supabase sunt folosite de companii cu milioane de utilizatori. Site-urile LUNAR sunt generate dinainte și servite dintr-o rețea globală: se încarcă mai repede, au mai puține puncte vulnerabile și nu cer actualizări din partea ta.</p>
        <p>Vezi rezultatul în <Link className="inl" href="/portofoliu">portofoliu</Link> sau află <Link className="inl" href="/cum-lucram">cum lucrăm</Link>.</p>
      </article>
    </PageShell>
  );
}
