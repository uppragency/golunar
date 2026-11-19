-- Admin Lot 1: comenzi neplătite, producție pe etape, luna gratuită automată, brief lipsă, lead-uri.

-- ---------- zile lucrătoare (luni–vineri) ----------
create or replace function public.add_business_days(p_from date, p_n int)
returns date language plpgsql immutable set search_path = '' as $$
declare d date := p_from; n int := p_n;
begin
  while n > 0 loop
    d := d + 1;
    if extract(isodow from d) < 6 then n := n - 1; end if;
  end loop;
  return d;
end $$;

create or replace function public.business_days_between(p_from date, p_to date)
returns int language sql immutable set search_path = '' as $$
  select count(*)::int from generate_series(p_from + 1, p_to, interval '1 day') g where extract(isodow from g) < 6;
$$;

-- ---------- producție: termenul pornește de la brief complet ----------
alter table public.launch_projects add column if not exists brief_at timestamptz;
alter table public.launch_projects add column if not exists free_month_applied_at timestamptz;
alter table public.launch_projects add column if not exists stage_changed_at timestamptz not null default now();
alter table public.launch_projects alter column started_at drop not null;
alter table public.launch_projects alter column started_at drop default;

create or replace function public.launch_sync_brief()
returns trigger language plpgsql security definer set search_path = '' as $$
declare b timestamptz;
begin
  select submitted_at into b from public.briefs where company_id = new.company_id;
  if b is not null and new.brief_at is null then
    new.brief_at := b;
    new.started_at := (b at time zone 'Europe/Bucharest')::date;
    new.due_at := public.add_business_days(new.started_at, 10);
    if new.stage = 'brief' then new.stage := 'design'; new.stage_changed_at := now(); end if;
  elsif b is null and new.brief_at is null then
    new.started_at := null;
    new.due_at := null;
  end if;
  if tg_op = 'UPDATE' and new.stage is distinct from old.stage then new.stage_changed_at := now(); end if;
  return new;
end $$;
drop trigger if exists launch_sync_brief on public.launch_projects;
create trigger launch_sync_brief before insert or update on public.launch_projects for each row execute function public.launch_sync_brief();

create or replace function public.brief_submitted_to_launch()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.submitted_at is not null and (tg_op = 'INSERT' or old.submitted_at is null) then
    update public.launch_projects set brief_at = null where company_id = new.company_id and brief_at is null; -- declanșează launch_sync_brief
  end if;
  return new;
end $$;
drop trigger if exists brief_submitted_to_launch on public.briefs;
create trigger brief_submitted_to_launch after insert or update of submitted_at on public.briefs for each row execute function public.brief_submitted_to_launch();

-- proiectele existente fără brief: fără termen până la brief
update public.launch_projects set brief_at = null where brief_at is null;

-- ---------- lead-uri: status ----------
alter table public.leads add column if not exists status text not null default 'new' check (status in ('new','contacted','won','lost'));
alter table public.leads add column if not exists status_at timestamptz;
alter table public.leads add column if not exists note text check (char_length(note) <= 2000);

