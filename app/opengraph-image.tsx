import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "LUNAR: website pe abonament lunar, al tău după 12 plăți";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Website pe abonament", title: "Website-ul tău, mai bun lună de lună.", dim: "Începi cu 6 lei în prima lună." });
}
