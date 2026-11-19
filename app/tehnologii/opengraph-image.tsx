import { ogImage, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Construim pe tehnologii de încredere.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ kicker: "Tehnologii", title: "Next.js, Vercel, Supabase.", dim: "Și încă peste 30." });
}
