-- Status public, monitorizare uptime, program de recomandare, rapoarte lunare.

-- ---------- uptime ----------
alter table public.websites add column if not exists show_on_status boolean not null default false;

create table if not exists public.uptime_checks (
  id bigint generated always as identity primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  checked_at timestamptz not null default now(),
  ok boolean not null,
  status_code integer,
  ms integer
);
create index if not exists uptime_checks_site_idx on public.uptime_checks(website_id, checked_at desc);
alter table public.uptime_checks enable row level security;
create policy uptime_admin_all on public.uptime_checks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy uptime_member_read on public.uptime_checks for select to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and public.is_member(w.company_id)));
grant select on public.uptime_checks to authenticated;
grant all on public.uptime_checks to service_role;

-- ---------- referral ----------
alter table public.companies add column if not exists referral_code text unique;
update public.companies set referral_code = upper(substr(md5(id::text || random()::text), 1, 6)) where referral_code is null;
alter table public.companies alter column referral_code set default upper(substr(md5(gen_random_uuid()::text), 1, 6));
alter table public.companies alter column referral_code set not null;
alter table public.companies add column if not exists referred_by uuid references public.companies(id) on delete set null;

create type public.referral_status as enum ('pending','converted','rewarded','rejected');
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  referred_company_id uuid references public.companies(id) on delete set null,
  referred_name text,
  status public.referral_status not null default 'pending',
  reward_month date,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_company_id, created_at desc);
alter table public.referrals enable row level security;
create policy referrals_admin_all on public.referrals for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy referrals_member_read on public.referrals for select to authenticated using (public.is_member(referrer_company_id));
grant select on public.referrals to authenticated;
grant all on public.referrals to service_role;

-- ---------- leads: metadate (audit, referral) ----------
alter table public.leads add column if not exists meta jsonb not null default '{}'::jsonb;
alter table public.leads add column if not exists referral_code text;

-- ---------- rapoarte lunare: evită dublarea ----------
alter table public.email_log add column if not exists period date;
create unique index if not exists email_log_report_once on public.email_log(company_id, template, period) where period is not null;
