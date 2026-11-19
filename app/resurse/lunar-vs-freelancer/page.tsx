import type { Metadata } from "next";
import Link from "next/link";
import ResourceShell from "@/components/site/ResourceShell";
import VsTable from "@/components/site/VsTable";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("lunar-vs-freelancer")!;
export const metadata: Metadata = {
  title: r.metaTitle,
  description: r.metaDesc,
  alternates: { canonical: `/resurse/${r.slug}` },
  openGraph: { title: r.title, description: r.metaDesc, type: "article", url: `/resurse/${r.slug}`, publishedTime: r.updated, modifiedTime: r.updated },
};

const FAQ: [string, string][] = [
  ["Un freelancer nu e mai ieftin?", "Adesea da, la prețul inițial. Diferența apare după lansare: hosting, mentenanță, modificări și disponibilitate. Compară costul pe 12–36 de luni, nu doar oferta pentru dezvoltare."],
  ["Ce se întâmplă dacă freelancerul nu mai răspunde?", "E riscul cel mai des întâlnit: accesele la hosting, domeniu sau cod rămân la o singură persoană. La LUNAR, domeniul e pe firma ta din prima zi, iar contractul și suportul sunt asigurate de o firmă."],
  ["Am deja un site făcut de un freelancer. Îl puteți prelua?", "Da. Preluăm conținutul, refacem site-ul pe tehnologia LUNAR și setăm redirecționările, ca să nu pierzi pozițiile din Google."],
];

const ROWS: [string, string, string][] = [
  ["Plata", "Abonament lunar, fără avans, de la 4,99 lei prima lună", "De obicei avans și plata integrală la predare"],
  ["Termen", "10 zile lucrătoare de la brief, cu garanție: luna următoare gratuită la întârziere", "Variabil, în funcție de ceilalți clienți ai freelancerului"],
  ["După lansare", "Mentenanță, backup și îmbunătățiri lunare incluse", "Plătite separat, dacă freelancerul mai e disponibil"],
  ["Disponibilitate", "Răspuns în 48h lucrătoare, portal de client, istoric al cererilor", "Depinde de o singură persoană"],
  ["Accese și domeniu", "Domeniul pe firma ta din prima zi", "Uneori rămân pe numele freelancerului"],
  ["Contract și facturare", "Contract-cadru, factură pentru fiecare plată", "Variabil"],
  ["Proprietate", "Site-ul e al tău după 12 plăți, cod-sursă la cerere", "Al tău după plata integrală, dacă primești codul și accesele"],
];

export default function Page() {
  return (
    <ResourceShell r={r} faq={FAQ}>
      <article className="article">
        <p>Mulți antreprenori își fac primul site cu un freelancer recomandat de un prieten. Un freelancer bun poate livra un site excelent. Riscurile apar de obicei după lansare: cine face modificările, cine răspunde când site-ul cade și cine are accesele dacă colaborarea se termină.</p>
      </article>
      <VsTable other="Freelancer" rows={ROWS} />
      <article className="article">
        <h2>Ce să verifici la un freelancer</h2>
        <ul>
          <li>Domeniul și hostingul sunt pe numele firmei tale?</li>
          <li>Ce costă mentenanța și modificările după lansare?</li>
          <li>Primești codul-sursă și toate accesele la final?</li>
          <li>Ce se întâmplă dacă e în concediu sau nu mai lucrează în domeniu?</li>
        </ul>
        <h2>Când are sens LUNAR</h2>
        <ul>
          <li>Nu vrei să plătești câteva mii de lei înainte să vezi site-ul.</li>
          <li>Vrei un termen garantat și pe cineva responsabil după lansare.</li>
          <li>Vrei modificări lunare fără negociere pentru fiecare.</li>
        </ul>
        <div className="callout"><b>Regula simplă</b><p>Întreabă orice furnizor ce se întâmplă în luna 13. Răspunsul spune mai mult decât prețul.</p></div>
        <p>Vezi <Link className="inl" href="/garantii">garanțiile LUNAR</Link> și <Link className="inl" href="/cum-lucram">cum lucrăm</Link>.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </ResourceShell>
  );
}
