import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { date, money } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { INST_PILL, PLAN_NAME, REQ_PILL, REQ_TYPE, SITE_PILL, SPV_PILL } from "@/lib/labels";
import { BRIEF_KEYS } from "@/lib/brief";
import ContactButtons from "@/components/app/ContactButtons";
import { addNote, saveTags, deleteNote, inviteMember, markInstallmentPaid, pinNote, setSiteStatus, setViewAs, startLaunchAction, updateReferral, updateWebsite } from "@/app/admin/actions";
import { buildTimeline } from "@/lib/timeline";
import { getOps } from "@/lib/admin-ops";
import { completeHandover, deleteAsset, saveBrandKit, uploadAsset } from "@/app/admin/actions";
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
  const [{ data: notes }, { data: mails }, { data: contacts }] = await Promise.all([
    db.from("client_notes").select("*").eq("company_id", id).order("pinned", { ascending: false }).order("created_at", { ascending: false }),
    db.from("email_log").select("template, sent_at, status, to_email").eq("company_id", id).order("sent_at", { ascending: false }).limit(100),
    db.from("contact_log").select("channel, subject, author_email, created_at").eq("company_id", id).order("created_at", { ascending: false }).limit(100),
  ]);
  const ops = await getOps();
  const hs = ops.health.get(id);
  const oldP = ops.oldPrice.find((x) => x.id === id);
  const dups = ops.duplicates.filter((x) => x.a.id === id || x.b.id === id);
  const canHandover = ops.handover.some((x) => x.id === id);
  const { data: assetList } = await db.storage.from("documents").list(`${id}/assets`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  const assets = (assetList ?? []).filter((f) => f.name && !f.name.startsWith("."));
  const { data: assetUrls } = assets.length ? await db.storage.from("documents").createSignedUrls(assets.map((f) => `${id}/assets/${f.name}`), 3600) : { data: [] };
  const brand = (c?.brand ?? {}) as { colors?: string; fonts?: string; tone?: string; notes?: string; links?: string };
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
          {site && (site.status === "live" || site.status === "suspended") && (
            <form action={setSiteStatus}><input type="hidden" name="id" value={site.id} /><input type="hidden" name="status" value={site.status === "live" ? "suspended" : "live"} /><button className="btn-plain">{site.status === "live" ? "Suspendă site-ul" : "Reactivează site-ul"}</button></form>
          )}
          <form action={setViewAs}><input type="hidden" name="company_id" value={c.id} /><button className="btn-plain">Vezi portalul clientului</button></form>
        </div>
      </div>

      <div className="panel crow">
        <ContactButtons companyId={c.id} phone={c.phone} email={c.notify_email || c.billing_email} />
        <form action={saveTags} className="tags-f">
          <input type="hidden" name="company_id" value={c.id} />
          <input name="tags" defaultValue={(c.tags ?? []).join(", ")} placeholder="Etichete: stomatologie, bucurești, potențial upgrade" aria-label="Etichete" />
          <button className="btn-plain sm">Salvează etichetele</button>
        </form>
      </div>
      {(hs || oldP || dups.length > 0 || canHandover) && (
        <div className="alerts">
          {hs && <div className={`alert ${hs.score >= 80 ? "ok" : hs.score >= 60 ? "warn" : "bad"}`}><b>Sănătate {hs.score}/100</b><span>{hs.reasons.length ? hs.reasons.join(" · ") : "plăți la zi, activ în portal, site online"}</span></div>}
          {oldP && <div className="alert acc"><b>Preț istoric</b><span>Plătește {money(oldP.planPrice!, oldP.currency)} pe lună pentru {PLAN_NAME[oldP.plan]}; prețul actual de listă este {money(oldP.listPrice, oldP.currency)}. Prețul lui rămâne cel de la comandă.</span></div>}
          {dups.map((x) => { const other = x.a.id === id ? x.b : x.a; return <div className="alert warn" key={other.id}><b>Posibilă dublură</b><span>{x.why} cu <Link href={`/admin/clienti/${other.id}`}>{other.name}</Link></span></div>; })}
          {canHandover && <div className="alert acc"><b>12/12 rate plătite</b><span>Predă website-ul: marchează transferul, clientul primește emailul și procesul-verbal în portal.</span><form action={completeHandover}><input type="hidden" name="company_id" value={c.id} /><button className="btn-plain sm acc">Predă website-ul</button></form></div>}
        </div>
      )}
      <div className="g g-4">
        <div className="panel kpi"><span className="l">Plan</span><b>{sub ? PLAN_NAME[sub.plan] : "—"}</b><span className="d" style={{ color: "var(--mute)" }}>{(items ?? []).map((i) => i.addon).join(", ") || "fără opțiuni"}</span></div>
        <div className="panel kpi"><span className="l">Rate plătite</span><b>{paid}/12</b><span className="d" style={{ color: "var(--mute)" }}>{sub?.payment_mode === "card" ? "Card" : "Transfer"} · {sub?.status}</span></div>
        <div className="panel kpi"><span className="l">Lunar</span><b>{money(inst?.[0]?.amount_net ?? 0, cur)}</b><span className="d" style={{ color: "var(--mute)" }}>{cur}</span></div>
        <div className="panel kpi"><span className="l">Website</span><b style={{ fontSize: 20 }}>{site?.domain ?? "—"}</b><Pill tone={sTone}>{sLabel}</Pill></div>
      </div>

      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Notițe interne <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>clientul nu le vede</span></h3>
          <form action={addNote} className="note-f"><input type="hidden" name="company_id" value={c.id} /><textarea name="body" placeholder="Ex: preferă WhatsApp, nu suna dimineața, vrea culori deschise" required /><button className="btn-plain sm" style={{ marginTop: 6 }}>Adaugă notiță</button></form>
          <div className="notes" style={{ marginTop: 12 }}>
            {(notes ?? []).map((n) => (
              <div className={`note${n.pinned ? " pin" : ""}`} key={n.id}>
                <p>{n.body}</p>
                <small><span>{n.author_email?.split("@")[0]} · {date(n.created_at, { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span>
                    <form action={pinNote}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="company_id" value={c.id} /><input type="hidden" name="pinned" value={n.pinned ? "0" : "1"} /><button>{n.pinned ? "Desprinde" : "Fixează"}</button></form>
                    <form action={deleteNote}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="company_id" value={c.id} /><button>Șterge</button></form>
                  </span>
                </small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Cronologie</h3>
          <div className="tl">
            {buildTimeline({ company: c, subs: subs ?? [], inst: inst ?? [], reqs: reqs ?? [], mails: mails ?? [], brief, launch, notes: notes ?? [], contacts: contacts ?? [] }).slice(0, 40).map((e, k) => (
              <div className={`tl-i ${e.tone}`} key={k}>{e.title}<small>{date(e.at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}{e.sub ? ` · ${e.sub}` : ""}</small></div>
            ))}
          </div>
        </div>
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
          {(() => {
            const bucket = `${new Date().toISOString().slice(0, 7)}-01`;
            const used = (reqs ?? []).filter((r) => r.type === "improvement" && r.month_bucket === bucket && r.status !== "rejected").length;
            const incl = sub && ["active", "past_due"].includes(sub.status) ? ({ essential: 1, growth: 2, partner: 4 } as Record<string, number>)[sub.plan] : 0;
            return (
              <div className="kv" style={{ marginBottom: 8 }}>
                <span>Îmbunătățiri luna aceasta</span>
                <b className={`impr${used > incl ? " over" : used === incl && incl ? " full" : ""}`}>{used} din {incl}{used > incl ? " · peste plan" : ""}</b>
              </div>
            );
          })()}
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
      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Bibliotecă de materiale <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>{assets.length + briefFiles.length} fișiere</span></h3>
          <form action={uploadAsset} className="note-f" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input type="hidden" name="company_id" value={c.id} />
            <input type="file" name="files" multiple aria-label="Fișiere" style={{ flex: 1, minWidth: 200, fontSize: 13 }} />
            <button className="btn-plain sm">Încarcă</button>
          </form>
          <div className="assets">
            {assets.map((f, i) => (
              <div className="asset" key={f.name}>
                <a href={assetUrls?.[i]?.signedUrl ?? "#"} target="_blank" rel="noreferrer">{/\.(png|jpe?g|webp|gif|svg)$/i.test(f.name) ? <img src={assetUrls?.[i]?.signedUrl ?? ""} alt="" /> : <span className="mono">{f.name.split(".").pop()?.toUpperCase()}</span>}</a>
                <small title={f.name}>{f.name.replace(/^\d+-/, "")}</small>
                <form action={deleteAsset}><input type="hidden" name="company_id" value={c.id} /><input type="hidden" name="path" value={`${c.id}/assets/${f.name}`} /><button aria-label="Șterge">×</button></form>
              </div>
            ))}
            {briefFiles.map((f, i) => (
              <div className="asset" key={f.path}>
                <a href={signed?.[i]?.signedUrl ?? "#"} target="_blank" rel="noreferrer">{/\.(png|jpe?g|webp|gif|svg)$/i.test(f.name) ? <img src={signed?.[i]?.signedUrl ?? ""} alt="" /> : <span className="mono">{f.name.split(".").pop()?.toUpperCase()}</span>}</a>
                <small title={f.name}>{f.name} · brief</small>
              </div>
            ))}
          </div>
          {!assets.length && !briefFiles.length && <div className="empty sm">Niciun fișier încă. Logo, poze și documente se adaugă aici.</div>}
        </div>
        <div className="panel">
          <h3>Identitate și ton</h3>
          <form action={saveBrandKit} className="bc">
            <input type="hidden" name="company_id" value={c.id} />
            <label>Culori<input name="colors" defaultValue={brand.colors ?? ""} placeholder="#0B3D91 principal, #F2A900 accent" /></label>
            <label>Fonturi<input name="fonts" defaultValue={brand.fonts ?? ""} placeholder="Titluri: Inter Bold · Text: Inter" /></label>
            <label>Tonul comunicării<input name="tone" defaultValue={brand.tone ?? ""} placeholder="Cald, profesionist, fără termeni tehnici" /></label>
            <label>Linkuri utile<input name="links" defaultValue={brand.links ?? ""} placeholder="Instagram, Google Business, Drive cu poze" /></label>
            <label>Note<textarea name="notes" rows={3} defaultValue={brand.notes ?? ""} placeholder="Ce îi place, ce să evităm, prețuri, servicii principale" /></label>
            <button className="btn-plain sm">Salvează</button>
          </form>
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