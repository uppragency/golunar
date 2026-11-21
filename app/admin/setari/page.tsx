import { requireAdmin } from "@/lib/session";
import { has } from "@/lib/env";
import { Pill } from "@/components/app/charts";
import BankForm from "@/components/app/BankForm";
import { ConfirmAction } from "@/components/app/forms";
import { deleteDemoData, saveBankSettings, saveRetention } from "@/app/admin/actions";

export default async function SettingsPage() {
  const s = await requireAdmin();
  const [{ data: bank }, { count: demo }, { data: leads }, { data: ret }, { data: logins }] = await Promise.all([
    s.supabase.from("app_settings").select("value").eq("key", "bank").maybeSingle(),
    s.supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_demo", true),
    s.supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(15),
    s.supabase.from("app_settings").select("value").eq("key", "retention").maybeSingle(),
    s.supabase.from("admin_logins").select("*").order("created_at", { ascending: false }).limit(30),
  ]);
  const retention = (ret?.value ?? { enabled: true, percent: 50 }) as { enabled: boolean; percent: number };
  const rows: [string, boolean, string][] = [
    ["Supabase (bază de date, auth)", true, "Conectat"],
    ["Supabase service role (doar webhook Stripe, pentru plata cu cardul)", has.serviceRole(), "SUPABASE_SERVICE_ROLE_KEY"],
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
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Ofertă de retenție la anulare</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>Când un client vrea să anuleze, după ce alege motivul, primește o reducere la rata următoare. Se aplică o singură dată pe abonament.</p>
        <form action={saveRetention} className="inline-form">
          <label className="check"><input type="checkbox" name="enabled" defaultChecked={retention.enabled} />Activă</label>
          <select name="percent" defaultValue={String(retention.percent)} aria-label="Reducere">{[25, 30, 40, 50, 75, 100].map((v) => <option key={v} value={v}>{v === 100 ? "O lună gratuită" : `${v}% reducere`}</option>)}</select>
          <button className="btn-plain sm">Salvează</button>
        </form>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Jurnal de acces admin</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>Fiecare intrare în admin (o dată la 12 ore per browser). La un dispozitiv nou primești alertă pe email.</p>
        {(logins ?? []).length ? (logins ?? []).map((l) => (
          <div className="kv" key={l.id}><span>{l.email?.split("@")[0]} · {l.device}{l.new_device ? " · dispozitiv nou" : ""}<small style={{ display: "block", color: "var(--mute)" }}>{l.ip ?? "IP necunoscut"}</small></span><b style={{ fontWeight: 400 }}>{new Date(l.created_at).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</b></div>
        )) : <div className="empty sm">Nicio intrare înregistrată încă.</div>}
      </div>
    </div>
  );
}