/** Validări pentru formularul de comandă. `null` = câmp opțional gol (nicio marcă). */
export type Check = { ok: boolean; msg?: string } | null;

/** CUI românesc cu cifră de control (cheia 753217532). */
export function cuiValid(raw: string) {
  const d = raw.trim().toUpperCase().replace(/^RO/, "").replace(/\s/g, "");
  if (!/^\d{2,10}$/.test(d)) return false;
  const body = d.slice(0, -1).padStart(9, "0");
  const key = "753217532";
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(body[i]) * Number(key[i]);
  const c = ((s * 10) % 11) % 10;
  return c === Number(d.at(-1));
}

export const checks = {
  cui: (v: string): Check => (!v.trim() ? { ok: false, msg: "Introdu CUI-ul firmei." } : cuiValid(v) ? { ok: true } : { ok: false, msg: "CUI invalid. Verifică cifrele." }),
  name: (v: string): Check => (v.trim().length >= 2 ? { ok: true } : { ok: false, msg: "Introdu denumirea firmei." }),
  regCom: (v: string): Check => {
    const x = v.trim().toUpperCase().replace(/\s/g, "");
    if (!x) return null;
    return /^[JFC]\d{1,2}\/\d{1,7}\/(19|20)\d{2}$/.test(x) || /^[JFC]\d{8,14}$/.test(x) ? { ok: true } : { ok: false, msg: "Ex: J40/123/2020 sau J2025081624004" };
  },
  address: (v: string): Check => (v.trim().length >= 6 ? { ok: true } : { ok: false, msg: "Introdu adresa sediului." }),
  contact: (v: string): Check => (/^\p{L}[\p{L}'.-]*(\s+\p{L}[\p{L}'.-]*)+$/u.test(v.trim()) ? { ok: true } : { ok: false, msg: "Nume și prenume." }),
  email: (v: string): Check => (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? { ok: true } : { ok: false, msg: "Adresă de email invalidă." }),
  phone: (v: string): Check => {
    const x = v.replace(/[\s().-]/g, "");
    if (!x) return null;
    return /^(\+40|0040|0)7\d{8}$/.test(x) || /^(\+40|0040|0)[23]\d{8}$/.test(x) || /^\+\d{8,15}$/.test(x) ? { ok: true } : { ok: false, msg: "Ex: 0722 123 456 sau +40 722 123 456." };
  },
  domain: (v: string): Check => {
    const x = v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    if (!x) return null;
    return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(x) ? { ok: true } : { ok: false, msg: "Ex: firmata.ro" };
  },
};
export type FieldKey = keyof typeof checks;
