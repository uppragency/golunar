import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Riscul e la noi. Nu la tine.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Garanții", title: "Riscul e la noi.", dim: "Nu la tine." });
}
