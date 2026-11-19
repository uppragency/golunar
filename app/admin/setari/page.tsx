import { requireAdmin } from "@/lib/session";
import { has } from "@/lib/env";
import { Pill } from "@/components/app/charts";
import BankForm from "@/components/app/BankForm";
import { ConfirmAction } from "@/components/app/forms";
import { deleteDemoData, saveBankSettings } from "@/app/admin/actions";

export default async function SettingsPage() {
  const s = await requireAdmin();
  const [{ data: bank }, { count: demo }, { data: leads }] = await Promise.all([
    s.supabase.from("app_settings").select("value").eq("key", "bank").maybeSingle(),
    s.supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_demo", true),
    s.supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(15),
  ]);
  const rows: [string, boolean, string][] = [
    ["Supabase (bază de date, auth)", true, "Conectat"],
    ["Supabase service role (webhook-uri, checkout transfer)", has.serviceRole(), "SUPABASE_SERVICE_ROLE_KEY"],
    ["Stripe (card, abonamente)", has.stripe(), "STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET"],
    ["Resend (emailuri)", has.resend(), "RESEND_API_KEY"],
    ["SmartBill (e-Factura)", has.smartbill(), "SMARTBILL_USER, SMARTBILL_TOKEN, SMARTBILL_CIF"],
  ];
  return (
    <div>
      <div className="topbar"><div><h1>Setări</h1><p>Integrări, date bancare afișate clienților și date demo.</p></div></div>
      <div className="g g-2">
        <div className="panel">
          <h3>Integrări</h3>
          {rows.map(([name, ok, env]) => (
            <div className="kv" key={name}><span>{name}{!ok && <small style={{ display: "block", fontSize: 12 }} className="mono">{env}</small>}</span><Pill tone={ok ? "ok" : "warn"}>{ok ? "Activ" : "Lipsește"}</Pill></div>
          ))}
        </div>
        <div className="panel">
          <h3>Date bancare pentru transfer</h3>
          <BankForm action={saveBankSettings} bank={(bank?.value ?? {}) as Record<string, string>} />
        </div>
      </div>
      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Lead-uri recente</h3>
          {leads?.length ? leads.map((l) => (
            <div className="req" key={l.id}><div>{l.company || l.name}<small>{l.email}{l.phone ? ` · ${l.phone}` : ""} · {l.source} · {new Date(l.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}</small></div><span className="pill">{l.plan ?? "—"}</span></div>
          )) : <div className="empty">Niciun lead încă.</div>}
        </div>
        <div className="panel">
          <h3>Date demo</h3>
          <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>{demo ?? 0} firme demo populează panourile pentru previzualizare. Șterge-le înainte de primul client real.</p>
          {(demo ?? 0) > 0 && <ConfirmAction action={deleteDemoData} label="Șterge datele demo" className="btn-plain danger" confirm="Ștergi definitiv toate firmele demo și datele lor?" />}
        </div>
      </div>
    </div>
  );
}
