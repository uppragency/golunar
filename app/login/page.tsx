import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Contul meu", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const s = await getSession();
  if (s.user) redirect(next && next.startsWith("/") ? next : s.isAdmin ? "/admin" : "/cont");
  return (
    <main className="auth-wrap dots">
      <div className="auth-card">
        <Link href="/" className="logo"><i />LUNAR</Link>
        <h1>Contul meu</h1>
        <p>Intră cu link pe email sau cu parolă.</p>
        {error && <p className="err" role="alert" style={{ marginBottom: 14 }}>Link-ul a expirat sau a fost deja folosit. Cere unul nou.</p>}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
