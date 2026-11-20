import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { FAQ_EXTRA } from "@/lib/faq";
import { SITE_URL } from "@/lib/env";
import { ORG_ID, faqLd } from "@/lib/seo";
import { Arrow } from "@/components/site/visuals";

const TITLE = "Migrare website gratuită: mutăm site-ul tău fără să pierzi traficul din Google";
const DESC = "Ai un site vechi pe WordPress, Wix sau făcut de un freelancer? LUNAR îl mută gratuit: preluăm conținutul, facem redirecturi 301 și lansăm site-ul nou în 10 zile lucrătoare.";
const FAQ = FAQ_EXTRA["Migrare și site existent"];

export const metadata: Metadata = {
  title: { absolute: "Migrare website gratuită · LUNAR" },
  description: DESC,
  alternates: { canonical: "/migrare-website" },
  openGraph: { title: TITLE, description: DESC, url: "/migrare-website", type: "website" },
};

const STEPS: [string, string][] = [
  ["Analizăm site-ul actual", "Rulăm auditul, facem lista paginilor care aduc trafic și a adreselor care trebuie păstrate."],
  ["Preluăm conținutul", "Textele, imaginile, serviciile și datele de contact trec în site-ul nou, rescrise unde e nevoie."],
  ["Construim site-ul nou", "Design personalizat, rapid pe mobil, gata în 10 zile lucrătoare de la brief."],
  ["Facem redirecturile", "Fiecare adresă veche importantă duce permanent (301) la pagina nouă potrivită."],
  ["Mutăm domeniul", "Schimbăm doar adresa site-ului, fără întrerupere și fără să atingem emailurile de pe domeniu."],
  ["Verificăm după lansare", "Controlăm că paginile vechi redirecționează corect și că site-ul nou e indexat în Google."],
];

export default function MigrationPage() {
  return (
    <PageShell
      crumbs={[["/migrare-website", "Migrare gratuită"]]}
      eyebrow="Migrare gratuită"
      title={<>Ai deja un site? <span className="dim">Îl mutăm gratuit, fără să pierzi traficul.</span></>}
      lede="Fie că ai WordPress, Wix sau un site făcut de un freelancer, mutarea la LUNAR e inclusă în abonament. Tu ne dai acces, noi ne ocupăm de rest."
      jsonLd={[
        { "@context": "https://schema.org", "@type": "Service", name: "Migrare website gratuită", serviceType: "Website migration", url: `${SITE_URL}/migrare-website`, provider: { "@id": ORG_ID }, areaServed: { "@type": "Country", name: "România" }, offers: { "@type": "Offer", price: "0", priceCurrency: "RON", description: "Inclusă în orice abonament LUNAR" } },
        faqLd(FAQ),
      ]}
      ctaTitle={<>Mută-ți site-ul la LUNAR. <span>Începi cu 4,99 lei în prima lună.</span></>}
    >
      <div className="mig-cta">
        <Link href="/contact?subiect=migrare" className="btn btn-accent"><span className="ic"><Arrow /></span>Trimite-ne adresa site-ului</Link>
        <Link href="/audit" className="btn-plain">Verifică întâi site-ul actual, gratuit</Link>
      </div>
      <ol className="mig-steps">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="card"><span className="mono">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></li>
        ))}
      </ol>
      <article className="article" style={{ marginTop: 56 }}>
        <h2>Ce preluăm</h2>
        <ul>
          <li>paginile de prezentare, servicii, prețuri, echipă și contact;</li>
          <li>articolele de blog care aduc trafic;</li>
          <li>imaginile, logo-ul și documentele descărcabile;</li>
          <li>titlurile și descrierile din Google, ca să nu pornești de la zero.</li>
        </ul>
        <h2>Ce discutăm separat</h2>
        <p>Magazinele online cu comenzi și conturi de clienți și funcționalitățile construite pe pluginuri specifice nu intră în migrarea gratuită. Le evaluăm înainte de comandă și îți spunem clar ce se poate.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </PageShell>
  );
}
