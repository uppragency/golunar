"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Arrow } from "@/components/site/visuals";

export default function NewPasswordForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Minimum 8 caractere.");
    if (password !== confirm) return setErr("Parolele nu coincid.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.code === "same_password" ? "Alege o parolă diferită de cea veche." : "Parola nu a putut fi salvată.");
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="form-dark">
      <div className="fld"><label htmlFor="np">Parolă nouă</label><input id="np" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div className="fld"><label htmlFor="npc">Confirmă parola</label><input id="npc" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn btn-accent" style={{ width: "100%", justifyContent: "space-between", marginTop: 8 }} disabled={busy}>
        <span className="ic"><Arrow /></span>{busy ? "Se salvează…" : "Salvează parola"}<span style={{ width: 8 }} />
      </button>
    </form>
  );
}
