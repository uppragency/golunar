import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResourceShell from "@/components/site/ResourceShell";
import Md, { headings } from "@/components/site/Md";
import { resourceBySlug } from "@/lib/resources";
import { ARTICLES } from "@/content/articles";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = resourceBySlug((await params).slug);
  if (!r) return {};
  return {
    title: r.metaTitle,
    description: r.metaDesc,
    alternates: { canonical: `/resurse/${r.slug}` },
    openGraph: { title: r.title, description: r.metaDesc, type: "article", url: `/resurse/${r.slug}`, publishedTime: r.updated, modifiedTime: r.updated },
  };
}

/** Articolele lungi din Resurse, scrise în content/articles (markdown minimal). */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = resourceBySlug(slug);
  const a = ARTICLES[slug];
  if (!r || !a) notFound();
  const toc = headings(a.body);
  return (
    <ResourceShell r={r} faq={a.faq}>
      <article className="article">
        {toc.length > 2 && (
          <nav className="r-toc" aria-label="Cuprins">
            <b>Cuprins</b>
            <ol>{toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
          </nav>
        )}
        <Md src={a.body} />
        {a.faq.length > 0 && (
          <>
            <h2 id="intrebari-frecvente">Întrebări frecvente</h2>
            {a.faq.map(([q, ans]) => (
              <details key={q} className="faq-q"><summary>{q}</summary><p>{ans}</p></details>
            ))}
          </>
        )}
      </article>
    </ResourceShell>
  );
}
