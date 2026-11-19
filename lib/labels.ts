type Tone = "ok" | "warn" | "bad" | "acc" | undefined;

export const REQ_PILL: Record<string, [Tone, string]> = {
  new: ["acc", "Nouă"], in_progress: ["warn", "În lucru"], delivered: ["ok", "Livrată"], resolved: ["ok", "Rezolvată"], rejected: ["bad", "Respinsă"],
};
export const REQ_TYPE: Record<string, string> = { improvement: "Îmbunătățire", bug: "Problemă tehnică", billing: "Facturare" };
export const INST_PILL: Record<string, [Tone, string]> = {
  paid: ["ok", "Plătită"], scheduled: [undefined, "Programată"], failed: ["bad", "Eșuată"], overdue: ["bad", "Restantă"],
};
export const SPV_PILL: Record<string, [Tone, string]> = {
  validated: ["ok", "Validată SPV"], sent: ["warn", "Trimisă SPV"], pending: ["warn", "În emitere"], error: ["bad", "Eroare SPV"], rejected: ["bad", "Respinsă SPV"],
};
export const SITE_PILL: Record<string, [Exclude<Tone, undefined>, string]> = {
  live: ["ok", "Online"], building: ["warn", "În lansare"], onboarding: ["acc", "Așteaptă brief-ul"], suspended: ["bad", "Suspendat"], transferred: ["ok", "Proprietar"],
};
export const STAGE: Record<string, string> = { brief: "brief primit", design: "design trimis", build: "dezvoltare", qa: "testare", live: "lansat" };
export const PLAN_NAME: Record<string, string> = { essential: "Esențial", growth: "Creștere", partner: "Partener" };
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
