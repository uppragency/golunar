-- Formularul de contact scrie direct în leads (fără citire publică).
create policy leads_insert on public.leads for insert to anon, authenticated
  with check (char_length(name) between 2 and 120 and char_length(coalesce(message,'')) <= 3000);

-- Datele bancare LUNAR sunt vizibile clienților (pagina Metode de plată).
drop policy settings_read on public.app_settings;
create policy settings_read on public.app_settings for select
  using (key in ('plans','addons','eur_ron_rate','bank') or (select public.is_admin()));

-- Invită un utilizator într-o firmă. Dacă are deja cont, primește accesul imediat.
create or replace function public.invite_member(p_email text, p_company uuid, p_role public.member_role default 'owner')
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  if not (public.is_admin() or (select auth.role()) = 'service_role') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  select id into uid from auth.users where lower(email) = lower(p_email) limit 1;
  if uid is not null then
    insert into public.members(user_id, company_id, role) values (uid, p_company, p_role)
      on conflict (user_id, company_id) do update set role = excluded.role;
    insert into public.invites(email, company_id, role, accepted_at) values (p_email, p_company, p_role, now())
      on conflict do nothing;
  else
    insert into public.invites(email, company_id, role) values (p_email, p_company, p_role) on conflict do nothing;
  end if;
end $$;
revoke execute on function public.invite_member(text, uuid, public.member_role) from public, anon;
grant execute on function public.invite_member(text, uuid, public.member_role) to authenticated, service_role;

-- Ultimul număr de rată plătită pentru un abonament (folosit de webhook).
create or replace function public.next_installment(p_subscription uuid)
returns uuid language sql stable security invoker set search_path = '' as $$
  select id from public.installments
  where subscription_id = p_subscription and status <> 'paid'
  order by number limit 1;
$$;
