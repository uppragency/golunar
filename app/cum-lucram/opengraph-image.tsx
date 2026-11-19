import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Procesul de creare a unui website la LUNAR";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Proces", title: "Cum lucrăm, zi cu zi.", dim: "De la brief la proprietate." });
}
