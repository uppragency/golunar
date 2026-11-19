import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_MARK } from "@/lib/logo-data";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/Geist-SemiBold.ttf")).then((data) => ({ name: "Geist", data, weight: 600 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "assets/Geist-Regular.ttf")).then((data) => ({ name: "Geist", data, weight: 400 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "assets/GeistMono-Medium.ttf")).then((data) => ({ name: "GeistMono", data, weight: 400 as const, style: "normal" as const })),
  ]));

/** Imagine Open Graph în stilul site-ului: fundal închis, accent portocaliu, titlu mare. */
export async function ogImage({ kicker, title, dim, foot = "golunar.ro" }: { kicker: string; title: string; dim?: string; foot?: string }) {
  const size = title.length + (dim?.length ?? 0) > 70 ? 64 : 76;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#0B0B0C", color: "#F5F5F6", fontFamily: "Geist", position: "relative" }}>
        <div style={{ position: "absolute", left: 300, top: 380, width: 900, height: 900, borderRadius: 9999, background: "radial-gradient(circle at 50% 30%, rgba(255,91,31,0.45), rgba(255,91,31,0) 60%)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={LOGO_MARK} width={44} height={44} alt="" />
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.5 }}>LUNAR</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "GeistMono", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#8C8C93" }}>
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: "#FF5B1F", display: "flex" }} />
            {kicker}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: size, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1.04, maxWidth: 1050 }}>
            <span>{title}</span>
            {dim ? <span style={{ color: "#6E6E75" }}>{dim}</span> : null}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "GeistMono", fontSize: 22, color: "#8C8C93", letterSpacing: 1 }}>
          <span>{foot}</span>
          <span>Website pe abonament · al tău după 12 plăți</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
