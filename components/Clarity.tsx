"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ID = process.env.NEXT_PUBLIC_CLARITY_ID || "zkbau1db57";

/**
 * Microsoft Clarity (înregistrări de sesiuni și hărți de click), doar cu acordul pentru cookie-uri.
 * Nu rulează în admin și în portalul clienților. Câmpurile de formular sunt mascate implicit de Clarity.
 */
export default function Clarity() {
  const path = usePathname() || "/";

  useEffect(() => {
    if (path.startsWith("/admin") || path.startsWith("/cont")) return;
    const load = () => {
      let c: string | null = null;
      try { c = localStorage.getItem("lunar-consent"); } catch {}
      if (c !== "granted" || document.getElementById("clarity-js")) return;
      const w = window as unknown as { clarity?: ((...a: unknown[]) => void) & { q?: unknown[] } };
      w.clarity = w.clarity || Object.assign((...a: unknown[]) => { (w.clarity!.q = w.clarity!.q || []).push(a); }, {});
      const s = document.createElement("script");
      s.id = "clarity-js";
      s.async = true;
      s.src = `https://www.clarity.ms/tag/${ID}`;
      document.head.appendChild(s);
      w.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    };
    load();
    window.addEventListener("lunar:consent", load);
    return () => window.removeEventListener("lunar:consent", load);
  }, [path]);

  return null;
}
