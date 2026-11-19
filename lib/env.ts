export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://golunar.ro").replace(/\/$/, "");
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const has = {
  serviceRole: () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  stripe: () => Boolean(process.env.STRIPE_SECRET_KEY),
  resend: () => Boolean(process.env.RESEND_API_KEY),
  smartbill: () => Boolean(process.env.SMARTBILL_USER && process.env.SMARTBILL_TOKEN && process.env.SMARTBILL_CIF),
};
