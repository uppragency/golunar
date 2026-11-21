"use client";

import { mkCustom, mkIdentify } from "@/lib/mktr";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Arrow } from "@/components/site/visuals";

type Mode = "magic" | "password" | "signup" | "reset";

const COPY: Record<Mode, { button: string; busy: string }> = {
  magic: { button: "Trimite link-ul", busy: "Se trimite…" },
  password: { button: "Intră în cont", busy: "Se verifică…" },
  signup: { button: "Creează contul", busy: "Se creează…" },
  reset: { button: "Trimite link de resetare", busy: "Se trimite…" },
};

export default function LoginForm({ next, email: initialEmail, mode: initialMode }: { next?: string; email?: string; mode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode ?? "magic");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/cont";
  const callback = (to: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

  function switchTo(m: Mode) {
    setMode(m);
    setErr(null);
    setPassword("");
    setConfirm("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const mail = email.trim();
    mkIdentify(mail);
    mkCustom("login_portal", mail, { mod: mode });
    if (mode === "signup") {
      if (password.length < 8) return setErr("Parola trebuie să aibă minimum 8 caractere.");
      if (password !== confirm) return setErr("Parolele nu coincid.");
    }
    setBusy(true);
    const supabase = createClient();
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({ email: mail, options: { emailRedirectTo: callback(target), shouldCreateUser: true } });
        if (error) throw error;
        setSent(`Ți-am trimis link-ul pe ${mail}. Deschide-l pe acest dispozitiv. Expiră în 1 oră.`);
      } else if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
        if (error) throw error;
        router.replace(target);
        router.refresh();
        return;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: mail, password, options: { emailRedirectTo: callback(target) } });
        if (error) throw error;
        if (data.session) {
          router.replace(target);
          router.refresh();
          return;
        }
        setSent(`Cont creat. Ți-am trimis pe ${mail} un link de confirmare. După confirmare te poți loga cu parola.`);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo: callback("/parola-noua") });
        if (error) throw error;
        setSent(`Dacă ${mail} are cont, ai primit un link pentru parolă nouă.`);
      }
    } catch (e) {
      setErr(message(e, mode));
    } finally {
      setBusy(false);
    }
  }

  if (sent)
    return (
      <>
        <div className="lead-ok">{sent}</div>
        <button type="button" className="login-switch" onClick={() => { setSent(null); switchTo(mode === "reset" ? "password" : mode); }}>Înapoi</button>
      </>
    );

  return (
    <form onSubmit={submit} className="form-dark">
      <div className="fld">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@firma.ro" />
      </div>
      {(mode === "password" || mode === "signup") && (
        <div className="fld">
          <label htmlFor="password">Parolă</label>
          <input id="password" type="password" required minLength={mode === "signup" ? 8 : undefined}
            autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      )}
      {mode === "signup" && (
        <div className="fld">
          <label htmlFor="confirm">Confirmă parola</label>
          <input id="confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      )}
      {mode === "password" && (
        <button type="button" className="login-link" onClick={() => switchTo("reset")}>Am uitat parola</button>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn btn-accent" style={{ width: "100%", justifyContent: "space-between", marginTop: 8 }} disabled={busy}>
        <span className="ic"><Arrow /></span>{busy ? COPY[mode].busy : COPY[mode].button}<span style={{ width: 8 }} />
      </button>

      <div className="login-switches">
        {mode !== "password" && <button type="button" className="login-switch" onClick={() => switchTo("password")}>Loghează-te cu parola</button>}
        {mode !== "signup" && <button type="button" className="login-switch" onClick={() => switchTo("signup")}>Înregistrează-te cu parola</button>}
        {mode !== "magic" && <button type="button" className="login-switch" onClick={() => switchTo("magic")}>Primește link pe email, fără parolă</button>}
      </div>
    </form>
  );
}

function message(e: unknown, mode: Mode) {
  const err = e as { status?: number; code?: string; message?: string };
  if (err.status === 429 || err.code === "over_email_send_rate_limit") return "Prea multe încercări. Reîncearcă în câteva minute.";
  if (err.code === "invalid_credentials") return "Email sau parolă greșită.";
  if (err.code === "email_not_confirmed") return "Confirmă întâi adresa de email din link-ul primit.";
  if (err.code === "user_already_exists") return "Există deja un cont cu acest email. Loghează-te sau resetează parola.";
  if (err.code === "weak_password") return "Parola e prea slabă. Folosește minimum 8 caractere, cu litere și cifre.";
  return mode === "password" ? "Nu te-am putut autentifica." : "Nu am putut trimite emailul. Verifică adresa.";
}
