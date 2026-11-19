import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Portofoliu LUNAR. Făcut pentru tine.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Portofoliu", title: "Făcut pentru tine.", dim: "Fără șabloane." });
}
