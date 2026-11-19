"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OPEN = ["/cont", "/cont/plati"];

/** Până la confirmarea plății: paginile se văd, dar sunt blocate, cu mesaj și link spre datele de plată. */
export default function PayGate({ locked, children }: { locked: boolean; children: React.ReactNode }) {
  const path = usePathname();
  if (!locked || OPEN.includes(path)) return <>{children}</>;
  return (
    <div className="paygate">
      <div className="paygate-msg" role="status">
        <span className="pill acc"><span className="d" />Acces după confirmarea plății</span>
        <h2>Pagina se deblochează după prima plată.</h2>
        <p>După ce plătești prima rată prin transfer și confirmăm plata, ai acces la tot panoul: brief, website, cereri și documente. Confirmarea durează de obicei mai puțin de o zi lucrătoare.</p>
        <Link href="/cont" className="btn btn-accent"><span className="ic">→</span>Vezi datele de plată</Link>
      </div>
      <div className="paygate-content" aria-hidden="true" inert>{children}</div>
    </div>
  );
}
