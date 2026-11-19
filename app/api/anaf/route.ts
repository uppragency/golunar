import { NextResponse } from "next/server";
import { lookupCui } from "@/lib/anaf";

export async function POST(req: Request) {
  const { cui } = (await req.json().catch(() => ({}))) as { cui?: string };
  if (!cui || cui.replace(/\D/g, "").length < 2) return NextResponse.json({ error: "Introdu un CUI valid." }, { status: 400 });
  try {
    const c = await lookupCui(cui);
    if (!c) return NextResponse.json({ error: "CUI-ul nu apare în baza ANAF." }, { status: 404 });
    return NextResponse.json(c, { headers: { "cache-control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "ANAF nu răspunde acum. Completează manual datele." }, { status: 502 });
  }
}
