import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Resurse LUNAR pentru antreprenori";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Resurse", title: "Decide informat.", dim: "Ghiduri, instrumente și template-uri gratuite." });
}
