import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Audit SEO gratuit pentru site, de la LUNAR";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Audit SEO gratuit", title: "Cât de bun e site-ul tău?", dim: "Viteză, SEO și mobil în 60 de secunde." });
}
