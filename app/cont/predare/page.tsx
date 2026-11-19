import Link from "next/link";
import { getPortalData } from "@/lib/portal-data";
import { date } from "@/lib/format";
import { PAYEE } from "@/lib/bank";
import PrintButton from "@/components/app/PrintButton";

export const metadata = { title: "Proces-verbal de predare" };

export default async function HandoverPage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const site = d.site;
  const at = d.ownership?.transferred_at;
  if (!at) {
    return (
      <div>
        <div className="topbar"><div><h1>Proces-verbal de predare</h1><p>Disponibil după a 12-a plată și finalizarea transferului.</p></div></div>
        <div className="panel"><p className="muted">Ai plătit {d.paid.length} din 12 rate. <Link className="inl" href="/cont/plati">Vezi plățile</Link></p></div>
      </div>
    );
  }
  return (
    <div>
      <div className="topbar no-print">
        <div><h1>Proces-verbal de predare</h1><p>Website-ul este proprietatea firmei tale din {date(at)}.</p></div>
        <div className="tb-r"><PrintButton /></div>
      </div>
      <div className="panel pv">
        <h2>Proces-verbal de predare-primire website</h2>
        <p className="muted">Nr. PV-{d.company.bank_reference} · {date(at)}</p>
        <h3>Părți</h3>
        <p><b>Predător:</b> {PAYEE.name}, CIF {PAYEE.cif}, {PAYEE.regCom}, {PAYEE.address}, prin serviciul LUNAR.</p>
        <p><b>Primitor:</b> {d.company.name}, CUI {d.company.cui}{d.company.reg_com ? `, ${d.company.reg_com}` : ""}{d.company.address ? `, ${d.company.address}` : ""}{d.company.legal_rep ? `, reprezentată de ${d.company.legal_rep}` : ""}.</p>
        <h3>Obiect</h3>
        <p>Website-ul <b>{site?.domain ?? "—"}</b>, realizat și întreținut în baza abonamentului LUNAR, după achitarea integrală a celor 12 rate lunare.</p>
        <h3>Se predau</h3>
        <ul>
          <li>dreptul de proprietate asupra designului și conținutului creat pentru primitor;</li>
          <li>domeniul {site?.domain ?? ""}, înregistrat pe numele primitorului;</li>
          <li>la cerere, în cel mult 15 zile lucrătoare: codul-sursă, fișierele și exportul conținutului;</li>
          <li>datele de acces la serviciile aflate pe numele primitorului.</li>
        </ul>
        <p className="muted" style={{ fontSize: 13 }}>Componentele terțe (fonturi, biblioteci, imagini licențiate, servicii externe) rămân sub licențele proprii. Găzduirea, mentenanța și îmbunătățirile pot continua cu LUNAR, la cererea primitorului.</p>
        <div className="pv-sign"><div><b>Predător</b><span>{PAYEE.name}</span></div><div><b>Primitor</b><span>{d.company.name}</span></div></div>
      </div>
      <p className="muted no-print" style={{ fontSize: 13, marginTop: 10 }}>Pentru codul-sursă, <Link className="inl" href={`/cont/cereri?titlu=${encodeURIComponent("Cerere cod-sursă după transfer")}&detalii=${encodeURIComponent("Vă rog să-mi trimiteți codul-sursă și fișierele website-ului.")}`}>trimite o cerere</Link>.</p>
    </div>
  );
}
