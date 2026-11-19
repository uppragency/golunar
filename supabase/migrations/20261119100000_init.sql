-- LUNAR · schema inițială
-- Stripe și SmartBill sunt sursa de adevăr pentru bani și facturi; Supabase ține copia sincronizată
-- prin webhook-uri, plus datele pe care Stripe nu le are (site, proprietate, cereri).
-- Toate tabelele au RLS activ, filtrat pe company_id.

create extension if not exists citext with schema extensions;

-- ---------- enums ----------
create type public.member_role as enum ('owner','billing','viewer');
create type public.plan_code as enum ('essential','growth','partner');
create type public.addon_code as enum ('brand','local','lang');
create type public.currency_code as enum ('RON','EUR');
create type public.sub_status as enum ('incomplete','active','past_due','paused','canceled');
create type public.payment_mode as enum ('card','bank_transfer');
create type public.installment_status as enum ('scheduled','paid','failed','overdue');
create type public.website_status as enum ('onboarding','building','live','suspended','transferred');
create type public.launch_stage as enum ('brief','design','build','qa','live');
create type public.request_type as enum ('improvement','bug','billing');
create type public.request_status as enum ('new','in_progress','delivered','resolved','rejected');
create type public.document_kind as enum ('contract','annex','dpa','brief','handover','source');
create type public.match_status as enum ('auto','manual','unmatched');
create type public.event_source as enum ('stripe','smartbill','resend','bank');

-- ---------- settings ----------
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.app_settings(key, value) values
  ('eur_ron_rate', '5.09'::jsonb),
  ('plans', '{
     "essential":{"name":"Esențial","eur":89,"ron":449,"improvements":1},
     "growth":{"name":"Creștere","eur":189,"ron":949,"improvements":2},
     "partner":{"name":"Partener","eur":390,"ron":1990,"improvements":4}}'::jsonb),
  ('addons', '{
     "brand":{"name":"Identitate vizuală","eur":79,"ron":399,"max_cycles":12},
     "local":{"name":"Vizibilitate locală Google","eur":39,"ron":199},
     "lang":{"name":"Limbă suplimentară","eur":29,"ron":149,"max_qty":5}}'::jsonb),
  ('bank', '{"iban_eur":"","iban_ron":"","bank":"","beneficiary":""}'::jsonb);

-- ---------- companies & access ----------
create sequence public.bank_reference_seq start 101;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  cui text not null unique,
  name text not null,
  reg_com text,
  address text,
  vat_payer boolean not null default true,
  bank text,
  iban text,
  legal_rep text,
  billing_email citext,
  notify_email citext,
  phone text,
  currency public.currency_code not null default 'RON',
  stripe_customer_id text unique,
  smartbill_client_ref text,
  bank_reference text not null unique default ('LNR-' || lpad(nextval('public.bank_reference_seq')::text, 4, '0')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role public.member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (user_id, company_id)
);
create index members_company_idx on public.members(company_id);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Invitații: când un utilizator cu acest email se autentifică prima dată, primește accesul.
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  company_id uuid references public.companies(id) on delete cascade,
  role public.member_role not null default 'owner',
  is_admin boolean not null default false,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (company_id is not null or is_admin)
);
create unique index invites_unique on public.invites(email, coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid), is_admin);

-- ---------- subscriptions ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  stripe_subscription_id text unique,
  plan public.plan_code not null,
  status public.sub_status not null default 'incomplete',
  payment_mode public.payment_mode not null default 'card',
  currency public.currency_code not null default 'RON',
  billing_day smallint check (billing_day between 1 and 28),
  started_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  min_commitment_months smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_company_idx on public.subscriptions(company_id);

create table public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  addon public.addon_code not null,
  quantity smallint not null default 1 check (quantity between 1 and 5),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  max_cycles smallint,
  stripe_item_id text,
  created_at timestamptz not null default now(),
  unique (subscription_id, addon)
);
create index subscription_items_company_idx on public.subscription_items(company_id);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  number smallint not null check (number between 1 and 12),
  due_date date not null,
  amount_plan numeric(10,2) not null,
  amount_addons numeric(10,2) not null default 0,
  amount_net numeric(10,2) generated always as (amount_plan + amount_addons) stored,
  vat_rate numeric(4,2) not null default 21,
  currency public.currency_code not null,
  status public.installment_status not null default 'scheduled',
  paid_at timestamptz,
  method text,
  stripe_invoice_id text unique,
  created_at timestamptz not null default now(),
  unique (subscription_id, number)
);
create index installments_company_idx on public.installments(company_id, due_date);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installment_id uuid references public.installments(id) on delete set null,
  attempted_at timestamptz not null default now(),
  method_label text not null,
  succeeded boolean not null,
  failure_reason text,
  stripe_payment_intent_id text
);
create index payment_attempts_company_idx on public.payment_attempts(company_id, attempted_at desc);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  stripe_payment_method_id text not null unique,
  brand text not null,
  last4 text not null,
  exp_month smallint not null,
  exp_year smallint not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index payment_methods_company_idx on public.payment_methods(company_id);

