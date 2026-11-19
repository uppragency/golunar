-- Raport tehnic lunar: lista site-urilor de verificat și salvarea rezultatelor (apelate din /api/cron/tech).
create or replace function public.tech_sites(p_secret text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', w.id, 'domain', w.domain))
    from public.websites w join public.companies c on c.id = w.company_id
    where not c.is_demo and w.status in ('live','transferred','building') and w.domain like '%.%'), '[]'::jsonb);
end $$;
revoke all on function public.tech_sites(text) from public;
grant execute on function public.tech_sites(text) to anon, authenticated;

create or replace function public.tech_save(p_secret text, p_id uuid, p jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  update public.websites set
    http_status = (p->>'http_status')::smallint, ssl_expires_at = (p->>'ssl_expires_at')::date,
    psi_mobile = (p->>'psi_mobile')::smallint, psi_desktop = (p->>'psi_desktop')::smallint,
    broken_links = p->'broken_links', tech_checked_at = now(),
    cwv_ok = case when p->>'psi_mobile' is null then cwv_ok else (p->>'psi_mobile')::int >= 90 end
  where id = p_id;
end $$;
revoke all on function public.tech_save(text, uuid, jsonb) from public;
grant execute on function public.tech_save(text, uuid, jsonb) to anon, authenticated;

select cron.unschedule('tech-report') where exists (select 1 from cron.job where jobname = 'tech-report');
select cron.schedule('tech-report', '0 4 1 * *', $$
  select net.http_post(
    url := 'https://golunar.ro/api/cron/tech',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
$$);
