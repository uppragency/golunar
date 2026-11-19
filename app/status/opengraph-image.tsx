import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Status servicii și uptime LUNAR";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Status", title: "Status servicii LUNAR.", dim: "Uptime verificat la fiecare 10 minute." });
}
