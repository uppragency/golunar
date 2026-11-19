import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("cum-pregatesti-brief-ul-unui-website")!;
export const alt = r.title;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  const [title, dim] = r.title.split(": ");
  return ogImage({ kicker: `Resurse · ${r.kicker}`, title: dim ? `${title}:` : title, dim, foot: "golunar.ro/resurse" });
}
