-- Lot 5: plan anual, recuperare checkout abandonat, secvență de nurturing, dezabonare.

-- ---------- plan anual ----------
alter table public.subscriptions add column if not exists billing_cycle text not null default 'monthly';
alter table public.subscriptions drop constraint if exists subscriptions_billing_cycle_chk;
alter table public.subscriptions add constraint subscriptions_billing_cycle_chk check (billing_cycle in ('monthly','annual'));

create or replace function public.provision_bank_order(p_secret text, p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_cui text := upper(regexp_replace(coalesce(p->>'cui', ''), '\s', '', 'g'));
  v_digits text := regexp_replace(v_cui, '\D', '', 'g');
  v_company uuid; v_ref text; v_sub uuid; v_site uuid; v_domain text; v_uid uuid; v_referrer uuid; v_pending uuid;
  v_item jsonb; v_inst jsonb; v_day int := least(28, extract(day from now())::int);
  v_disc jsonb := nullif(p->'discount', 'null'::jsonb);
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden' using errcode = '42501'; end if;
  if length(v_digits) < 2 then raise exception 'invalid cui'; end if;
  v_cui := case when v_cui like 'RO%' then 'RO' || v_digits else v_digits end;

  -- Firmă existentă: nu suprascriem date și nu dăm acces altcuiva la un cont existent.
  if exists (select 1 from public.companies c where regexp_replace(c.cui, '\D', '', 'g') = v_digits and not c.is_demo) then
    return jsonb_build_object('error', 'exists');
  end if;
  delete from public.companies c where regexp_replace(c.cui, '\D', '', 'g') = v_digits and c.is_demo;

  insert into public.companies(cui, name, reg_com, address, vat_payer, legal_rep, billing_email, notify_email, phone, currency)
  values (v_cui, left(p->>'name', 200), nullif(p->>'reg_com', ''), nullif(left(p->>'address', 300), ''), coalesce((p->>'vat_payer')::boolean, false),
          left(p->>'contact', 120), p->>'email', p->>'email', nullif(p->>'phone', ''), (p->>'currency')::public.currency_code)
  returning id, bank_reference into v_company, v_ref;

  insert into public.subscriptions(company_id, plan, status, payment_mode, currency, billing_day, started_at, min_commitment_months, discount_code_id, discount, billing_cycle)
  values (v_company, (p->>'plan')::public.plan_code, 'incomplete', 'bank_transfer', (p->>'currency')::public.currency_code, v_day, now(),
          (p->>'min_months')::int, nullif(v_disc->>'id', '')::uuid, v_disc, case when p->>'billing_cycle' = 'annual' then 'annual' else 'monthly' end)
  returning id into v_sub;

  for v_item in select * from jsonb_array_elements(coalesce(p->'items', '[]'::jsonb)) loop
    insert into public.subscription_items(subscription_id, company_id, addon, quantity, unit_price, max_cycles)
    values (v_sub, v_company, (v_item->>'addon')::public.addon_code, (v_item->>'quantity')::int, (v_item->>'unit_price')::numeric, nullif(v_item->>'max_cycles', '')::int);
  end loop;

  for v_inst in select * from jsonb_array_elements(p->'installments') loop
    insert into public.installments(subscription_id, company_id, number, due_date, amount_plan, amount_addons, amount_discount, currency, status)
    values (v_sub, v_company, (v_inst->>'number')::int, (v_inst->>'due_date')::date, (v_inst->>'amount_plan')::numeric,
            (v_inst->>'amount_addons')::numeric, (v_inst->>'amount_discount')::numeric, (p->>'currency')::public.currency_code, 'scheduled');
  end loop;

  v_domain := lower(regexp_replace(regexp_replace(coalesce(p->>'domain', ''), '^https?://', ''), '/.*$', ''));
  if v_domain = '' or exists (select 1 from public.websites where domain = v_domain) then
    v_domain := lower(v_cui) || '.golunar.ro';
  end if;
  insert into public.websites(company_id, domain, status) values (v_company, v_domain, 'onboarding') returning id into v_site;
  insert into public.ownership(website_id, company_id, eligible_at) values (v_site, v_company, (p->'installments'->11->>'due_date')::date);

  insert into public.documents(company_id, kind, title, signed_at, signed_ip, locked_until_installment) values
    (v_company, 'contract', 'Contract abonament ' || v_ref, now(), nullif(p->>'ip', '')::inet, null),
    (v_company, 'annex', 'Anexa 1 · Plan și opțiuni', now(), nullif(p->>'ip', '')::inet, null),
    (v_company, 'dpa', 'Acord de prelucrare date (GDPR)', now(), nullif(p->>'ip', '')::inet, null),
    (v_company, 'handover', 'Proces-verbal transfer proprietate', null, null, 12),
    (v_company, 'source', 'Cod-sursă și fișiere', null, null, 12);

  if v_disc ? 'id' then
    insert into public.discount_redemptions(code_id, company_id, subscription_id) values ((v_disc->>'id')::uuid, v_company, v_sub) on conflict do nothing;
  end if;

  if coalesce(p->>'ref', '') <> '' then
    select id into v_referrer from public.companies where referral_code = upper(p->>'ref') and not is_demo and id <> v_company;
    if v_referrer is not null then
      update public.companies set referred_by = v_referrer where id = v_company;
      select id into v_pending from public.referrals where referrer_company_id = v_referrer and status = 'pending' and referred_company_id is null order by created_at desc limit 1;
      if v_pending is not null then
        update public.referrals set referred_company_id = v_company, referred_name = p->>'name', status = 'converted' where id = v_pending;
      else
        insert into public.referrals(referrer_company_id, referred_company_id, referred_name, status) values (v_referrer, v_company, p->>'name', 'converted');
      end if;
    end if;
  end if;

  -- Acces: invitație pe emailul comenzii (devine membru la prima autentificare).
  select id into v_uid from auth.users where lower(email) = lower(p->>'email') limit 1;
  if v_uid is not null then
    insert into public.members(user_id, company_id, role) values (v_uid, v_company, 'owner') on conflict do nothing;
    insert into public.invites(email, company_id, role, accepted_at) values (p->>'email', v_company, 'owner', now()) on conflict do nothing;
  else
    insert into public.invites(email, company_id, role) values (p->>'email', v_company, 'owner') on conflict do nothing;
  end if;

  return jsonb_build_object('company_id', v_company, 'subscription_id', v_sub, 'bank_reference', v_ref, 'has_account', v_uid is not null);
end $$;
revoke all on function public.provision_bank_order(text, jsonb) from public;
grant execute on function public.provision_bank_order(text, jsonb) to anon, authenticated;


-- La plata anuală se creează o singură rată (anul întreg). Când e marcată plătită, se adaugă ratele 2–12 ca incluse
-- și proprietatea devine eligibilă imediat.
create or replace function public.annual_paid()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_day date;
begin
  if new.number = 1 and new.status = 'paid' and old.status is distinct from 'paid'
     and exists (select 1 from public.subscriptions s where s.id = new.subscription_id and s.billing_cycle = 'annual') then
    for i in 2..12 loop
      v_day := (new.due_date + make_interval(months => i - 1))::date;
      insert into public.installments(subscription_id, company_id, number, due_date, amount_plan, amount_addons, amount_discount, currency, status, paid_at, method)
      values (new.subscription_id, new.company_id, i, v_day, 0, 0, 0, new.currency, 'paid', coalesce(new.paid_at, now()), 'Inclusă în plata anuală')
      on conflict (subscription_id, number) do update set status = 'paid', paid_at = excluded.paid_at, method = excluded.method;
    end loop;
    update public.ownership set eligible_at = current_date where company_id = new.company_id and transferred_at is null;
  end if;
  return new;
end $$;
drop trigger if exists installments_annual_paid on public.installments;
create trigger installments_annual_paid after update of status on public.installments
  for each row execute function public.annual_paid();

-- ---------- tabele: drafturi de comandă, nurturing, dezabonări ----------
create table if not exists public.checkout_drafts (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  name text,
  company text,
  plan public.plan_code,
  cart jsonb not null default '{}'::jsonb,
  currency public.currency_code not null default 'RON',
  billing text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  recover_1_at timestamptz,
  recover_2_at timestamptz
);
create unique index if not exists checkout_drafts_open_email on public.checkout_drafts(email) where completed_at is null;
create index if not exists checkout_drafts_due on public.checkout_drafts(updated_at) where completed_at is null;
alter table public.checkout_drafts enable row level security;
drop policy if exists checkout_drafts_admin on public.checkout_drafts;
create policy checkout_drafts_admin on public.checkout_drafts for select to authenticated using ((select public.is_admin()));

create table if not exists public.nurture (
  email citext primary key,
  name text,
  source text,
  step smallint not null default 0,
  next_at timestamptz,
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  stop_reason text
);
create index if not exists nurture_due on public.nurture(next_at) where stopped_at is null;
alter table public.nurture enable row level security;
drop policy if exists nurture_admin on public.nurture;
create policy nurture_admin on public.nurture for select to authenticated using ((select public.is_admin()));

create table if not exists public.email_optout (
  email citext primary key,
  source text,
  created_at timestamptz not null default now()
);
alter table public.email_optout enable row level security;
drop policy if exists email_optout_admin on public.email_optout;
create policy email_optout_admin on public.email_optout for select to authenticated using ((select public.is_admin()));

-- Email care aparține deja unui client (nu primește emailuri de vânzare).
create or replace function public.is_customer_email(p_email text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.companies c where not c.is_demo and (lower(c.billing_email::text) = lower(p_email) or lower(c.notify_email::text) = lower(p_email)))
      or exists (select 1 from public.invites i where lower(i.email::text) = lower(p_email));
$$;
revoke all on function public.is_customer_email(text) from public, anon, authenticated;

-- Salvare draft din checkout (apelată din browser prin /api/checkout/draft).
create or replace function public.save_checkout_draft(p_email text, p_name text, p_company text, p_cart jsonb, p_currency text, p_billing text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_plan text := p_cart->>'plan';
begin
  if p_email is null or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_email) > 200 then return; end if;
  if v_plan not in ('essential','growth','partner') then v_plan := 'essential'; end if;
  insert into public.checkout_drafts(email, name, company, plan, cart, currency, billing)
  values (lower(trim(p_email)), nullif(left(trim(coalesce(p_name, '')), 120), ''), nullif(left(trim(coalesce(p_company, '')), 160), ''), v_plan::public.plan_code,
          jsonb_build_object('plan', v_plan, 'brand', coalesce((p_cart->>'brand')::boolean, false), 'local', coalesce((p_cart->>'local')::boolean, false),
                             'langs', least(5, greatest(0, coalesce((p_cart->>'langs')::int, 0)))),
          case when p_currency = 'EUR' then 'EUR' else 'RON' end::public.currency_code,
          case when p_billing = 'annual' then 'annual' else 'monthly' end)
  on conflict (email) where completed_at is null do update set
    name = coalesce(excluded.name, public.checkout_drafts.name), company = coalesce(excluded.company, public.checkout_drafts.company),
    plan = excluded.plan, cart = excluded.cart, currency = excluded.currency, billing = excluded.billing, updated_at = now();
end $$;
revoke all on function public.save_checkout_draft(text, text, text, jsonb, text, text) from public;
grant execute on function public.save_checkout_draft(text, text, text, jsonb, text, text) to anon, authenticated;

-- Comandă trimisă: oprește recuperarea și nurturing-ul.
create or replace function public.checkout_done(p_secret text, p_email text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  update public.checkout_drafts set completed_at = now() where email = lower(p_email) and completed_at is null;
  update public.nurture set stopped_at = now(), stop_reason = 'comandă' where email = lower(p_email) and stopped_at is null;
end $$;
revoke all on function public.checkout_done(text, text) from public;
grant execute on function public.checkout_done(text, text) to anon, authenticated;

-- Dezabonare (din link-ul semnat din email).
create or replace function public.email_unsubscribe(p_secret text, p_email text, p_source text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  insert into public.email_optout(email, source) values (lower(p_email), left(p_source, 40)) on conflict do nothing;
  update public.nurture set stopped_at = now(), stop_reason = 'dezabonat' where email = lower(p_email) and stopped_at is null;
end $$;
revoke all on function public.email_unsubscribe(text, text, text) from public;
grant execute on function public.email_unsubscribe(text, text, text) to anon, authenticated;

-- Intrare automată în nurturing pentru lead-urile care nu sunt clienți.
create or replace function public.leads_nurture_enroll()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- doar cu consimțământ explicit (bifa opțională din formular)
  if coalesce((new.meta->>'marketing')::boolean, false)
     and (new.source in ('audit','discutie-gratuita') or (new.source = 'contact' and new.meta->>'category' in ('nou','altceva')))
     and not public.is_customer_email(new.email::text) then
    insert into public.nurture(email, name, source, step, next_at)
    values (lower(new.email::text), new.name, new.source, 0, now() + interval '1 day')
    on conflict (email) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists leads_nurture on public.leads;
create trigger leads_nurture after insert on public.leads for each row execute function public.leads_nurture_enroll();

-- Coada de emailuri de creștere (rulată la 15 minute din /api/cron/growth).
create or replace function public.growth_queue(p_secret text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare out jsonb := '[]'::jsonb; r record; gaps int[] := array[2, 3, 4, 4];
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;

  -- drafturi ale clienților existenți sau dezabonați: închise fără email
  update public.checkout_drafts d set completed_at = now()
  where d.completed_at is null and (public.is_customer_email(d.email::text) or exists (select 1 from public.email_optout o where o.email = d.email));

  -- recuperare 1: la o oră după ultima activitate
  for r in
    update public.checkout_drafts d set recover_1_at = now()
    where d.id in (select id from public.checkout_drafts where completed_at is null and recover_1_at is null
                   and updated_at <= now() - interval '1 hour' and created_at > now() - interval '3 days' limit 50)
    returning d.*
  loop
    out := out || jsonb_build_object('kind','recover_1','email',r.email,'name',r.name,'plan',r.plan,'cart',r.cart,'currency',r.currency,'billing',r.billing);
  end loop;

  -- recuperare 2: la 24 de ore de la începerea comenzii (ultimul email pentru comanda abandonată)
  for r in
    update public.checkout_drafts d set recover_2_at = now()
    where d.id in (select id from public.checkout_drafts where completed_at is null and recover_1_at is not null and recover_2_at is null
                   and created_at <= now() - interval '24 hours' and recover_1_at <= now() - interval '6 hours' limit 50)
    returning d.*
  loop
    out := out || jsonb_build_object('kind','recover_2','email',r.email,'name',r.name,'plan',r.plan,'cart',r.cart,'currency',r.currency,'billing',r.billing);
  end loop;

  -- nurturing: oprește pentru clienți și dezabonați
  update public.nurture n set stopped_at = now(), stop_reason = case when public.is_customer_email(n.email::text) then 'client' else 'dezabonat' end
  where n.stopped_at is null and (public.is_customer_email(n.email::text) or exists (select 1 from public.email_optout o where o.email = n.email));

  for r in
    update public.nurture n set step = n.step + 1,
      next_at = case when n.step + 1 >= 5 then null else now() + make_interval(days => gaps[n.step + 1]) end,
      stopped_at = case when n.step + 1 >= 5 then now() end,
      stop_reason = case when n.step + 1 >= 5 then 'finalizat' end
    where n.email in (select email from public.nurture where stopped_at is null and next_at <= now() and step < 5 order by next_at limit 50)
    returning n.*
  loop
    out := out || jsonb_build_object('kind','nurture_' || r.step,'email',r.email,'name',r.name);
  end loop;

  return out;
end $$;
revoke all on function public.growth_queue(text) from public;
grant execute on function public.growth_queue(text) to anon, authenticated;

select cron.unschedule('growth-emails') where exists (select 1 from cron.job where jobname = 'growth-emails');
select cron.schedule('growth-emails', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://golunar.ro/api/cron/growth',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$$);
