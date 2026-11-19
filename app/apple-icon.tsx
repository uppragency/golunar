import { ImageResponse } from "next/og";
import { LOGO_MARK } from "@/lib/logo-data";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={LOGO_MARK} width={132} height={132} alt="" />
      </div>
    ),
    size,
  );
}
