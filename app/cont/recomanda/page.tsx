import { getPortalData } from "@/lib/portal-data";
import { date, money } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import CopyField from "@/components/app/CopyField";
import { SITE_URL } from "@/lib/env";

const STATUS: Record<string, [tone: "ok" | "warn" | "acc" | "bad" | undefined, label: string]> = {
  pending: [undefined, "Discuție programată"],
  converted: ["warn", "Client nou · așteaptă prima plată"],
  rewarded: ["ok", "Lună gratuită acordată"],
  rejected: ["bad", "Nu se califică"],
};

export default async function ReferralPage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const { data: refs } = await d.ctx.supabase.from("referrals").select("*").eq("referrer_company_id", d.company.id).order("created_at", { ascending: false });
  const list = refs ?? [];
  const link = `${SITE_URL}/?ref=${d.company.referral_code}`;
  const earned = list.filter((r) => r.status === "rewarded").length;
  const clients = list.filter((r) => r.status === "converted" || r.status === "rewarded").length;
  const monthly = Number(d.open[0]?.amount_plan ?? d.installments.at(-1)?.amount_plan ?? 0);
  const saved = list.filter((r) => r.status === "rewarded").length * monthly;
  const freeNext = d.installments.filter((i) => i.status !== "paid" && Number(i.amount_net) === 0);
  const msg = encodeURIComponent(`Îți recomand LUNAR: website făcut pentru firma ta, pe abonament lunar, fără avans. Devine al tău după 12 plăți. ${link}`);
  return (
    <div>
      <div className="topbar">
        <div><h1>Recomandă LUNAR</h1><p>Pentru fiecare client adus, primești o lună de abonament gratuită.</p></div>
      </div>
      <div className="g g-2">
        <div className="panel">
          <h3>Linkul tău</h3>
          <CopyField value={link} />
          <div className="share">
            <a className="btn-plain sm" href={`https://wa.me/?text=${msg}`} target="_blank" rel="noopener">WhatsApp</a>
            <a className="btn-plain sm" href={`mailto:?subject=${encodeURIComponent("Îți recomand LUNAR pentru website")}&body=${msg}`}>Email</a>
            <a className="btn-plain sm" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`} target="_blank" rel="noopener">LinkedIn</a>
            <a className="btn-plain sm" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener">Facebook</a>
          </div>
          <div className="kv" style={{ marginTop: 14 }}><span>Codul tău</span><b style={{ fontFamily: "var(--mono)" }}>{d.company.referral_code}</b></div>
          <div className="ref-stats">
            <div><b>{list.length}</b><span>recomandări</span></div>
            <div><b>{clients}</b><span>clienți noi</span></div>
            <div><b>{earned}</b><span>luni gratuite</span></div>
            <div><b>{money(saved, d.currency)}</b><span>economisit</span></div>
          </div>
          {freeNext.length > 0 && <p className="okmsg" style={{ marginTop: 12 }}>Următoarea lună gratuită: rata {freeNext[0].number}, scadentă pe {date(freeNext[0].due_date)}.</p>}
        </div>
        <div className="panel">
          <h3>Cum funcționează</h3>
          <ol className="steps-list">
            <li>Trimiți linkul unui antreprenor care are nevoie de un website.</li>
            <li>Acesta comandă un abonament LUNAR în 90 de zile de la primul click.</li>
            <li>După prima lui plată, următoarea ta rată devine automat gratuită.</li>
          </ol>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Lunile gratuite se cumulează și nu expiră cât timp abonamentul tău e activ.</p>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Istoric</h3>
        {list.length ? list.map((r) => (
          <div className="req" key={r.id}>
            <div>{r.referred_name || "Recomandare"}<small>{date(r.created_at, { day: "numeric", month: "short", year: "numeric" })}{r.reward_month ? ` · rata din ${date(r.reward_month, { month: "long", year: "numeric" })} gratuită` : ""}</small></div>
            <Pill tone={STATUS[r.status][0]}>{STATUS[r.status][1]}</Pill>
          </div>
        )) : <div className="empty">Nicio recomandare încă. Primul client adus îți aduce o lună gratuită.</div>}
      </div>
    </div>
  );
}
