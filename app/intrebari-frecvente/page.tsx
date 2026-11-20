import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { FAQ, FAQ_EXTRA } from "@/lib/faq";
import { faqLd } from "@/lib/seo";

const DESC = "Răspunsuri la întrebările despre LUNAR: abonament, prețuri, plată lunară sau anuală, facturare, proprietatea website-ului, migrare, anulare și suport.";
const ALL = { ...FAQ, ...FAQ_EXTRA };
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const metadata: Metadata = {
  title: { absolute: "Întrebări frecvente despre website pe abonament · LUNAR" },
  description: DESC,
  alternates: { canonical: "/intrebari-frecvente" },
  openGraph: { title: "Întrebări frecvente · LUNAR", description: DESC, url: "/intrebari-frecvente", type: "website" },
};

export default function FaqPage() {
  return (
    <PageShell
      crumbs={[["/intrebari-frecvente", "Întrebări frecvente"]]}
      eyebrow="Întrebări frecvente"
      title={<>Tot ce vrei să știi <span className="dim">înainte să comanzi.</span></>}
      lede="Prețuri, plată, facturare, proprietate, migrare și anulare, pe o singură pagină. Nu găsești răspunsul? Scrie-ne și revenim în cel mult o zi lucrătoare."
      jsonLd={[faqLd(Object.values(ALL).flat())]}
    >
      <nav className="faq-toc" aria-label="Categorii">
        {Object.keys(ALL).map((k) => <a key={k} href={`#${slug(k)}`}>{k}</a>)}
      </nav>
      <article className="article">
        {Object.entries(ALL).map(([cat, items]) => (
          <section key={cat} id={slug(cat)} className="faq-sec">
            <h2>{cat}</h2>
            {items.map(([q, a]) => (
              <details key={q} className="faq-q">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </section>
        ))}
        <p style={{ marginTop: 40 }}>Ai altă întrebare? <Link className="inl" href="/contact">Scrie-ne din pagina de contact</Link> sau la <a className="inl" href="mailto:hello@golunar.ro">hello@golunar.ro</a>.</p>
      </article>
    </PageShell>
  );
}
