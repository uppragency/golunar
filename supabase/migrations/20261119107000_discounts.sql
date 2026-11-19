-- Coduri de reducere: procent sau sumă fixă pe lună, pentru primele N rate (1–12).

create type public.discount_kind as enum ('percent','fixed');

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique check (code ~ '^[A-Za-z0-9_-]{3,24}$'),
  description text,
  kind public.discount_kind not null,
  percent numeric(5,2) check (percent is null or (percent > 0 and percent <= 100)),
  amount_ron numeric(10,2) check (amount_ron is null or amount_ron > 0),
  amount_eur numeric(10,2) check (amount_eur is null or amount_eur > 0),
  months smallint not null default 1 check (months between 1 and 12),
  plans public.plan_code[],                -- null = toate planurile
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemptions integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((kind = 'percent' and percent is not null) or (kind = 'fixed' and amount_ron is not null and amount_eur is not null))
);
alter table public.discount_codes enable row level security;
create policy discount_admin_all on public.discount_codes for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.discount_codes to authenticated;
grant all on public.discount_codes to service_role;

create table public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.discount_codes(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (code_id, subscription_id)
);
alter table public.discount_redemptions enable row level security;
create policy redemptions_admin_all on public.discount_redemptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.discount_redemptions to authenticated;
grant all on public.discount_redemptions to service_role;

create or replace function public.discount_redeemed() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.discount_codes set redemptions = redemptions + 1 where id = new.code_id;
  return new;
end $$;
create trigger discount_redeemed after insert on public.discount_redemptions for each row execute function public.discount_redeemed();

-- Reducerea pe rată; amount_net devine plan + opțiuni − reducere.
alter table public.installments add column amount_discount numeric(10,2) not null default 0 check (amount_discount >= 0);
alter table public.installments drop column amount_net;
alter table public.installments add column amount_net numeric(10,2) generated always as (amount_plan + amount_addons - amount_discount) stored;

alter table public.subscriptions add column discount_code_id uuid references public.discount_codes(id) on delete set null;
alter table public.subscriptions add column discount jsonb;

-- Validare publică: nu listează coduri, răspunde doar pentru codul introdus.
create or replace function public.check_discount(p_code text, p_plan text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare d public.discount_codes;
begin
  select * into d from public.discount_codes where lower(code::text) = lower(trim(p_code));
  if not found or not d.active then return jsonb_build_object('valid', false, 'error', 'Codul nu există sau nu mai este activ.'); end if;
  if d.starts_at is not null and now() < d.starts_at then return jsonb_build_object('valid', false, 'error', 'Codul nu este încă activ.'); end if;
  if d.ends_at is not null and now() > d.ends_at then return jsonb_build_object('valid', false, 'error', 'Codul a expirat.'); end if;
  if d.max_redemptions is not null and d.redemptions >= d.max_redemptions then return jsonb_build_object('valid', false, 'error', 'Codul a fost folosit de numărul maxim de ori.'); end if;
  if d.plans is not null and not (p_plan::public.plan_code = any(d.plans)) then
    return jsonb_build_object('valid', false, 'error', 'Codul nu se aplică planului ales.', 'plans', to_jsonb(d.plans));
  end if;
  return jsonb_build_object('valid', true, 'id', d.id, 'code', upper(d.code::text), 'kind', d.kind, 'percent', d.percent,
    'amount_ron', d.amount_ron, 'amount_eur', d.amount_eur, 'months', d.months);
end $$;
revoke all on function public.check_discount(text, text) from public;
grant execute on function public.check_discount(text, text) to anon, authenticated;
