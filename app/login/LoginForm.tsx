"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Arrow } from "@/components/site/visuals";

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setState("busy");
    const supabase = createClient();
    const target = next && next.startsWith("/") ? next : "/cont";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`, shouldCreateUser: true },
    });
    if (error) {
      setErr(error.status === 429 ? "Prea multe încercări. Reîncearcă în câteva minute." : "Nu am putut trimite link-ul. Verifică adresa.");
      setState("idle");
      return;
    }
    setState("sent");
  }

  if (state === "sent")
    return <div className="lead-ok">Ți-am trimis link-ul pe <b>{email}</b>. Deschide-l pe acest dispozitiv. Expiră în 1 oră.</div>;

  return (
    <form onSubmit={submit} className="form-dark">
      <div className="fld">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@firma.ro" />
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn btn-accent" style={{ width: "100%", justifyContent: "space-between", marginTop: 8 }} disabled={state === "busy"}>
        <span className="ic"><Arrow /></span>{state === "busy" ? "Se trimite…" : "Trimite link-ul"}<span style={{ width: 8 }} />
      </button>
    </form>
  );
}