-- ---------- automatizare zilnică ----------
-- Întoarce emailurile de trimis și aplică modificările de stare (expirare comenzi, luna gratuită).
-- Emailurile de reamintire nu se repetă: se verifică email_log (company, template, period).
create or replace function public.daily_automation(p_secret text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  out jsonb := '[]'::jsonb;
  bank jsonb;
  r record;
  today date := (now() at time zone 'Europe/Bucharest')::date;
  nxt record;
begin
  if not public.cron_ok(p_secret) then raise exception 'forbidden'; end if;
  select value into bank from public.app_settings where key = 'bank';

  -- 1. comenzi neplătite (transfer bancar): reamintire ziua 2 și 5, expirare ziua 10
  for r in
    select s.id sub_id, s.created_at, c.id company_id, c.name, c.legal_rep, c.bank_reference, c.currency,
           coalesce(c.notify_email, c.billing_email)::text as "to", i.amount_net,
           (today - (s.created_at at time zone 'Europe/Bucharest')::date) as age
    from public.subscriptions s
    join public.companies c on c.id = s.company_id and not c.is_demo
    join public.installments i on i.subscription_id = s.id and i.number = 1 and i.status <> 'paid'
    where s.status = 'incomplete' and s.payment_mode = 'bank_transfer'
  loop
    continue when r."to" is null;
    if r.age >= 10 then
      update public.subscriptions set status = 'canceled', canceled_at = now(), cancel_reason = 'Comandă neplătită în 10 zile' where id = r.sub_id;
      out := out || jsonb_build_object('kind','order_expired','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,
        'reference',r.bank_reference,'period',(r.created_at at time zone 'Europe/Bucharest')::date);
    elsif r.age >= 5 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'order_reminder_2' and e.status = 'sent') then
      out := out || jsonb_build_object('kind','order_reminder_2','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,
        'reference',r.bank_reference,'amount',r.amount_net,'currency',r.currency,'iban',bank->>'iban_ron','days_left',10 - r.age,
        'period',(r.created_at at time zone 'Europe/Bucharest')::date);
    elsif r.age >= 2 and r.age < 5 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'order_reminder_1' and e.status = 'sent') then
      out := out || jsonb_build_object('kind','order_reminder_1','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,
        'reference',r.bank_reference,'amount',r.amount_net,'currency',r.currency,'iban',bank->>'iban_ron','days_left',10 - r.age,
        'period',(r.created_at at time zone 'Europe/Bucharest')::date);
    end if;
  end loop;

  -- 2. brief lipsă: la 48h și 96h după prima plată
  for r in
    select c.id company_id, c.name, c.legal_rep, coalesce(c.notify_email, c.billing_email)::text as "to", i.paid_at,
           extract(epoch from now() - i.paid_at) / 3600 as hours
    from public.installments i
    join public.companies c on c.id = i.company_id and not c.is_demo
    join public.subscriptions s on s.id = i.subscription_id and s.status in ('active','past_due')
    left join public.briefs b on b.company_id = c.id
    where i.number = 1 and i.status = 'paid' and i.paid_at is not null and b.submitted_at is null
  loop
    continue when r."to" is null;
    if r.hours >= 96 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'brief_reminder_2' and e.status = 'sent') then
      out := out || jsonb_build_object('kind','brief_reminder_2','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,'period',(r.paid_at at time zone 'Europe/Bucharest')::date);
    elsif r.hours >= 48 and r.hours < 96 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'brief_reminder_1' and e.status = 'sent') then
      out := out || jsonb_build_object('kind','brief_reminder_1','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,'period',(r.paid_at at time zone 'Europe/Bucharest')::date);
    end if;
  end loop;

  -- 3. lansare întârziată: următoarea rată devine 0 (o singură dată per proiect)
  for r in
    select l.id launch_id, l.company_id, l.due_at, c.name, c.legal_rep, coalesce(c.notify_email, c.billing_email)::text as "to", w.domain
    from public.launch_projects l
    join public.companies c on c.id = l.company_id and not c.is_demo
    join public.websites w on w.id = l.website_id
    where l.stage <> 'live' and not l.sla_paused and l.due_at is not null and l.due_at < today and l.free_month_applied_at is null
  loop
    select i.* into nxt from public.installments i
    where i.company_id = r.company_id and i.status in ('scheduled','overdue','failed') and i.number > 1
    order by i.number limit 1;
    continue when nxt.id is null;
    update public.installments set amount_discount = amount_plan + amount_addons where id = nxt.id;
    update public.launch_projects set free_month_applied_at = now() where id = r.launch_id;
    if r."to" is not null then
      out := out || jsonb_build_object('kind','free_month','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,
        'number',nxt.number,'due',nxt.due_date,'domain',r.domain,'period',r.due_at);
    end if;
  end loop;

  return out;
end $$;
revoke all on function public.daily_automation(text) from public;
grant execute on function public.daily_automation(text) to anon, authenticated;

alter table public.subscriptions add column if not exists cancel_reason text check (char_length(cancel_reason) <= 500);

-- ---------- cron zilnic: 07:30 ora României (05:30 UTC iarna) ----------
select cron.unschedule('daily-automation') where exists (select 1 from cron.job where jobname = 'daily-automation');
select cron.schedule('daily-automation', '30 5 * * *', $$
  select net.http_post(
    url := 'https://golunar.ro/api/cron/daily',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$$);
