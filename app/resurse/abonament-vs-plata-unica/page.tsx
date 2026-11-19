import type { Metadata } from "next";
import ResourceShell from "@/components/site/ResourceShell";
import CostCalculator from "@/components/site/CostCalculator";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("abonament-vs-plata-unica")!;
export const metadata: Metadata = { title: r.title, description: r.excerpt, alternates: { canonical: `/resurse/${r.slug}` }, openGraph: { title: r.title, description: r.excerpt, type: "article" } };

const FAQ: [string, string][] = [
  ["Abonamentul este mai scump decât plata unică?", "Depinde de cât modifici site-ul după lansare. Dacă nu schimbi nimic timp de trei ani, plata unică iese de obicei mai ieftin. Dacă faci modificări lunare, plătești mentenanță și hosting separat, abonamentul ajunge la un cost total apropiat sau mai mic, fără investiție inițială."],
  ["Ce se întâmplă cu site-ul după 12 plăți?", "La LUNAR, după 12 plăți website-ul devine al tău. Poți continua abonamentul pentru hosting, mentenanță și îmbunătățiri sau poți cere codul-sursă și să-l muți."],
  ["Pot plăti integral de la început?", "Da. Poți răscumpăra oricând ratele rămase, la valoarea lunară curentă, iar transferul proprietății se face în 15 zile lucrătoare."],
];

export default function Page() {
  return (
    <ResourceShell r={r} faq={FAQ}>
      <article className="article">
        <p>Când compari oferte de website, prețul de pe ofertă e doar prima linie. Costul real include hosting, domeniu, actualizări de securitate, backup și fiecare modificare pe care o ceri după lansare. Pe 3 ani, aceste costuri pot depăși prețul inițial al site-ului.</p>
        <p>Calculatorul de mai jos pornește de la valori orientative pentru un site de prezentare în România. Mută cursoarele pe cifrele din oferta ta.</p>
      </article>

      <CostCalculator />

      <article className="article">
        <h2>Ce intră în costul unui site cu plată unică</h2>
        <ul>
          <li><strong>Dezvoltarea</strong>: designul și programarea, plătite la început sau în 2–3 tranșe.</li>
          <li><strong>Hosting, domeniu și certificat SSL</strong>: se plătesc anual, de multe ori la alt furnizor.</li>
          <li><strong>Mentenanța</strong>: actualizări de securitate, backup, verificarea formularelor. Fără ea, un site WordPress devine vulnerabil în câteva luni.</li>
          <li><strong>Modificările</strong>: o pagină nouă, prețuri actualizate, o secțiune pentru o campanie. Se facturează la oră sau pe proiect.</li>
          <li><strong>Refacerea</strong>: după 3–4 ani, majoritatea site-urilor cu plată unică arată învechit și se refac de la zero.</li>
        </ul>

        <h2>Când are sens plata unică</h2>
        <ul>
          <li>Ai bugetul disponibil acum și nu te încurcă să-l blochezi într-un singur proiect.</li>
          <li>Site-ul este o carte de vizită care nu se schimbă: aceleași servicii, aceleași prețuri, ani la rând.</li>
          <li>Ai pe cineva în echipă care face actualizările și mentenanța.</li>
        </ul>

        <h2>Când are sens abonamentul</h2>
        <ul>
          <li>Vrei site-ul live acum, fără o investiție de câteva mii de euro.</li>
          <li>Faci schimbări des: campanii, servicii noi, prețuri, pagini pentru Google Ads.</li>
          <li>Vrei un singur furnizor responsabil pentru tot: design, hosting, securitate, SEO.</li>
          <li>Vrei un cost lunar previzibil, care intră direct pe cheltuieli.</li>
        </ul>

        <div className="callout"><b>Regula simplă</b><p>Dacă estimezi peste o oră de modificări pe lună, compară întotdeauna costul pe 3 ani, nu prețul de pe ofertă.</p></div>

        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </ResourceShell>
  );
}
