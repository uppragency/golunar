"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Ultima plasă de siguranță: erori în layout-ul rădăcină sau la randare, raportate în Sentry. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="ro">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0B0B0C", color: "#F5F5F6", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#8C8C93", margin: 0 }}>Eroare neașteptată</p>
          <h1 style={{ fontSize: 30, letterSpacing: -1, margin: "14px 0 10px" }}>Ceva nu a mers bine.</h1>
          <p style={{ color: "#8C8C93", lineHeight: 1.6, margin: "0 0 24px" }}>Am fost anunțați automat și ne uităm acum. Încearcă din nou sau scrie-ne la hello@golunar.ro.</p>
          <button onClick={reset} style={{ background: "#FF5B1F", color: "#fff", border: 0, borderRadius: 999, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Încearcă din nou</button>
        </div>
      </body>
    </html>
  );
}
