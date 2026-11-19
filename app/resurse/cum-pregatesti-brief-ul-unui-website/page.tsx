import type { Metadata } from "next";
import ResourceShell from "@/components/site/ResourceShell";
import BriefTemplate from "@/components/site/BriefTemplate";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("cum-pregatesti-brief-ul-unui-website")!;
export const metadata: Metadata = { title: r.title, description: r.excerpt, alternates: { canonical: `/resurse/${r.slug}` }, openGraph: { title: r.title, description: r.excerpt, type: "article" } };

export default function Page() {
  return (
    <ResourceShell r={r}>
      <article className="article">
        <p>Un brief bun scurtează proiectul cu săptămâni. Echipa nu mai ghicește ce vrei, iar prima propunere de design e aproape de varianta finală. Un brief slab duce la runde nesfârșite de modificări și la un site care arată bine, dar nu vinde.</p>

        <h2>Cele 5 lucruri care contează cel mai mult</h2>
        <ol>
          <li><strong>Acțiunea principală.</strong> Ce vrei să facă vizitatorul: să sune, să programeze, să ceară ofertă. Tot site-ul se construiește în jurul ei.</li>
          <li><strong>Clientul ideal, descris concret.</strong> Nu „toată lumea”, ci „proprietar de clinică din Iași, 35–55 de ani, care caută un site nou după ce l-a dezamăgit vechiul furnizor”.</li>
          <li><strong>Întrebările pe care ți le pun clienții.</strong> Ele devin titlurile, secțiunile și răspunsurile din FAQ.</li>
          <li><strong>Ce te diferențiază.</strong> Trei motive concrete, cu cifre unde se poate: ani de experiență, garanții, timpi de răspuns.</li>
          <li><strong>Exemple, nu adjective.</strong> „Modern și curat” înseamnă altceva pentru fiecare. Trei link-uri către site-uri care îți plac spun mai mult decât o pagină de descrieri.</li>
        </ol>

        <h2>Greșeli frecvente</h2>
        <ul>
          <li>Lista de pagini în locul obiectivului. Paginile decurg din obiectiv, nu invers.</li>
          <li>Texte promise „mai târziu”. Conținutul întârziat e cea mai comună cauză a lansărilor amânate.</li>
          <li>Accesuri lipsă la domeniu și la email. Află din timp la ce registrar e domeniul și cine are parola.</li>
          <li>Prea mulți oameni care decid. Stabilește o singură persoană care aprobă designul.</li>
        </ul>

        <div className="callout"><b>Pentru clienții LUNAR</b><p>Brief-ul se completează online, în portal, în aproximativ 5 minute. Ceasul de 10 zile lucrătoare pornește în momentul în care îl trimiți.</p></div>

        <h2>Modelul de brief</h2>
        <p>Copiază-l, completează-l și trimite-l oricărui furnizor, nu doar nouă. Câmpurile pe care nu le știi încă le poți lăsa goale.</p>
      </article>
      <div className="article" style={{ maxWidth: 900 }}><BriefTemplate /></div>
    </ResourceShell>
  );
}
