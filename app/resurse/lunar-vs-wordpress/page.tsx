import type { Metadata } from "next";
import Link from "next/link";
import ResourceShell from "@/components/site/ResourceShell";
import VsTable from "@/components/site/VsTable";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("lunar-vs-wordpress")!;
export const metadata: Metadata = {
  title: r.metaTitle,
  description: r.metaDesc,
  alternates: { canonical: `/resurse/${r.slug}` },
  openGraph: { title: r.title, description: r.metaDesc, type: "article", url: `/resurse/${r.slug}`, publishedTime: r.updated, modifiedTime: r.updated },
};

const FAQ: [string, string][] = [
  ["WordPress este gratuit, de ce aș plăti abonament?", "Software-ul WordPress e gratuit, dar site-ul nu: plătești hosting, domeniu, teme și pluginuri premium, dezvoltarea și, mai ales, mentenanța lunară. Un site WordPress nemenținut devine vulnerabil în câteva luni."],
  ["Am deja un site WordPress. Îl puteți prelua?", "Îl refacem pe tehnologia LUNAR (Next.js), păstrăm conținutul și adresele paginilor sau setăm redirecționări, ca să nu pierzi traficul din Google. Vezi și ghidul de migrare din Resurse."],
  ["Pot edita singur textele, ca în WordPress?", "Modificările le facem noi, incluse în abonament, de obicei în 48h lucrătoare. Pentru blog sau conținut frecvent putem integra un editor simplu."],
];

const ROWS: [string, string, string][] = [
  ["Tehnologie", "Next.js, pagini generate dinainte, fără pluginuri", "PHP + bază de date + temă + pluginuri"],
  ["Securitate", "Fără panou de administrare public, fără pluginuri vulnerabile", "Ținta cea mai atacată de pe web; cere actualizări constante"],
  ["Viteză", "Scor PageSpeed țintă peste 90 pe mobil", "Depinde de hosting, temă și numărul de pluginuri"],
  ["Mentenanță", "Inclusă: actualizări, backup zilnic, monitorizare la 10 minute", "Separată: o faci tu sau plătești lunar pe cineva"],
  ["Costuri", "Un singur preț lunar, cu hosting, domeniu și SSL incluse", "Hosting, teme, pluginuri premium și dezvoltare, plătite separat"],
  ["Modificări", "Incluse lunar, făcute de echipa LUNAR", "Le faci singur sau le plătești la oră"],
  ["Proprietate", "Al tău după 12 plăți, cod-sursă la cerere", "Al tău de la început, dacă ai plătit dezvoltarea integral"],
];

export default function Page() {
  return (
    <ResourceShell r={r} faq={FAQ}>
      <article className="article">
        <p>WordPress rulează o mare parte din site-urile lumii și e o platformă foarte flexibilă. Flexibilitatea vine însă cu un cost ascuns: hosting, teme, pluginuri și o listă de actualizări care nu se termină niciodată. Pentru o firmă care vrea un site rapid, sigur și fără griji, merită comparat costul total, nu doar prețul de pornire.</p>
      </article>
      <VsTable other="WordPress" rows={ROWS} />
      <article className="article">
        <h2>Când are sens WordPress</h2>
        <ul>
          <li>Ai un magazin online mare sau un blog cu mulți autori care publică zilnic.</li>
          <li>Ai în echipă pe cineva care se ocupă de actualizări și securitate.</li>
          <li>Ai nevoie de un plugin anume, fără alternativă.</li>
        </ul>
        <h2>Când are sens LUNAR</h2>
        <ul>
          <li>Vrei un site de prezentare care aduce clienți, fără să te ocupi de actualizări.</li>
          <li>Vrei viteză și securitate de la început, nu reparate ulterior.</li>
          <li>Vrei un singur furnizor și un singur preț lunar, previzibil.</li>
        </ul>
        <div className="callout"><b>Regula simplă</b><p>Un site WordPress fără mentenanță lunară e o problemă amânată. Dacă nu ai pe cineva care să-l întrețină, alege un site care nu are nevoie de pluginuri.</p></div>
        <p>Vrei să muți un site existent? Citește <Link className="inl" href="/resurse/schimbi-furnizorul-web-fara-sa-pierzi-trafic">cum schimbi furnizorul fără să pierzi trafic</Link> sau vezi <Link className="inl" href="/tehnologii">tehnologiile cu care lucrăm</Link>.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </ResourceShell>
  );
}
