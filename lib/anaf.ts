import "server-only";

export type AnafCompany = { cui: string; name: string; regCom: string; address: string; phone: string; vatPayer: boolean; active: boolean };

/** Public ANAF API (PlatitorTvaRest v9). No key required. */
export async function lookupCui(raw: string): Promise<AnafCompany | null> {
  const cui = raw.replace(/\D/g, "");
  if (cui.length < 2 || cui.length > 10) return null;
  const today = new Date().toISOString().slice(0, 10);
  const res = await fetch("https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify([{ cui: Number(cui), data: today }]),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`ANAF ${res.status}`);
  const json = await res.json();
  const f = json?.found?.[0];
  if (!f) return null;
  const g = f.date_generale ?? {};
  const vat = Boolean(f.inregistrare_scop_Tva?.scpTVA);
  return {
    cui: `${vat ? "RO" : ""}${g.cui ?? cui}`,
    name: g.denumire ?? "",
    regCom: g.nrRegCom ?? "",
    address: g.adresa ?? "",
    phone: g.telefon ?? "",
    vatPayer: vat,
    active: !f.stare_inactiv?.statusInactivi,
  };
}
