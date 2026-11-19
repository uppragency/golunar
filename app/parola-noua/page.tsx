import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NewPasswordForm from "./NewPasswordForm";

export const metadata: Metadata = { title: "Parolă nouă", robots: { index: false } };

export default async function NewPasswordPage() {
  const s = await getSession();
  if (!s.user) redirect("/login?error=link");
  return (
    <main className="auth-wrap dots">
      <div className="auth-card">
        <Link href="/" className="logo"><i />LUNAR</Link>
        <h1>Parolă nouă</h1>
        <p>Setează parola pentru {s.user.email}.</p>
        <NewPasswordForm next={s.isAdmin ? "/admin" : "/cont"} />
      </div>
    </main>
  );
}
