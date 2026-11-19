import { getPortalData } from "@/lib/portal-data";
import { SaveForm } from "@/components/app/forms";
import { updateCompany } from "@/app/cont/actions";

export default async function CompanyPage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const c = d.company;
  const canEdit = d.ctx.role === "owner" || d.ctx.role === "billing";
  return (
    <div>
      <div className="topbar"><div><h1>Date facturare</h1><p>Aceste date apar pe facturi și în e-Factura.</p></div></div>
      <SaveForm action={updateCompany} disabled={!canEdit}>
        <div className="g g-2 form-dark">
          <div className="panel">
            <h3>Firmă</h3>
            <div className="grid2">
              <div className="fld"><label htmlFor="f-name">Denumire</label><input id="f-name" name="name" defaultValue={c.name} required /></div>
              <div className="fld"><label htmlFor="f-cui">CUI</label><input id="f-cui" name="cui" defaultValue={c.cui} required /></div>
            </div>
            <div className="grid2">
              <div className="fld"><label htmlFor="f-reg">Nr. Reg. Com.</label><input id="f-reg" name="reg_com" defaultValue={c.reg_com ?? ""} /></div>
              <div className="fld"><label htmlFor="f-vat">Plătitor TVA</label><select id="f-vat" name="vat_payer" defaultValue={String(c.vat_payer)}><option value="true">Da</option><option value="false">Nu</option></select></div>
            </div>
            <div className="fld"><label htmlFor="f-addr">Adresă sediu social</label><input id="f-addr" name="address" defaultValue={c.address ?? ""} /></div>
            <div className="grid2">
              <div className="fld"><label htmlFor="f-bank">Bancă</label><input id="f-bank" name="bank" defaultValue={c.bank ?? ""} /></div>
              <div className="fld"><label htmlFor="f-iban">IBAN</label><input id="f-iban" name="iban" defaultValue={c.iban ?? ""} /></div>
            </div>
          </div>
          <div className="panel">
            <h3>Contacte</h3>
            <div className="fld"><label htmlFor="f-rep">Reprezentant legal</label><input id="f-rep" name="legal_rep" defaultValue={c.legal_rep ?? ""} /></div>
            <div className="fld"><label htmlFor="f-be">Email facturi</label><input id="f-be" type="email" name="billing_email" defaultValue={c.billing_email ?? ""} /></div>
            <div className="fld"><label htmlFor="f-ne">Email notificări</label><input id="f-ne" type="email" name="notify_email" defaultValue={c.notify_email ?? ""} /></div>
            <div className="fld"><label htmlFor="f-ph">Telefon</label><input id="f-ph" type="tel" name="phone" defaultValue={c.phone ?? ""} /></div>
            <div className="fld"><label>Monedă abonament</label><input value={c.currency === "EUR" ? "EUR" : "RON"} readOnly /></div>
          </div>
        </div>
      </SaveForm>
    </div>
  );
}
