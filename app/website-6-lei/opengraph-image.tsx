import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Website-ul tău la 6 lei în prima lună, de la LUNAR";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Ofertă de lansare · cod GOLUNAR", title: "Website-ul tău la 6 lei.", dim: "Prima lună, pe planul Esențial." });
}
