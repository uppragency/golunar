import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";
import { resourceBySlug } from "@/lib/resources";
import { ARTICLES } from "@/content/articles";

export const alt = "Resurse LUNAR";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const r = resourceBySlug((await params).slug)!;
  const [title, dim] = r.title.split(": ");
  return ogImage({ kicker: `Resurse · ${r.kicker}`, title: dim ? `${title}:` : title, dim, foot: "golunar.ro/resurse" });
}
