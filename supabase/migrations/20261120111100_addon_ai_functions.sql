update public.app_settings set value = value || jsonb_build_object('ai', jsonb_build_object('eur', 19, 'ron', 99, 'name', 'Vizibilitate în AI', 'plans', jsonb_build_array('essential')))
where key = 'addons';

-- client (owner): activează o opțiune; se adaugă la ratele neplătite următoare
create or replace function public.portal_addon_activate(p_company uuid, p_addon text, p_qty int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s record; cfg jsonb; price numeric; q int := greatest(1, least(coalesce(p_qty, 1), 5)); maxc int; n int;
begin
  if not public.is_owner_of(p_company) then raise exception 'forbidden'; end if;
  if p_addon not in ('brand','local','lang','ai') then raise exception 'invalid'; end if;
  select * into s from public.subscriptions where company_id = p_company and status in ('active','past_due') order by created_at desc limit 1;
  if s.id is null then raise exception 'no subscription'; end if;
  if p_addon = 'ai' and s.plan <> 'essential' then raise exception 'included'; end if;
  if exists (select 1 from public.subscription_items where subscription_id = s.id and addon = p_addon::public.addon_code) then raise exception 'exists'; end if;
  select value into cfg from public.app_settings where key = 'addons';
  price := (cfg->p_addon->>(case when s.currency = 'EUR' then 'eur' else 'ron' end))::numeric;
  if price is null then raise exception 'price'; end if;
  if p_addon <> 'lang' then q := 1; end if;
  maxc := nullif(cfg->p_addon->>'max_cycles', '')::int;
  insert into public.subscription_items(subscription_id, company_id, addon, quantity, unit_price, max_cycles)
  values (s.id, p_company, p_addon::public.addon_code, q, price, maxc);
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

-- draft de comandă: păstrează și opțiunea AI
create or replace function public.save_checkout_draft(p_email text, p_name text, p_company text, p_cart jsonb, p_currency text, p_billing text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_plan text := p_cart->>'plan';
begin
  if p_email is null or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_email) > 200 then return; end if;
  if v_plan not in ('essential','growth','partner') then v_plan := 'essential'; end if;
  insert into public.checkout_drafts(email, name, company, plan, cart, currency, billing)
  values (lower(trim(p_email)), nullif(left(trim(coalesce(p_name, '')), 120), ''), nullif(left(trim(coalesce(p_company, '')), 160), ''), v_plan::public.plan_code,
          jsonb_build_object('plan', v_plan, 'brand', coalesce((p_cart->>'brand')::boolean, false), 'local', coalesce((p_cart->>'local')::boolean, false),
                             'ai', coalesce((p_cart->>'ai')::boolean, false) and v_plan = 'essential',
                             'langs', least(5, greatest(0, coalesce((p_cart->>'langs')::int, 0)))),
          case when p_currency = 'EUR' then 'EUR' else 'RON' end::public.currency_code,
          case when p_billing = 'annual' then 'annual' else 'monthly' end)
  on conflict (email) where completed_at is null do update set
    name = coalesce(excluded.name, public.checkout_drafts.name), company = coalesce(excluded.company, public.checkout_drafts.company),
    plan = excluded.plan, cart = excluded.cart, currency = excluded.currency, billing = excluded.billing, updated_at = now();
end $$;
revoke all on function public.save_checkout_draft(text, text, text, jsonb, text, text) from public;
grant execute on function public.save_checkout_draft(text, text, text, jsonb, text, text) to anon, authenticated;
