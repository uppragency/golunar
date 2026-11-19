import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { date, money } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { INST_PILL, PLAN_NAME, REQ_PILL, REQ_TYPE, SITE_PILL, SPV_PILL } from "@/lib/labels";
import { BRIEF_KEYS } from "@/lib/brief";
import { inviteMember, markInstallmentPaid, setViewAs, startLaunchAction, updateReferral, updateWebsite } from "@/app/admin/actions";
import InviteForm from "@/components/app/InviteForm";
import type { Currency } from "@/lib/plans";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireAdmin();
  const db = s.supabase;
  const [{ data: c }, { data: subs }, { data: items }, { data: inst }, { data: inv }, { data: site }, { data: reqs }, { data: members }, { data: invites }, { data: launch }, { data: refs }, { data: brief }] = await Promise.all([
    db.from("companies").select("*").eq("id", id).maybeSingle(),
    db.from("subscriptions").select("*").eq("company_id", id).order("created_at", { ascending: false }),
    db.from("subscription_items").select("*").eq("company_id", id),
    db.from("installments").select("*").eq("company_id", id).order("number"),
    db.from("invoices").select("*").eq("company_id", id).order("issued_at", { ascending: false }),
    db.from("websites").select("*").eq("company_id", id).limit(1).maybeSingle(),
    db.from("requests").select("*").eq("company_id", id).order("created_at", { ascending: false }),
    db.from("members").select("user_id, role, created_at").eq("company_id", id),
    db.from("invites").select("email, role, accepted_at").eq("company_id", id),
    db.from("launch_projects").select("*").eq("company_id", id).maybeSingle(),
    db.from("referrals").select("*").eq("referrer_company_id", id).order("created_at", { ascending: false }),
    db.from("briefs").select("*").eq("company_id", id).maybeSingle(),
  ]);
  const briefFiles = (brief?.files ?? []) as { path: string; name: string; size: number }[];
  const { data: signed } = briefFiles.length ? await db.storage.from("documents").createSignedUrls(briefFiles.map((f) => f.path), 3600) : { data: [] };
  const { data: refBy } = c?.referred_by ? await db.from("companies").select("id, name").eq("id", c.referred_by).maybeSingle() : { data: null };
  if (!c) notFound();
  const sub = subs?.[0];
  const cur = (sub?.currency ?? c.currency) as Currency;
  const paid = (inst ?? []).filter((i) => i.status === "paid").length;
  const [sTone, sLabel] = SITE_PILL[site?.status ?? "onboarding"];
  return (
    <div>
      <div className="topbar">
        <div><h1>{c.name}</h1><p>{c.cui} · {c.reg_com ?? "—"} · referință {c.bank_reference}{c.is_demo ? " · demo" : ""}</p></div>
        <div className="tb-r">
          <Link href="/admin/clienti" className="btn-plain">← Clienți</Link>
          <form action={setViewAs}><input type="hidden" name="company_id" value={c.id} /><button className="btn-plain">Vezi portalul clientului</button></form>
        </div>
      </div>

      <div className="g g-4">
        <div className="panel kpi"><span className="l">Plan</span><b>{sub ? PLAN_NAME[sub.plan] : "—"}</b><span className="d" style={{ color: "var(--mute)" }}>{(items ?? []).map((i) => i.addon).join(", ") || "fără opțiuni"}</span></div>
        <div className="panel kpi"><span className="l">Rate plătite</span><b>{paid}/12</b><span className="d" style={{ color: "var(--mute)" }}>{sub?.payment_mode === "card" ? "Card" : "Transfer"} · {sub?.status}</span></div>
        <div className="panel kpi"><span className="l">Lunar</span><b>{money(inst?.[0]?.amount_net ?? 0, cur)}</b><span className="d" style={{ color: "var(--mute)" }}>{cur}</span></div>
        <div className="panel kpi"><span className="l">Website</span><b style={{ fontSize: 20 }}>{site?.domain ?? "—"}</b><Pill tone={sTone}>{sLabel}</Pill></div>
      </div>

      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Rate</h3>
          <div className="tbl"><table>
            <thead><tr><th>Rata</th><th>Scadență</th><th className="r">Sumă</th><th>Status</th><th>Metodă</th><th className="r" /></tr></thead>
            <tbody>
              {(inst ?? []).map((i) => (
                <tr key={i.id}>
                  <td>{i.number}/12</td><td>{date(i.due_date, { day: "numeric", month: "short", year: "numeric" })}</td><td className="r">{money(+i.amount_net, cur)}</td>
                  <td><Pill tone={INST_PILL[i.status][0]}>{INST_PILL[i.status][1]}</Pill></td><td>{i.method ?? "—"}</td>
                  <td className="r">{i.status !== "paid" && (
                    <form action={markInstallmentPaid} className="inline-form" style={{ justifyContent: "flex-end" }}>
                      <input type="hidden" name="id" value={i.id} />
                      <select name="method" defaultValue="Transfer"><option>Transfer</option><option>Card</option><option>Numerar</option></select>
                      <button className="btn-plain sm">Încasată</button>
                    </form>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
        <div className="panel">
          <h3>Facturi</h3>
          {(inv ?? []).length ? (inv ?? []).map((v) => (
            <div className="kv" key={v.id}><span className="mono">{v.smartbill_series}-{v.smartbill_number} · {date(v.issued_at, { day: "numeric", month: "short" })}</span><span>{money(+v.total, v.currency, 2)} <Pill tone={SPV_PILL[v.spv_status]?.[0]}>{SPV_PILL[v.spv_status]?.[1] ?? v.spv_status}</Pill></span></div>
          )) : <div className="empty">Nicio factură.</div>}
          <h3 style={{ marginTop: 24 }}>Acces portal</h3>
          {(invites ?? []).map((m) => <div className="kv" key={m.email}><span>{m.email} · {m.role}</span><b>{m.accepted_at ? "Activ" : "Invitat"}</b></div>)}
          {!invites?.length && <p className="muted" style={{ fontSize: 13 }}>{members?.length ?? 0} membri.</p>}
          <div style={{ marginTop: 12 }}><InviteForm action={inviteMember} companyId={c.id} /></div>
        </div>
      </div>

      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel form-dark">
          <h3>Website {!launch && site && site.status === "onboarding" && (
            <form action={startLaunchAction}><input type="hidden" name="website_id" value={site.id} /><input type="hidden" name="company_id" value={c.id} /><button className="btn-plain sm">Pornește lansarea</button></form>
          )}</h3>
          {site ? (
            <form action={updateWebsite}>
              <input type="hidden" name="id" value={site.id} />
              <div className="grid2">
                <div className="fld"><label>Domeniu</label><input name="domain" defaultValue={site.domain} /></div>
                <div className="fld"><label>Status</label><select name="status" defaultValue={site.status}>{["onboarding", "building", "live", "suspended", "transferred"].map((v) => <option key={v}>{v}</option>)}</select></div>
              </div>
              <div className="grid2">
                <div className="fld"><label>Registrar</label><input name="registrar" defaultValue={site.registrar ?? ""} /></div>
                <div className="fld"><label>Domeniu expiră</label><input name="domain_expires_at" type="date" defaultValue={site.domain_expires_at ?? ""} /></div>
              </div>
              <div className="grid2">
                <div className="fld"><label>Email</label><input name="email_provider" defaultValue={site.email_provider ?? ""} /></div>
                <div className="fld"><label>GA4 ID</label><input name="ga4_id" defaultValue={site.ga4_id ?? ""} /></div>
              </div>
              <div className="grid2">
                <div className="fld"><label>Titlu previzualizare</label><input name="preview_title" defaultValue={site.preview_title ?? ""} /></div>
                <div className="fld"><label>Subtitlu</label><input name="preview_subtitle" defaultValue={site.preview_subtitle ?? ""} /></div>
              </div>
              <div className="fld"><label>Vercel project ID</label><input name="vercel_project_id" defaultValue={site.vercel_project_id ?? ""} /></div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="dns_auth_ok" defaultChecked={site.dns_auth_ok} />SPF/DKIM/DMARC</label>
                <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="search_console" defaultChecked={site.search_console} />Search Console</label>
                <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="business_profile" defaultChecked={site.business_profile} />Business Profile</label>
                <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="show_on_status" defaultChecked={site.show_on_status} />Public pe /status (acord client)</label>
              </div>
              <button className="btn-plain">Salvează website</button>
            </form>
          ) : <div className="empty">Fără website.</div>}
        </div>
        <div className="panel">
          <h3>Cereri <Link href="/admin/cereri">Toate →</Link></h3>
          {(reqs ?? []).length ? (reqs ?? []).slice(0, 8).map((r) => (
            <div className="req" key={r.id}><div>{r.title}<small>{REQ_TYPE[r.type]} · {date(r.created_at, { day: "numeric", month: "short" })}</small></div><Pill tone={REQ_PILL[r.status][0]}>{REQ_PILL[r.status][1]}</Pill></div>
          )) : <div className="empty">Nicio cerere.</div>}
          <h3 style={{ marginTop: 24 }}>Contact</h3>
          <div className="kv"><span>Reprezentant</span><b>{c.legal_rep ?? "—"}</b></div>
          <div className="kv"><span>Email facturi</span><b>{c.billing_email ?? "—"}</b></div>
          <div className="kv"><span>Telefon</span><b>{c.phone ?? "—"}</b></div>
          <div className="kv"><span>Adresă</span><b style={{ whiteSpace: "normal", textAlign: "right" }}>{c.address ?? "—"}</b></div>
          <div className="kv"><span>Stripe</span><b className="mono">{c.stripe_customer_id ?? "—"}</b></div>
          <h3 style={{ marginTop: 24 }}>Recomandări</h3>
          <div className="kv"><span>Cod</span><b className="mono">{c.referral_code}</b></div>
          <div className="kv"><span>Adus de</span><b>{refBy ? <Link href={`/admin/clienti/${refBy.id}`}>{refBy.name}</Link> : "—"}</b></div>
          {(refs ?? []).map((r) => (
            <form key={r.id} action={updateReferral} className="req form-dark" style={{ gap: 8, flexWrap: "wrap" }}>
              <input type="hidden" name="id" value={r.id} />
              <div>{r.referred_name ?? "Recomandare"}<small>{date(r.created_at, { day: "numeric", month: "short" })}</small></div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select name="status" defaultValue={r.status}>{["pending", "converted", "rewarded", "rejected"].map((v) => <option key={v}>{v}</option>)}</select>
                <input name="reward_month" type="month" defaultValue={r.reward_month ? String(r.reward_month).slice(0, 7) : ""} aria-label="Luna gratuită" />
                <button className="btn-plain sm">OK</button>
              </div>
            </form>
          ))}
        </div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Brief {brief?.submitted_at ? <Pill tone="ok">Trimis {date(brief.submitted_at, { day: "numeric", month: "short" })}</Pill> : brief ? <Pill tone="warn">Ciornă</Pill> : <Pill>Necompletat</Pill>}</h3>
        {brief ? (
          <>
            {BRIEF_KEYS.filter((q) => (brief.answers as Record<string, string>)?.[q.key]).map((q) => (
              <div className="kv" key={q.key} style={{ alignItems: "flex-start" }}><span>{q.label}</span><b style={{ whiteSpace: "pre-wrap", textAlign: "right", maxWidth: "60%" }}>{(brief.answers as Record<string, string>)[q.key]}</b></div>
            ))}
            {brief.description && <><h4 style={{ margin: "18px 0 8px" }}>Descriere</h4><p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{brief.description}</p></>}
            {brief.examples && <><h4 style={{ margin: "18px 0 8px" }}>Site-uri exemple</h4><p style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{brief.examples}</p></>}
            {briefFiles.length > 0 && <><h4 style={{ margin: "18px 0 8px" }}>Fișiere ({briefFiles.length})</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{briefFiles.map((f, i) => <a key={f.path} href={signed?.[i]?.signedUrl ?? "#"} target="_blank" rel="noreferrer" className="btn-plain sm">{f.name}</a>)}</div></>}
          </>
        ) : <div className="empty">Clientul nu a început brief-ul.</div>}
      </div>
    </div>
  );
}