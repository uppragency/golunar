import type { Metadata } from "next";
import { createClient as createAnon } from "@supabase/supabase-js";
import PageShell from "@/components/site/PageShell";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { unsubValid } from "@/lib/unsub";

export const metadata: Metadata = { title: "Dezabonare", robots: { index: false, follow: false } };

async function unsubscribe(formData: FormData) {
  "use server";
  const email = String(formData.get("e") || ""), t = String(formData.get("t") || "");
  if (!unsubValid(email, t)) return;
  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  await db.rpc("email_unsubscribe", { p_secret: process.env.CRON_SECRET, p_email: email, p_source: "pagina" });
  const { redirect } = await import("next/navigation");
  redirect("/dezabonare?gata=1");
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const valid = q.e && q.t && unsubValid(q.e, q.t);
  return (
    <PageShell crumbs={[["/dezabonare", "Dezabonare"]]} eyebrow="Emailuri" title={q.gata ? <>Te-ai dezabonat. <span className="dim">Nu mai primești emailuri de la noi.</span></> : <>Dezabonare <span className="dim">de la emailurile LUNAR.</span></>}
      cta={false} lede={q.gata ? "Dacă ai un cont LUNAR, vei primi în continuare doar emailurile legate de abonament: facturi, plăți și lansare." : valid ? `Adresa ${q.e} nu va mai primi emailuri de prezentare și oferte.` : "Linkul nu este valid. Scrie-ne la hello@golunar.ro și te scoatem din listă manual."}>
      {!q.gata && valid && (
        <form action={unsubscribe} style={{ marginTop: 8 }}>
          <input type="hidden" name="e" value={q.e} /><input type="hidden" name="t" value={q.t} />
          <button className="btn btn-ink">Confirmă dezabonarea</button>
        </form>
      )}
    </PageShell>
  );
}
