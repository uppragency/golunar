-- Funcții pentru status public, uptime (pg_cron + pg_net), recomandări și rapoarte lunare.
-- Secretul pentru cron se păstrează în Vault sub numele 'cron_secret' (setat separat, nu în git).

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ---------- uptime: verificare la 10 minute, direct din Postgres ----------
create table if not exists public.uptime_pending (
  request_id bigint primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  started_at timestamptz not null default now()
);
alter table public.uptime_pending enable row level security; -- fără politici: doar funcțiile definer

create or replace function public.uptime_dispatch()
returns void language plpgsql security definer set search_path = '' as $$
declare w record; rid bigint;
begin
  for w in select id, domain from public.websites where status in ('live','transferred') and domain is not null loop
    select net.http_get(url := 'https://' || w.domain, timeout_milliseconds := 15000) into rid;
    insert into public.uptime_pending(request_id, website_id) values (rid, w.id) on conflict do nothing;
  end loop;
end $$;

create or replace function public.uptime_collect()
returns void language plpgsql security definer set search_path = '' as $$
begin
  with done as (
    delete from public.uptime_pending p
    using net._http_response r
    where r.id = p.request_id
    returning p.website_id, p.started_at, r.status_code, r.timed_out, r.error_msg, r.created
  )
  insert into public.uptime_checks(website_id, checked_at, ok, status_code, ms)
  select website_id, started_at,
         coalesce(not timed_out, true) and error_msg is null and status_code between 200 and 399,
         status_code,
         greatest(0, extract(epoch from (created - started_at)) * 1000)::int
  from done;

  -- cererile fără răspuns după 5 minute = căzut
  with stale as (
    delete from public.uptime_pending where started_at < now() - interval '5 minutes' returning website_id, started_at
  )
  insert into public.uptime_checks(website_id, checked_at, ok) select website_id, started_at, false from stale;

  update public.websites w set uptime_90d = s.pct
  from (select website_id, round(100.0 * avg(case when ok then 1 else 0 end), 2) pct
        from public.uptime_checks where checked_at > now() - interval '90 days' group by website_id) s
  where s.website_id = w.id;

  delete from public.uptime_checks where checked_at < now() - interval '120 days';
end $$;

revoke all on function public.uptime_dispatch() from public, anon, authenticated;
revoke all on function public.uptime_collect() from public, anon, authenticated;

select cron.schedule('uptime-dispatch', '*/10 * * * *', $$select public.uptime_dispatch()$$);
select cron.schedule('uptime-collect', '3-59/10 * * * *', $$select public.uptime_collect()$$);

-- ---------- status public (fără date personale, fără conturi demo) ----------
create or replace function public.public_status()
returns jsonb language sql stable security definer set search_path = '' as $$
  with real_sites as (
    select w.* from public.websites w join public.companies c on c.id = w.company_id
    where not c.is_demo and w.status in ('live','transferred')
  ),
  chk as (
    select u.website_id, u.ok, u.checked_at, u.ms from public.uptime_checks u
    where u.website_id in (select id from real_sites) and u.checked_at > now() - interval '90 days'
  ),
  per_site as (
    select s.id, s.domain, s.show_on_status,
      round(100.0 * avg(case when c.ok then 1 else 0 end) filter (where c.checked_at > now() - interval '30 days'), 2) up30,
      (array_agg(c.ok order by c.checked_at desc))[1] last_ok,
      (array_agg(c.ms order by c.checked_at desc))[1] last_ms,
      max(c.checked_at) last_at
    from real_sites s left join chk c on c.website_id = s.id group by s.id, s.domain, s.show_on_status
  ),
  days as (
    select d::date as dday,
      round(100.0 * avg(c.ok::int), 2) pct
    from generate_series(current_date - 29, current_date, interval '1 day') d
    left join chk c on c.checked_at::date = d::date
    group by d
  ),
  delivered as (
    select r.delivered_at, r.type from public.requests r join public.companies c on c.id = r.company_id
    where not c.is_demo and r.status in ('delivered','resolved') and r.delivered_at is not null
  )
  select jsonb_build_object(
    'generated_at', now(),
    'sites_monitored', (select count(*) from real_sites),
    'checks_30d', (select count(*) from chk where checked_at > now() - interval '30 days'),
    'uptime_30d', (select round(100.0 * avg(case when ok then 1 else 0 end), 3) from chk where checked_at > now() - interval '30 days'),
    'avg_ms_24h', (select round(avg(ms)) from chk where ok and checked_at > now() - interval '24 hours'),
    'all_up', coalesce((select bool_and(coalesce(last_ok, true)) from per_site), true),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', dday, 'pct', pct) order by dday) from days), '[]'::jsonb),
    'sites', coalesce((select jsonb_agg(jsonb_build_object('domain', domain, 'up30', up30, 'ok', last_ok, 'ms', last_ms, 'at', last_at) order by domain) from per_site where show_on_status), '[]'::jsonb),
    'delivered_30d', (select count(*) from delivered where delivered_at > current_date - 30 and type = 'improvement'),
    'delivered_90d', (select count(*) from delivered where delivered_at > current_date - 90 and type = 'improvement'),
    'recent', coalesce((select jsonb_agg(x) from (select jsonb_build_object('date', delivered_at, 'type', type) x from delivered order by delivered_at desc limit 12) t), '[]'::jsonb)
  );
