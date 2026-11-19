import "server-only";
import { cookies } from "next/headers";

export const REF_COOKIE = "lunar_ref";
const RX = /^[A-Z0-9]{4,12}$/;

/** Codul de recomandare salvat din ?ref=COD (90 de zile). */
export async function getRef(): Promise<string | null> {
  const v = (await cookies()).get(REF_COOKIE)?.value?.toUpperCase() ?? "";
  return RX.test(v) ? v : null;
}
