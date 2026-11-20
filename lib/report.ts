import * as Sentry from "@sentry/nextjs";

/** Raportează în Sentry o eroare tratată (care altfel ar rămâne doar în loguri), cu zona în care a apărut. */
export function reportError(area: string, err: unknown, extra?: Record<string, unknown>) {
  const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : (err as { message?: string })?.message || JSON.stringify(err));
  console.error(`[${area}]`, e.message);
  Sentry.withScope((scope) => {
    scope.setTag("area", area);
    if (extra) scope.setContext("detalii", extra);
    Sentry.captureException(e);
  });
}

type RpcResult<T> = { data: T | null; error: { message: string; code?: string } | null };

/**
 * Apel RPC cu o reîncercare la erorile temporare ale platformei (de ex. 5xx de la gateway-ul Supabase, fără cod Postgres).
 * Erorile din baza de date (cu cod Postgres) nu se reîncearcă.
 */
export async function rpcRetry<T>(call: () => PromiseLike<RpcResult<T>>, delayMs = 2000): Promise<RpcResult<T>> {
  const first = await call();
  const transient = first.error && !first.error.code;
  if (!transient) return first;
  console.warn("[rpc] eroare temporară, reîncerc:", first.error?.message);
  await new Promise((r) => setTimeout(r, delayMs));
  return call();
}
