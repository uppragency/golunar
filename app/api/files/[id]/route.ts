import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Signed, 60-second download link for an invoice (pdf/xml) or document the user can see via RLS. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kind = new URL(req.url).searchParams.get("k") || "doc";
  const supabase = await createClient();
  let path: string | null = null;
  if (kind === "pdf" || kind === "xml") {
    const { data } = await supabase.from("invoices").select("pdf_path, xml_path").eq("id", id).maybeSingle();
    path = kind === "pdf" ? data?.pdf_path ?? null : data?.xml_path ?? null;
  } else {
    const { data } = await supabase.from("documents").select("pdf_path").eq("id", id).maybeSingle();
    path = data?.pdf_path ?? null;
  }
  if (!path) return NextResponse.json({ error: "Fișierul nu este încă disponibil." }, { status: 404 });
  const { data: signed, error } = await supabase.storage.from("documents").createSignedUrl(path, 60, { download: true });
  if (error || !signed) return NextResponse.json({ error: "Nu ai acces la acest fișier." }, { status: 403 });
  return NextResponse.redirect(signed.signedUrl);
}
