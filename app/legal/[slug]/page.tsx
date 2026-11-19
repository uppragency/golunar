import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/site/PageShell";
import { LEGAL, LEGAL_UPDATED } from "@/lib/legal";

export function generateStaticParams() {
  return Object.keys(LEGAL).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL[slug];
  if (!doc) return { title: "Legal" };
  return { title: doc.title, description: doc.description, alternates: { canonical: `/legal/${slug}` } };
}

export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL[slug];
  if (!doc) notFound();
  return (
    <PageShell crumbs={[[`/legal/${slug}`, doc.title]]} eyebrow={`Legal · actualizat ${LEGAL_UPDATED}`} title={doc.title} lede={doc.lede} cta={false}>
      <article className="article legal">{doc.body}</article>
    </PageShell>
  );
}
