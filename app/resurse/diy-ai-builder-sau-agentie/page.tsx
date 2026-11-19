import type { Metadata } from "next";
import ResourceShell from "@/components/site/ResourceShell";
import BuildQuiz from "@/components/site/BuildQuiz";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("diy-ai-builder-sau-agentie")!;
export const metadata: Metadata = {
  title: r.metaTitle,
  description: r.metaDesc,
  alternates: { canonical: `/resurse/${r.slug}` },
  openGraph: { title: r.title, description: r.metaDesc, type: "article", url: `/resurse/${r.slug}`, publishedTime: r.updated, modifiedTime: r.updated },
};

const ROWS: [string, string, string, string][] = [
  ["Timp până la lansare", "Săptămâni, în funcție de timpul tău liber", "Ore sau zile", "2–8 săptămâni la agenții clasice; 10 zile lucrătoare la LUNAR"],
  ["Cost la început", "Mic: domeniu, hosting, eventual o temă", "Mic: abonamentul platformei", "Mare la plata unică; zero la abonament"],
  ["Cost lunar", "Hosting și timpul tău", "Abonamentul platformei, care crește cu funcțiile", "Mentenanță separată sau abonament cu tot inclus"],
  ["Design", "Limitat de tema aleasă și de abilitățile tale", "Generat din șabloane; seamănă cu alte site-uri", "Personalizat pe brand și pe clienții tăi"],
  ["SEO și viteză", "Depind de cât știi", "De bază; greu de optimizat în profunzime", "Incluse, dacă sunt în ofertă; verifică explicit"],
  ["Cine repară când se strică", "Tu", "Suportul platformei, pentru platformă; restul tu", "Agenția, conform contractului"],
  ["Proprietate", "Totală", "Rămâne pe platformă; migrarea e dificilă", "Totală la plata unică; la LUNAR după 12 plăți"],
];

export default function Page() {
  return (
    <ResourceShell r={r}>
      <article className="article">
        <p>În 2026 ai trei drumuri reale spre un website: îl faci singur pe o platformă, îl generezi cu un AI builder sau îl dai unei echipe. Toate pot funcționa. Diferența e cât timp pui tu, cât controlezi și cât aduce site-ul înapoi în clienți.</p>
        <h2>Comparația pe scurt</h2>
      </article>
      <div className="wide-block article" style={{ maxWidth: 1100 }}>
        <div className="panel"><div className="tbl"><table>
          <thead><tr><th>Criteriu</th><th>DIY</th><th>AI builder</th><th>Agenție / abonament</th></tr></thead>
          <tbody>{ROWS.map(([c, a, b, d]) => <tr key={c}><td><b style={{ fontWeight: 500 }}>{c}</b></td><td>{a}</td><td>{b}</td><td>{d}</td></tr>)}</tbody>
        </table></div></div>
      </div>
      <article className="article">
        <h2>DIY: control total, costul e timpul tău</h2>
        <p>Construiești singur pe o platformă precum WordPress. Plătești puțin în bani, dar mult în ore: instalare, temă, texte, imagini, formulare, securitate, backup. Merge bine dacă ai abilități tehnice și timp. Pentru un antreprenor ocupat, orele investite sunt de obicei mai scumpe decât un abonament.</p>
        <h2>AI builder: online în câteva ore</h2>
        <p>Descrii afacerea, iar platforma generează structura, textele și imaginile. E cel mai rapid drum spre o prezență online simplă. Limitele apar când site-ul trebuie să vândă: design asemănător cu al altor site-uri, control redus asupra vitezei și SEO-ului, tracking de conversii greu de configurat și o migrare dificilă dacă vrei să pleci.</p>
        <h2>Agenție sau abonament: echipa ta externă</h2>
        <p>Primești design personalizat, texte scrise pentru clienții tăi, SEO și tracking configurate corect. Agenția clasică cere plata integrală la început și facturează separat fiecare modificare. Modelul pe abonament include dezvoltarea, hostingul, mentenanța și îmbunătățirile lunare într-un preț fix.</p>
        <div className="callout"><b>Întrebarea care decide</b><p>Site-ul tău trebuie doar să existe sau trebuie să aducă cereri de ofertă? Dacă plătești reclame sau depinzi de Google, alege o echipă care răspunde de rezultat.</p></div>
        <h2>Testul de 5 întrebări</h2>
        <p>Răspunde sincer. Recomandarea apare la final.</p>
        <BuildQuiz />
      </article>
    </ResourceShell>
  );
}
