import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "LUNAR, agenție sau AI. Ce alegi pentru website-ul tău.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Comparație", title: "LUNAR, agenție sau AI.", dim: "Ce alegi pentru website-ul tău." });
}
