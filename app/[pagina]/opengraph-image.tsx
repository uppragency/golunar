import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";
import { landingBySlug } from "@/lib/landings";

export const alt = "LUNAR: website pe abonament lunar, lansat în 10 zile";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ pagina: string }> }) {
  const l = landingBySlug((await params).pagina)!;
  return ogImage({ kicker: l.kind === "industry" ? `Website pentru ${l.short.toLowerCase()}` : `Creare site ${l.city}`, title: l.h1, dim: l.h1Dim });
}
