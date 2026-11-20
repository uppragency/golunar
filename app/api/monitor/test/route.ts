import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

/** Eroare de test pentru Sentry, protejată cu CRON_SECRET (apelată doar la verificarea configurării). */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = Sentry.captureException(new Error("Test Sentry LUNAR: monitorizarea erorilor funcționează"));
  await Sentry.flush(5000);
  return NextResponse.json({ ok: true, id });
}
