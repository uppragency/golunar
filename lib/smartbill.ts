import "server-only";

type Line = { name: string; quantity: number; price: number };
type InvoiceInput = {
  client: { name: string; vatCode: string; regCom?: string | null; address?: string | null; email?: string | null; isTaxPayer: boolean };
  currency: "RON" | "EUR";
  lines: Line[];
  issueDate: string; // YYYY-MM-DD
  paid: boolean;
  paymentType?: "Card" | "Ordin plata";
};

/**
 * Emits a fiscal invoice in SmartBill (sent to SPV / e-Factura by SmartBill).
 * Returns null when SmartBill is not configured, so payments keep working.
 */
export async function createSmartbillInvoice(input: InvoiceInput) {
  const user = process.env.SMARTBILL_USER, token = process.env.SMARTBILL_TOKEN, cif = process.env.SMARTBILL_CIF;
  if (!user || !token || !cif) return null;
  const body = {
    companyVatCode: cif,
    client: { ...input.client, country: "Romania", saveToDb: true },
    issueDate: input.issueDate,
    seriesName: process.env.SMARTBILL_SERIES || "LNR",
    currency: input.currency,
    language: "RO",
    precision: 2,
    useEinvoice: true,
    sendEmail: false,
    products: input.lines.map((l) => ({
      name: l.name, measuringUnitName: "luna", currency: input.currency, quantity: l.quantity, price: l.price,
      isTaxIncluded: false, taxName: "Normala", taxPercentage: 21, isService: true, saveToDb: false,
    })),
    ...(input.paid
      ? { payment: { value: Math.round(input.lines.reduce((a, l) => a + l.quantity * l.price, 0) * 121) / 100, type: input.paymentType || "Card", isCash: false } }
      : {}),
  };
  const res = await fetch("https://ws.smartbill.ro/SBORO/api/invoice", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", authorization: "Basic " + Buffer.from(`${user}:${token}`).toString("base64") },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errorText) throw new Error(`SmartBill: ${json.errorText || res.status}`);
  return { series: json.series as string, number: String(json.number) };
}
