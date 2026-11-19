"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "lunar-consent";

function apply(v: "granted" | "denied") {
  try { localStorage.setItem(KEY, v); } catch {}
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
  w.gtag?.("consent", "update", { ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v });
  w.dataLayer?.push({ event: "consent_update", consent: v });
}

export default function CookieBanner() {
  const path = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(KEY); } catch {}
    if (!v) setShow(true);
    const open = () => setShow(true);
    window.addEventListener("lunar:cookies", open);
    return () => window.removeEventListener("lunar:cookies", open);
  }, []);

  if (!show || path?.startsWith("/admin")) return null;

  return (
    <div className="ck" role="dialog" aria-live="polite" aria-label="Preferințe cookie-uri">
      <p>Folosim cookie-uri de analiză și marketing doar cu acordul tău, ca să înțelegem ce funcționează pe site. <Link href="/legal/cookies">Detalii</Link></p>
      <div className="ck-b">
        <button type="button" className="ck-no" onClick={() => { apply("denied"); setShow(false); }}>Refuz</button>
        <button type="button" className="ck-ok" onClick={() => { apply("granted"); setShow(false); }}>Accept</button>
      </div>
    </div>
  );
}
