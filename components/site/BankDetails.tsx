import { CopyButton } from "@/components/app/forms";
import { PAYEE } from "@/lib/bank";

/** Datele pentru transfer, cu butoane de copiere. */
export default function BankDetails({ amount, reference }: { amount?: string | null; reference?: string | null }) {
  const rows: [string, string, boolean][] = [
    ["Beneficiar", PAYEE.name, true],
    ["IBAN", PAYEE.iban, true],
    ["Banca", PAYEE.bank, false],
    ...(amount ? ([["Suma", amount, true]] as [string, string, boolean][]) : []),
    ...(reference ? ([["Detalii plată", reference, true]] as [string, string, boolean][]) : []),
  ];
  return (
    <div className="bank-box">
      {rows.map(([k, v, copy]) => (
        <div className="bank-row" key={k}>
          <span>{k}</span>
          <b className={k === "IBAN" || k === "Detalii plată" ? "mono" : undefined}>{v}</b>
          {copy ? <CopyButton text={v} /> : <i />}
        </div>
      ))}
      <p className="bank-note">Scrie exact referința {reference ? <b className="mono">{reference}</b> : "comenzii"} la detaliile plății, ca să confirmăm plata rapid. Facturile sunt emise de {PAYEE.name}, CIF {PAYEE.cif}, {PAYEE.regCom}.</p>
    </div>
  );
}
