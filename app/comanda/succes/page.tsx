import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Comandă confirmată", robots: { index: false } };

export default function Success() {
  return (
    <main className="auth-wrap dots">
      <div className="auth-card">
        <Link href="/" className="logo"><i />LUNAR</Link>
        <h1>Plata a fost confirmată</h1>
        <p>Ți-am trimis pe email confirmarea și accesul în portal. Următorul pas: brief-ul de 5 minute, care pornește ceasul de 10 zile lucrătoare.</p>
        <Link href="/login?next=/cont" className="btn btn-accent" style={{ width: "100%", justifyContent: "space-between" }}>
          <span className="ic">→</span>Intră în contul meu<span style={{ width: 8 }} />
        </Link>
      </div>
    </main>
  );
}
