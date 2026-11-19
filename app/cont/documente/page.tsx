import { getPortalData } from "@/lib/portal-data";
import { date, money } from "@/lib/format";
import { ConfirmAction } from "@/components/app/forms";
import { cancelSubscription } from "@/app/cont/actions";
import { Arrow } from "@/components/site/visuals";

export default async function DocsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const d = await getPortalData();
  if (!d.ready) return null;
  const cur = d.currency;
  const remaining = d.open.length;
  const monthly = d.open[0]?.amount_net ?? d.installments.at(-1)?.amount_net ?? 0;
  const total = d.sum(d.open);
  const owned = Boolean(d.ownership?.transferred_at) || remaining === 0;
  const canceled = d.sub?.status === "canceled" || Boolean(d.sub?.cancel_at);
  return (
    <div>
      <div className="topbar"><div><h1>Contract și documente</h1><p>Acceptate electronic la comandă. Descarcă oricând.</p></div></div>
      {ok === "buyout" && <div className="lead-ok" style={{ marginBottom: 12 }}>Plata de răscumpărare a fost înregistrată. Transferul se face în 15 zile lucrătoare.</div>}
      <div className="g g-2">
        <div className="panel">
          <h3>Documente</h3>
          {d.docs.map((doc) => {
            const locked = doc.locked_until_installment && !owned && d.paid.length < doc.locked_until_installment;
            return (
              <div className={`doc${locked ? " locked" : ""}`} key={doc.id}>
                <div className="fi">{doc.kind === "source" ? "ZIP" : "PDF"}</div>
                <div>
                  <b>{doc.title}</b>
                  <span>{locked ? (doc.kind === "source" ? "La cerere, după transfer · max. 15 zile lucrătoare" : `Disponibil după rata ${doc.locked_until_installment}`) : doc.signed_at ? `Acceptat ${date(doc.signed_at)}${doc.pages ? ` · ${doc.pages} pagini` : ""}` : "În pregătire"}</span>
                </div>
                {locked ? <button className="btn-plain" disabled>Blocat</button> : doc.pdf_path ? <a className="btn-plain" href={`/api/files/${doc.id}`}>Descarcă</a> : <button className="btn-plain" disabled title="PDF-ul se generează în curând">În curând</button>}
              </div>
            );
          })}
          {!d.docs.length && <div className="empty">Documentele apar după comandă.</div>}
        </div>
        <div className="panel">
          {owned ? (
            <>
              <h3>Website-ul este al tău</h3>
              <p className="muted" style={{ fontSize: 14 }}>Ai plătit toate cele 12 rate. Abonamentul continuă ca serviciu de îngrijire: hosting, mentenanță, îmbunătățiri și rapoarte.</p>
            </>
          ) : (
            <>
              <h3>Vrei proprietatea mai devreme?</h3>
              <p className="muted" style={{ fontSize: 14 }}>Plătești ratele rămase la valoarea lunară curentă, inclusiv opțiunile. Transferul se face în 15 zile lucrătoare.</p>
              <div className="kv" style={{ marginTop: 12 }}><span>Rate rămase</span><b>{remaining}</b></div>
              <div className="kv"><span>Valoare lunară</span><b>{money(monthly, cur)}</b></div>
              <div className="kv"><span>Total fără TVA</span><b>{money(total, cur)}</b></div>
              <div className="kv"><span>Total cu TVA</span><b>{money(total * 1.21, cur, 2)}</b></div>
              {d.ctx.role === "owner" && (
                <form action="/api/buyout" method="post">
                  <button className="btn btn-accent" style={{ width: "100%", justifyContent: "space-between", marginTop: 16 }}><span className="ic"><Arrow size={16} /></span>Preia website-ul acum<span /></button>
                </form>
              )}
            </>
          )}
          {d.ctx.role === "owner" && !canceled && (
            <div style={{ marginTop: 10 }}>
              <ConfirmAction action={cancelSubscription} label="Anulează abonamentul" className="btn-plain" style={{ width: "100%", color: "var(--mute)" }}
                confirm={owned ? "Anulezi abonamentul de îngrijire la finalul perioadei plătite?" : `Anulezi abonamentul la finalul perioadei plătite? Fără răscumpărare (${money(total, cur)} + TVA), website-ul nu se transferă.`} />
            </div>
          )}
          {canceled && <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>Abonamentul se oprește {d.sub?.cancel_at ? `pe ${date(d.sub.cancel_at)}` : "la finalul perioadei plătite"}.</p>}
        </div>
      </div>
    </div>
  );
}
