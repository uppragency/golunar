import { getAdminData } from "@/lib/admin-data";

export async function GET() {
  const d = await getAdminData();
  const head = ["Firma", "CUI", "Domeniu", "Plan", "Moneda", "MRR", "MRR EUR", "Rate platite", "Plata", "Urmatoarea", "Status"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = d.clients.map((c) => [c.name, c.cui, c.domain, c.planName, c.currency, c.mrr, c.mrrEur.toFixed(2), c.paid, c.mode, c.nextDue ?? "", c.status].map(esc).join(","));
  return new Response("﻿" + [head.map(esc).join(","), ...rows].join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="lunar-clienti-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
