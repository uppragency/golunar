-- Lot 4: jurnal acces admin, bibliotecă materiale, atașamente cereri, plată anunțată, magazin opțiuni, ultimele autentificări.

create table if not exists public.admin_logins (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  ip text,
  user_agent text,
  device text,
  new_device boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.admin_logins enable row level security;
create policy admin_logins_admin on public.admin_logins for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select, insert on public.admin_logins to authenticated;

alter table public.companies add column if not exists brand jsonb not null default '{}'::jsonb;
alter table public.requests add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.installments add column if not exists payment_notified_at timestamptz;
alter table public.ownership add column if not exists handover_sent_at timestamptz;
alter table public.companies add column if not exists anniversary_sent jsonb not null default '{}'::jsonb;

-- clienții pot încărca atașamente la cereri: <company_id>/requests/...
create policy documents_member_requests_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'documents' and (storage.foldername(name))[2] = 'requests' and public.is_member(((storage.foldername(name))[1])::uuid));

-- client: „am plătit” pe o rată (accelerează confirmarea)
create or replace function public.portal_notify_payment(p_company uuid, p_installment uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_member(p_company) then raise exception 'forbidden'; end if;
  update public.installments set payment_notified_at = now()
   where id = p_installment and company_id = p_company and status <> 'paid';
end $$;
revoke all on function public.portal_notify_payment(uuid, uuid) from public, anon;
grant execute on function public.portal_notify_payment(uuid, uuid) to authenticated;

-- client (owner): activează o opțiune; se adaugă la ratele neplătite următoare
create or replace function public.portal_addon_activate(p_company uuid, p_addon text, p_qty int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s record; cfg jsonb; price numeric; q int := greatest(1, least(coalesce(p_qty, 1), 5)); maxc int; n int;
begin
  if not public.is_owner_of(p_company) then raise exception 'forbidden'; end if;
  if p_addon not in ('brand','local','lang') then raise exception 'invalid'; end if;
  select * into s from public.subscriptions where company_id = p_company and status in ('active','past_due') order by created_at desc limit 1;
  if s.id is null then raise exception 'no subscription'; end if;
  if exists (select 1 from public.subscription_items where subscription_id = s.id and addon = p_addon::public.addon_code) then raise exception 'exists'; end if;
  select value into cfg from public.app_settings where key = 'addons';
  price := (cfg->p_addon->>(case when s.currency = 'EUR' then 'eur' else 'ron' end))::numeric;
  if price is null then raise exception 'price'; end if;
  if p_addon <> 'lang' then q := 1; end if;
  maxc := nullif(cfg->p_addon->>'max_cycles', '')::int;
  insert into public.subscription_items(subscription_id, company_id, addon, quantity, unit_price, max_cycles)
  values (s.id, p_company, p_addon::public.addon_code, q, price, maxc);
  -- rata activă (prima neplătită) rămâne neschimbată; opțiunea pornește de la rata următoare
  with nxt as (
    select id, row_number() over (order by number) rn from public.installments
    where subscription_id = s.id and status <> 'paid' and number > (select coalesce(min(number), 0) from public.installments where subscription_id = s.id and status <> 'paid')
  )
  update public.installments i set amount_addons = i.amount_addons + price * q
  from nxt where nxt.id = i.id and (maxc is null or nxt.rn <= maxc);
  get diagnostics n = row_count;
  return jsonb_build_object('price', price * q, 'currency', s.currency, 'installments', n);
end $$;
revoke all on function public.portal_addon_activate(uuid, text, int) from public, anon;
grant execute on function public.portal_addon_activate(uuid, text, int) to authenticated;

-- admin: ultima autentificare a membrilor fiecărei firme (pentru scorul de sănătate)
create or replace function public.admin_member_logins()
returns table(company_id uuid, last_sign_in timestamptz) language sql stable security definer set search_path = '' as $$
  select m.company_id, max(u.last_sign_in_at) from public.members m join auth.users u on u.id = m.user_id
  where public.is_admin() group by m.company_id;
$$;
revoke all on function public.admin_member_logins() from public, anon;
grant execute on function public.admin_member_logins() to authenticated;