$$;
revoke all on function public.public_status() from public;
grant execute on function public.public_status() to anon, authenticated;

-- ---------- lead public (formulare + audit + recomandări) ----------
create or replace function public.submit_lead(
  p_name text, p_email text, p_phone text, p_company text, p_message text,
  p_plan text, p_source text, p_ref text, p_meta jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare lid uuid; ref_company uuid;
begin
  if p_name is null or char_length(trim(p_name)) < 2 or p_email is null or position('@' in p_email) = 0 then
    raise exception 'invalid lead';
  end if;
  if p_ref is not null and p_ref <> '' then
    select id into ref_company from public.companies where referral_code = upper(trim(p_ref)) and not is_demo;
  end if;
  insert into public.leads(name, email, phone, company, message, plan, source, referral_code, meta)
  values (left(trim(p_name), 120), left(trim(p_email), 200), nullif(left(p_phone, 40), ''), nullif(left(p_company, 160), ''),
          nullif(left(p_message, 3000), ''), nullif(p_plan, '')::public.plan_code, left(coalesce(p_source, 'site'), 60),
          case when ref_company is not null then upper(trim(p_ref)) end, coalesce(p_meta, '{}'::jsonb))
  returning id into lid;
  if ref_company is not null then
    insert into public.referrals(referrer_company_id, lead_id, referred_name)
    values (ref_company, lid, coalesce(nullif(left(p_company, 160), ''), left(trim(p_name), 120)));
  end if;
  return lid;
end $$;
revoke all on function public.submit_lead(text,text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.submit_lead(text,text,text,text,text,text,text,text,jsonb) to anon, authenticated;

-- ---------- rapoarte lunare: date pentru cron (protejat cu secret din Vault) ----------
create or replace function public.cron_ok(p_secret text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'cron_secret' and decrypted_secret = p_secret);
$$;
revoke all on function public.cron_ok(text) from public, anon, authenticated;

create or replace function public.monthly_report_payloads(p_secret text, p_period date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare res jsonb;
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  select coalesce(jsonb_agg(x), '[]'::jsonb) into res from (
    select jsonb_build_object(
      'company_id', c.id, 'company', c.name, 'legal_rep', c.legal_rep,
      'to', coalesce(c.notify_email, c.billing_email),
      'currency', c.currency, 'referral_code', c.referral_code,
      'domain', w.domain, 'uptime', w.uptime_90d,
      'metrics', (select jsonb_agg(jsonb_build_object('month', m.month, 'visitors', m.visitors, 'leads', m.form_leads, 'pos', m.avg_position, 'calls', m.maps_calls) order by m.month desc)
                  from (select * from public.website_metrics m where m.company_id = c.id and m.month <= p_period order by m.month desc limit 2) m),
      'delivered', (select coalesce(jsonb_agg(jsonb_build_object('title', r.title, 'date', r.delivered_at) order by r.delivered_at), '[]'::jsonb)
                    from public.requests r where r.company_id = c.id and r.type = 'improvement' and r.status in ('delivered','resolved')
                      and r.delivered_at >= p_period and r.delivered_at < (p_period + interval '1 month')),
      'plan', s.plan,
      'paid', (select count(*) from public.installments i where i.company_id = c.id and i.status = 'paid'),
      'last_due', (select max(i.due_date) from public.installments i where i.company_id = c.id),
      'transferred_at', (select o.transferred_at from public.ownership o where o.company_id = c.id limit 1)
    ) x
    from public.companies c
    join lateral (select * from public.subscriptions s where s.company_id = c.id order by s.created_at desc limit 1) s on true
    left join lateral (select * from public.websites w where w.company_id = c.id order by w.created_at limit 1) w on true
    where not c.is_demo and s.status in ('active','past_due') and coalesce(c.notify_email, c.billing_email) is not null
      and not exists (select 1 from public.email_log e where e.company_id = c.id and e.template = 'monthly_report' and e.period = p_period and e.status = 'sent')
  ) t;
  return res;
end $$;
revoke all on function public.monthly_report_payloads(text, date) from public;
grant execute on function public.monthly_report_payloads(text, date) to anon, authenticated;

create or replace function public.log_cron_email(p_secret text, p_company uuid, p_template text, p_to text, p_resend_id text, p_period date, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  insert into public.email_log(company_id, template, to_email, resend_id, period, status)
  values (p_company, p_template, p_to, p_resend_id, p_period, p_status)
  on conflict do nothing;
end $$;
revoke all on function public.log_cron_email(text, uuid, text, text, text, date, text) from public;
grant execute on function public.log_cron_email(text, uuid, text, text, text, date, text) to anon, authenticated;

-- ---------- raport lunar: ziua 3, 07:00 UTC ----------
select cron.schedule('monthly-report', '0 7 3 * *', $$
  select net.http_post(
    url := 'https://golunar.ro/api/cron/monthly-report',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$$);
