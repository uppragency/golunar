import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagina nu există", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <main className="auth-wrap dots">
      <div className="auth-card">
        <Link href="/" className="logo"><i />LUNAR</Link>
        <h1>Pagina nu există</h1>
        <p>Linkul poate fi greșit sau pagina a fost mutată. Încearcă una dintre paginile de mai jos.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" className="btn-plain">Pagina principală</Link>
          <Link href="/#abonamente" className="btn-plain">Abonamente</Link>
          <Link href="/resurse" className="btn-plain">Resurse</Link>
          <Link href="/audit" className="btn-plain">Audit gratuit</Link>
        </div>
      </div>
    </main>
  );
}
