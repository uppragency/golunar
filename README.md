# LUNAR · golunar.ro

Website, portal client (`/cont`) și admin (`/admin`) pentru LUNAR: website-uri personalizate pe abonament lunar, proprietate după 12 plăți.

## Stack
Next.js 16 (App Router) · Supabase (Postgres + RLS, Auth magic link, Storage) · Stripe Billing · Resend · SmartBill (e-Factura) · Vercel.

## Structură
- `app/page.tsx` → site de prezentare (design din `index.html` aprobat, CSS în `app/globals.css`)
- `app/cont/*` → portal client: prezentare, website, plăți și facturi, metode de plată, date facturare, contract și documente, cereri
- `app/admin/*` → admin: prezentare (MRR, churn, mix, alerte), clienți + fișă client, încasări + reconciliere transferuri, lansări, cereri, setări
- `app/api/*` → ANAF (CUI), lead, checkout, webhook Stripe, Stripe Billing Portal, răscumpărare, descărcări semnate
- `lib/provision.ts` → creează firmă, abonament, 12 rate, website, documente, acces portal
- `supabase/migrations` → schema, RLS, funcții; `supabase/seed_demo.sql` → date demo (`delete from companies where is_demo`)

## Acces
- Admin: invitațiile `is_admin` din tabela `invites` (golunar2027@gmail.com, golunar@uppr.agency). La prima autentificare primesc rolul.
- Client: `invite_member(email, company_id, role)`; checkout-ul și „Client nou” din admin o apelează automat.
- Admin poate vedea portalul oricărui client: Fișă client → „Vezi portalul clientului”.

## Variabile de mediu
Vezi `.env.example`. Integrările lipsă sunt afișate în `/admin/setari`; aplicația funcționează și fără ele (comenzile ajung ca lead + email).

## Webhook Stripe
`https://golunar.ro/api/stripe/webhook` · evenimente: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_method.attached`, `payment_method.detached`, `customer.updated`.