-- ---------- invoices ----------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installment_id uuid references public.installments(id) on delete set null,
  smartbill_series text not null default 'LNR',
  smartbill_number text not null,
  issued_at date not null,
  period_label text,
  total numeric(10,2) not null,
  currency public.currency_code not null,
  total_ron numeric(10,2),
  bnr_rate numeric(8,4),
  payment_label text,
  pdf_path text,
  xml_path text,
  spv_status text not null default 'pending',
  spv_index text,
  created_at timestamptz not null default now(),
  unique (smartbill_series, smartbill_number)
);
create index invoices_company_idx on public.invoices(company_id, issued_at desc);

create table public.proformas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installment_id uuid not null references public.installments(id) on delete cascade,
  number text not null unique,
  pdf_path text,
  bank_reference text not null,
  due_date date not null,
  created_at timestamptz not null default now()
);
create index proformas_company_idx on public.proformas(company_id);

create table public.bank_transfers (
  id uuid primary key default gen_random_uuid(),
  received_at date not null,
  payer_name text not null,
  reference text,
  amount numeric(10,2) not null,
  currency public.currency_code not null,
  matched_installment_id uuid references public.installments(id) on delete set null,
  match_status public.match_status not null default 'unmatched',
  confirmed_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- ---------- websites ----------
create table public.websites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  domain text not null unique,
  registrar text,
  domain_expires_at date,
  status public.website_status not null default 'onboarding',
  launched_at date,
  vercel_project_id text,
  ga4_id text,
  email_provider text,
  dns_auth_ok boolean not null default false,
  search_console boolean not null default false,
  business_profile boolean not null default false,
  uptime_90d numeric(5,2),
  cwv_ok boolean,
  last_backup_at timestamptz,
  preview_title text,
  preview_subtitle text,
  created_at timestamptz not null default now()
);
create index websites_company_idx on public.websites(company_id);

