-- Campania de lansare: planul Esențial, prima lună 6 lei / 1 €, doar pentru clienți noi.
alter table public.discount_codes add column if not exists new_customers_only boolean not null default false;

insert into public.discount_codes (code, description, kind, amount_ron, amount_eur, months, plans, new_customers_only)
values ('GOLUNAR', 'Campanie lansare: Esențial prima lună 6 lei / 1 €', 'fixed', 443, 88, 1, array['essential']::public.plan_code[], true)
on conflict (code) do update set kind = excluded.kind, amount_ron = excluded.amount_ron, amount_eur = excluded.amount_eur,
  months = excluded.months, plans = excluded.plans, new_customers_only = true, active = true, percent = null;

-- Verificare la plată: codurile „doar clienți noi” sunt refuzate dacă CUI-ul are deja un abonament.
create or replace function public.check_discount_for(p_code text, p_plan text, p_cui text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare res jsonb; only_new boolean; v_cui text := upper(regexp_replace(coalesce(p_cui, ''), '^RO|\s', '', 'gi'));
begin
  res := public.check_discount(p_code, p_plan);
  if not (res->>'valid')::boolean then return res; end if;
  select new_customers_only into only_new from public.discount_codes where id = (res->>'id')::uuid;
  if only_new and exists (
    select 1 from public.companies c join public.subscriptions s on s.company_id = c.id
    where upper(regexp_replace(c.cui, '^RO|\s', '', 'gi')) = v_cui and not c.is_demo
  ) then
    return jsonb_build_object('valid', false, 'error', 'Oferta este valabilă doar pentru clienții noi.');
  end if;
  return res;
end $$;
revoke all on function public.check_discount_for(text, text, text) from public;
grant execute on function public.check_discount_for(text, text, text) to anon, authenticated;
