import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { Arrow } from "@/components/site/visuals";
import { PLANS } from "@/lib/plans";
import { LAUNCH, allFeatures } from "@/lib/discount";
import { SITE_URL } from "@/lib/env";
import { ORG_ID } from "@/lib/seo";

const E = PLANS.essential;
const DESC = `Website-ul tău la 6 lei în prima lună: design personalizat, domeniu, hosting și lansare în 10 zile. Apoi ${E.ron} lei pe lună, TVA inclus. Ofertă pentru clienți noi.`;

export const metadata: Metadata = {
  title: { absolute: "Website la 6 lei în prima lună · LUNAR" },
  description: DESC,
  alternates: { canonical: "/website-6-lei" },
  openGraph: { title: "Website-ul tău la 6 lei în prima lună", description: DESC, url: "/website-6-lei", type: "website" },
};

const CLAIM = `/?cod=${LAUNCH.code}#abonamente`;
const lei = (v: number) => `${v.toLocaleString("ro-RO")} lei`;
const eur = (v: number) => `${v.toLocaleString("ro-RO")} €`;

const FAQ: [string, string][] = [
  ["Chiar costă 6 lei prima lună?", `Da. Pentru clienții noi, prima rată a planului Esențial este ${LAUNCH.ron} lei (${LAUNCH.eur} €), TVA inclus. Din luna a doua, abonamentul costă ${E.ron} lei (${E.eur} €) pe lună.`],
  ["Care este perioada minimă?", `Planul Esențial are o perioadă minimă de ${E.minMonths} luni. Costul minim total este ${lei(LAUNCH.ron + E.ron * (E.minMonths - 1))}: prima lună de ${LAUNCH.ron} lei și încă ${E.minMonths - 1} luni de ${E.ron} lei.`],
  ["Cum aplic oferta?", `Nu trebuie să faci nimic. Codul ${LAUNCH.code} se aplică automat când alegi planul Esențial pe golunar.ro. Îl vezi în rezumat și în desfășurătorul de plată.`],
  ["Cine poate folosi oferta?", "Firmele care nu au avut până acum un abonament LUNAR. Verificarea se face după CUI, la plată. Oferta nu se cumulează cu alte coduri de reducere."],
  ["Se aplică și la planurile Creștere sau Partener?", "Nu. Oferta de 6 lei este doar pentru planul Esențial. Poți trece oricând la un plan superior după lansare."],
  ["Ce primesc pentru 6 lei?", "Exact ce primește orice client Esențial: brief, texte și design personalizat, dezvoltare, domeniu, hosting, SSL, backup și lansare în 10 zile lucrătoare."],
];

export default function LaunchOffer() {
  const year = LAUNCH.ron + E.ron * 11;
  const yearEur = LAUNCH.eur + E.eur * 11;
  return (
    <PageShell
      crumbs={[["/website-6-lei", "Website la 6 lei"]]}
      eyebrow="Ofertă de lansare"
      title={<>Website-ul tău la 6 lei pe lună. <span className="dim">Prima lună, pe planul Esențial.</span></>}
      lede={`Începi fără investiție: plătești ${LAUNCH.ron} lei (${LAUNCH.eur} €) pentru prima lună, iar noi îți facem website-ul personalizat și îl lansăm în 10 zile lucrătoare. Apoi ${E.ron} lei pe lună, cu tot inclus.`}
      meta={<><span className="pill acc"><span className="d" />Cod {LAUNCH.code} aplicat automat</span><span className="pill">Doar pentru clienți noi</span><span className="pill">TVA inclus</span></>}
      jsonLd={[
        {
          "@context": "https://schema.org", "@type": "Offer", name: "Website la 6 lei în prima lună", description: DESC, url: `${SITE_URL}/website-6-lei`,
          price: LAUNCH.ron, priceCurrency: "RON", availability: "https://schema.org/InStock", seller: { "@id": ORG_ID }, eligibleCustomerType: "https://schema.org/Business",
          priceSpecification: [
            { "@type": "UnitPriceSpecification", name: "Prima lună", price: LAUNCH.ron, priceCurrency: "RON", valueAddedTaxIncluded: true, billingDuration: "P1M" },
            { "@type": "UnitPriceSpecification", name: "Din luna a doua", price: E.ron, priceCurrency: "RON", valueAddedTaxIncluded: true, billingDuration: "P1M", billingStart: 2 },
          ],
          itemOffered: { "@type": "Service", name: "Website pe abonament · Esențial", provider: { "@id": ORG_ID } },
        },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ]}
      ctaTitle={<>Începe cu {LAUNCH.ron} lei. <span>Codul {LAUNCH.code} e deja aplicat pe planul Esențial.</span></>}
    >
      <div className="wide-block">
        <div className="offer-grid">
          <div className="card offer-price">
            <span className="offer-k">Prima lună</span>
            <b>{lei(LAUNCH.ron)}</b>
            <small>{eur(LAUNCH.eur)} · TVA inclus</small>
            <div className="offer-rows">
              <div><span>Din luna a doua</span><b>{lei(E.ron)} / lună</b></div>
              <div><span>Perioadă minimă</span><b>{E.minMonths} luni · {lei(LAUNCH.ron + E.ron * (E.minMonths - 1))}</b></div>
              <div><span>Total primul an</span><b>{lei(year)} · {eur(yearEur)}</b></div>
              <div><span>Proprietate</span><b>după 12 plăți</b></div>
            </div>
            <Link href={CLAIM} className="btn btn-accent"><span className="ic"><Arrow /></span>Vreau website-ul la 6 lei</Link>
          </div>
          <div className="card offer-inc">
            <span className="offer-k">Ce primești</span>
            <ul className="co-feat">
              {allFeatures("essential").map((f) => <li key={f}>{f}</li>)}
              <li>Brief, texte și design personalizat</li>
              <li>Lansare în 10 zile lucrătoare, garantată</li>
              <li>Domeniul pe firma ta din prima zi</li>
              <li>Website-ul devine al tău după 12 plăți</li>
            </ul>
          </div>
        </div>
      </div>
      <article className="article">
        <h2>Cum funcționează</h2>
        <ol>
          <li><strong>Alegi planul Esențial</strong> pe pagina de abonamente. Codul {LAUNCH.code} apare deja aplicat în rezumat.</li>
          <li><strong>Completezi datele firmei</strong> după CUI și plătești {LAUNCH.ron} lei, cu cardul sau prin transfer.</li>
          <li><strong>Completezi brief-ul de 5 minute</strong>. În 10 zile lucrătoare website-ul tău e live.</li>
        </ol>
        <h2>De ce 6 lei?</h2>
        <p>Pentru că vrem să vezi diferența înainte să plătești abonamentul întreg. Prima lună acoperă designul și lansarea, adică exact partea pentru care o agenție clasică cere mii de lei în avans. Dacă după perioada minimă nu ești mulțumit, anulezi.</p>
        <div className="callout"><b>Condiții, pe scurt</b><p>Ofertă pentru firme fără abonament LUNAR anterior, verificate după CUI. Se aplică doar planului Esențial, doar primei rate. Nu se cumulează cu alte coduri. Perioada minimă a planului este de {E.minMonths} luni. Toate prețurile includ TVA.</p></div>
        <p>Vrei să vezi întâi cum stă site-ul actual? Fă un <Link className="inl" href="/audit">audit SEO gratuit</Link> sau citește <Link className="inl" href="/cum-lucram">cum lucrăm, zi cu zi</Link>.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </PageShell>
  );
}