create table public.website_metrics (
  website_id uuid not null references public.websites(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  month date not null,
  visitors integer not null default 0,
  form_leads integer not null default 0,
  avg_position numeric(5,2),
  maps_calls integer,
  primary key (website_id, month)
);
create index website_metrics_company_idx on public.website_metrics(company_id);

create table public.launch_projects (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null unique references public.websites(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  day_counter smallint not null default 1 check (day_counter between 0 and 30),
  sla_paused boolean not null default false,
  paused_reason text,
  stage public.launch_stage not null default 'brief',
  started_at date not null default current_date,
  due_at date,
  completed_at date
);

create table public.ownership (
  website_id uuid primary key references public.websites(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  eligible_at date,
  transferred_at date,
  buyout_amount numeric(10,2),
  handover_pdf_path text,
  source_delivered_at date
);

-- ---------- requests, documents ----------
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  type public.request_type not null,
  title text not null check (char_length(title) between 3 and 160),
  body text check (char_length(body) <= 5000),
  status public.request_status not null default 'new',
  month_bucket date not null default date_trunc('month', now())::date,
  hours_spent numeric(5,2),
  delivered_at date,
  created_at timestamptz not null default now()
);
create index requests_company_idx on public.requests(company_id, created_at desc);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  kind public.document_kind not null,
  title text not null,
  version smallint not null default 1,
  pages smallint,
  signed_at timestamptz,
  signed_ip inet,
  pdf_path text,
  locked_until_installment smallint,
  created_at timestamptz not null default now()
);
create index documents_company_idx on public.documents(company_id);

-- ---------- logs ----------
create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  template text not null,
  to_email citext not null,
  resend_id text unique,
  sent_at timestamptz not null default now(),
  status text not null default 'sent'
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  source public.event_source not null,
  external_id text not null,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null,
  phone text,
  company text,
  message text,
  plan public.plan_code,
  source text,
  created_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;

create or replace function public.is_member(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.members m where m.company_id = cid and m.user_id = (select auth.uid()));
$$;

create or replace function public.has_company_role(cid uuid, roles public.member_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.members m where m.company_id = cid and m.user_id = (select auth.uid()) and m.role = any(roles));
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger companies_touch before update on public.companies for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions for each row execute function public.touch_updated_at();

-- La prima autentificare, invitațiile pe email se transformă în acces.
create or replace function public.accept_invites()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.members(user_id, company_id, role)
    select new.id, i.company_id, i.role from public.invites i
    where lower(i.email::text) = lower(new.email) and i.company_id is not null and i.accepted_at is null
  on conflict do nothing;
  insert into public.admins(user_id)
    select new.id from public.invites i
    where lower(i.email::text) = lower(new.email) and i.is_admin and i.accepted_at is null
  on conflict do nothing;
  update public.invites set accepted_at = now()
    where lower(email::text) = lower(new.email) and accepted_at is null;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.accept_invites();

-- Cererile de îmbunătățire nu pot depăși cota planului în luna curentă.
create or replace function public.enforce_improvement_quota()
returns trigger language plpgsql security definer set search_path = '' as $$
declare quota int; used int;
begin
  if new.type <> 'improvement' then return new; end if;
  select coalesce((s.value -> sub.plan::text ->> 'improvements')::int, 0) into quota
    from public.subscriptions sub, public.app_settings s
    where sub.company_id = new.company_id and sub.status in ('active','past_due') and s.key = 'plans'
    order by sub.created_at desc limit 1;
  select count(*) into used from public.requests r
    where r.company_id = new.company_id and r.type = 'improvement' and r.month_bucket = new.month_bucket and r.status <> 'rejected';
  if coalesce(quota,0) <= used and not public.is_admin() then
    raise exception 'Ai folosit toate îmbunătățirile incluse luna aceasta.' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger requests_quota before insert on public.requests for each row execute function public.enforce_improvement_quota();

-- ---------- RLS ----------
alter table public.app_settings enable row level security;
alter table public.companies enable row level security;
alter table public.members enable row level security;
alter table public.admins enable row level security;
alter table public.invites enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_items enable row level security;
alter table public.installments enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_methods enable row level security;
alter table public.invoices enable row level security;
alter table public.proformas enable row level security;
alter table public.bank_transfers enable row level security;
alter table public.websites enable row level security;
alter table public.website_metrics enable row level security;
alter table public.launch_projects enable row level security;
alter table public.ownership enable row level security;
alter table public.requests enable row level security;
alter table public.documents enable row level security;
alter table public.email_log enable row level security;
alter table public.events enable row level security;
alter table public.leads enable row level security;

-- setări: oricine citește prețurile; doar admin modifică
create policy settings_read on public.app_settings for select using (key in ('plans','addons','eur_ron_rate') or (select public.is_admin()));
create policy settings_admin on public.app_settings for all using ((select public.is_admin())) with check ((select public.is_admin()));

-- firme: membrii citesc; owner/billing editează; admin tot
create policy companies_read on public.companies for select using ((select public.is_admin()) or public.is_member(id));
create policy companies_update on public.companies for update
  using ((select public.is_admin()) or public.has_company_role(id, array['owner','billing']::public.member_role[]))
  with check ((select public.is_admin()) or public.has_company_role(id, array['owner','billing']::public.member_role[]));
create policy companies_admin_ins on public.companies for insert with check ((select public.is_admin()));
create policy companies_admin_del on public.companies for delete using ((select public.is_admin()));

create policy members_read on public.members for select using ((select public.is_admin()) or user_id = (select auth.uid()) or public.has_company_role(company_id, array['owner']::public.member_role[]));
create policy members_admin on public.members for all using ((select public.is_admin())) with check ((select public.is_admin()));

create policy admins_read on public.admins for select using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy invites_admin on public.invites for all using ((select public.is_admin())) with check ((select public.is_admin()));

-- tabele per firmă: citire membri, scriere admin (webhook-urile folosesc service_role)
do $$
declare t text;
begin
  foreach t in array array['subscriptions','subscription_items','installments','payment_attempts','payment_methods',
                           'invoices','proformas','websites','website_metrics','launch_projects','ownership','documents']
  loop
    execute format('create policy %1$s_read on public.%1$s for select using ((select public.is_admin()) or public.is_member(company_id))', t);
    execute format('create policy %1$s_admin on public.%1$s for all using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- cereri: membrii (nu viewer) creează pentru firma lor
create policy requests_read on public.requests for select using ((select public.is_admin()) or public.is_member(company_id));
create policy requests_insert on public.requests for insert with check (
  (select public.is_admin()) or (public.has_company_role(company_id, array['owner','billing']::public.member_role[]) and created_by = (select auth.uid()) and status = 'new'));
create policy requests_admin_upd on public.requests for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy requests_admin_del on public.requests for delete using ((select public.is_admin()));

-- doar admin
create policy bank_transfers_admin on public.bank_transfers for all using ((select public.is_admin())) with check ((select public.is_admin()));
create policy email_log_admin on public.email_log for all using ((select public.is_admin())) with check ((select public.is_admin()));
create policy events_admin on public.events for select using ((select public.is_admin()));
create policy leads_admin on public.leads for select using ((select public.is_admin()));

-- ---------- storage ----------
insert into storage.buckets (id, name, public) values ('documents','documents', false) on conflict do nothing;
create policy documents_read on storage.objects for select to authenticated using (
  bucket_id = 'documents' and ((select public.is_admin()) or public.is_member(((storage.foldername(name))[1])::uuid)));
create policy documents_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()))
  with check (bucket_id = 'documents' and (select public.is_admin()));

-- ---------- admini inițiali ----------
insert into public.invites(email, is_admin) values ('golunar2027@gmail.com', true), ('golunar@uppr.agency', true);
