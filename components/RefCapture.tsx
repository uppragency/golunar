"use client";

import { useEffect } from "react";

const DAY = 60 * 60 * 24;

/** Salvează ?ref=COD (recomandări) și sursa primei vizite (UTM sau site-ul de proveniență), 90 de zile. */
export default function RefCapture() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ref = q.get("ref")?.toUpperCase();
    if (ref && /^[A-Z0-9]{4,12}$/.test(ref)) {
      document.cookie = `lunar_ref=${ref}; Max-Age=${DAY * 90}; Path=/; SameSite=Lax; Secure`;
    }
    if (!document.cookie.split("; ").some((c) => c.startsWith("lunar_src="))) {
      let host = "";
      try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch {}
      if (host === location.hostname.replace(/^www\./, "")) host = "";
      const gclid = q.get("gclid") ? "google" : "";
      const fb = q.get("fbclid") ? "facebook" : "";
      const src = {
        s: (q.get("utm_source") || gclid || fb || host || "direct").slice(0, 60),
        m: (q.get("utm_medium") || (gclid ? "cpc" : host ? "referral" : "")).slice(0, 40),
        c: (q.get("utm_campaign") || "").slice(0, 80),
        l: location.pathname.slice(0, 80),
      };
      document.cookie = `lunar_src=${encodeURIComponent(JSON.stringify(src))}; Max-Age=${DAY * 90}; Path=/; SameSite=Lax; Secure`;
    }
  }, []);
  return null;
}
