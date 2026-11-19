-- Comenzi prin transfer bancar fără cheie service role: provizionare în Postgres, protejată cu secretul din Vault.
-- Plus: brief-ul clientului (tabel + încărcare poze în Storage).

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

  insert into public.subscriptions(company_id, plan, status, payment_mode, currency, billing_day, started_at, min_commitment_months, discount_code_id, discount)
  values (v_company, (p->>'plan')::public.plan_code, 'incomplete', 'bank_transfer', (p->>'currency')::public.currency_code, v_day, now(),
          (p->>'min_months')::int, nullif(v_disc->>'id', '')::uuid, v_disc)
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

-- ---------- brief ----------
create table if not exists public.briefs (
  company_id uuid primary key references public.companies(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  description text check (char_length(description) <= 20000),
  examples text check (char_length(examples) <= 3000),
  files jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.briefs enable row level security;
create policy briefs_admin_all on public.briefs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy briefs_member_rw on public.briefs for all to authenticated
  using (public.is_member(company_id)) with check (public.is_member(company_id));
grant select, insert, update on public.briefs to authenticated;
grant all on public.briefs to service_role;

-- Clienții pot încărca fișiere doar în folderul firmei: <company_id>/brief/...
create policy documents_member_brief_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'documents' and (storage.foldername(name))[2] = 'brief' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy documents_member_brief_delete on storage.objects for delete to authenticated using (
  bucket_id = 'documents' and (storage.foldername(name))[2] = 'brief' and public.is_member(((storage.foldername(name))[1])::uuid));

-- ---------- date bancare și date firmă ----------
insert into public.app_settings(key, value) values ('bank', jsonb_build_object(
  'beneficiary', 'UPPRMARKETING S.R.L.', 'iban_ron', 'RO53BTRLRONCRT0DB3229801', 'bank', 'BANCA TRANSILVANIA',
  'cif', '52762670', 'reg_com', 'J2025081624004',
  'address', 'Sat Chiajna, Com. Chiajna, Str. Sergent Ilie Petre, Nr. 84, Bl. 1, Et. 7, Ap. 716, Județ Ilfov'))
on conflict (key) do update set value = public.app_settings.value || excluded.value;
