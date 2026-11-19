import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import AuditTool from "@/components/site/AuditTool";
import { SITE_URL } from "@/lib/env";

const TITLE = "Audit SEO gratuit pentru site: viteză, SEO și mobil în 60 de secunde";
const DESC = "Audit SEO gratuit pentru site-ul tău: scor de viteză Google, SEO tehnic, adaptare pe mobil și lista cu ce merită reparat întâi. Raport trimis pe email.";

export const metadata: Metadata = {
  title: { absolute: "Audit SEO gratuit pentru site · LUNAR" },
  description: DESC,
  alternates: { canonical: "/audit" },
  openGraph: { title: TITLE, description: DESC, url: "/audit", type: "website" },
};

const FAQ: [string, string][] = [
  ["Cât costă auditul?", "Nimic. Auditul este gratuit și nu te obligă la nimic. Primești rezultatul pe pagină și raportul pe email."],
  ["Ce verifică auditul SEO gratuit?", "Viteza de încărcare pe mobil măsurată cu Google Lighthouse, SEO tehnic (titlu, descriere, H1, canonical, indexare, date structurate), securitatea HTTPS, adaptarea pe telefon și accesibilitatea."],
  ["De ce se testează varianta de mobil?", "Google indexează site-urile după versiunea de mobil, iar majoritatea vizitatorilor vin de pe telefon. Un site lent pe mobil pierde clienți și poziții."],
  ["Cât de exact este scorul?", "Scorul de viteză variază cu câteva puncte de la un test la altul, în funcție de server și rețea. Contează tendința și problemele listate, nu un punct în plus sau în minus."],
];

export default function AuditPage() {
  return (
    <PageShell
      crumbs={[["/audit", "Audit gratuit"]]}
      eyebrow="Audit SEO gratuit"
      title={<>Cât de bun e site-ul tău? <span className="dim">Află în 60 de secunde.</span></>}
      lede="Introdu adresa site-ului. Îl testăm pe un telefon simulat, măsurăm viteza cu Google Lighthouse, verificăm SEO-ul tehnic și îți spunem ce merită reparat întâi."
      jsonLd={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Audit SEO gratuit LUNAR", url: `${SITE_URL}/audit`, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: "ro-RO", offers: { "@type": "Offer", price: "0", priceCurrency: "RON" }, provider: { "@id": `${SITE_URL}/#org` } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ]}
      ctaTitle={<>Vrei problemele rezolvate, nu doar găsite? <span>Le reparăm în abonament.</span></>}
    >
      <AuditTool />
      <article className="article" style={{ marginTop: 64 }}>
        <h2>Ce primești din audit</h2>
        <ul>
          <li><strong>Scor de viteză pe mobil</strong>, măsurat cu Google Lighthouse, plus timpii care contează pentru Google: LCP, TBT și CLS.</li>
          <li><strong>Verificare SEO tehnică</strong>: titlu, meta description, H1, canonical, indexare, Open Graph, date structurate și text alternativ la imagini.</li>
          <li><strong>Lista de priorități</strong>: primele lucruri de reparat, ordonate după impact.</li>
          <li><strong>Raportul pe email</strong>, ca să-l poți trimite echipei sau furnizorului actual.</li>
        </ul>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </PageShell>
  );
}
