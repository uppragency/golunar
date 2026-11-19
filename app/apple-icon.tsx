import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 110, height: 110, borderRadius: 9999, background: "#FF5B1F", display: "flex", position: "relative" }}>
          <div style={{ position: "absolute", left: 26, top: 22, width: 34, height: 34, borderRadius: 9999, background: "#FFFFFF", display: "flex" }} />
        </div>
      </div>
    ),
    size,
  );
}
