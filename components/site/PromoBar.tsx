"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Bara flotantă a campaniei de lansare. Se poate închide pentru sesiunea curentă. */
export default function PromoBar() {
  const [on, setOn] = useState(false);
  const path = usePathname();
  useEffect(() => {
    let hidden = false;
    try { hidden = sessionStorage.getItem("lunar_promo_off") === "1"; } catch {}
    if (hidden) return;
    const t = setTimeout(() => setOn(true), 1200);
    return () => clearTimeout(t);
  }, []);
  const close = () => {
    setOn(false);
    try { sessionStorage.setItem("lunar_promo_off", "1"); } catch {}
  };
  if (path === "/website-4-99-lei") return null;
  return (
    <div className={`promo-bar${on ? " on" : ""}`} role="region" aria-label="Ofertă de lansare" aria-hidden={!on}>
      <span className="promo-dot" aria-hidden="true" />
      <Link href="/website-4-99-lei" tabIndex={on ? 0 : -1} onClick={close}>
        <b>Website-ul tău de la 4,99 lei</b><span> prima lună, cu codul GOLUNAR aplicat automat</span>
      </Link>
      <button type="button" onClick={close} aria-label="Închide oferta" tabIndex={on ? 0 : -1}>×</button>
    </div>
  );
}
