-- Admin Lot 2: notițe interne, checklist de lansare, verificări tehnice, plăți restante automate.

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  author uuid references auth.users(id) on delete set null,
  author_email text,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists client_notes_company on public.client_notes(company_id, created_at desc);
alter table public.client_notes enable row level security;
create policy client_notes_admin on public.client_notes for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select, insert, update, delete on public.client_notes to authenticated;

alter table public.launch_projects add column if not exists checklist jsonb not null default '{}'::jsonb;

alter table public.websites add column if not exists psi_mobile smallint;
alter table public.websites add column if not exists psi_desktop smallint;
alter table public.websites add column if not exists ssl_expires_at date;
alter table public.websites add column if not exists http_status smallint;
alter table public.websites add column if not exists broken_links jsonb;
alter table public.websites add column if not exists tech_checked_at timestamptz;

-- discount: ofertă personalizată pentru un lead
alter table public.discount_codes add column if not exists lead_id uuid references public.leads(id) on delete set null;

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
    elsif r.age >= 5 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'order_reminder_2' and e.status = 'sent' and e.period = (r.created_at at time zone 'Europe/Bucharest')::date) then
      out := out || jsonb_build_object('kind','order_reminder_2','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,
        'reference',r.bank_reference,'amount',r.amount_net,'currency',r.currency,'iban',bank->>'iban_ron','days_left',10 - r.age,
        'period',(r.created_at at time zone 'Europe/Bucharest')::date);
    elsif r.age >= 2 and r.age < 5 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'order_reminder_1' and e.status = 'sent' and e.period = (r.created_at at time zone 'Europe/Bucharest')::date) then
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

  -- 4. rate lunare (transfer bancar): rata de 0 lei (lună gratuită) se închide singură; restul devin restante cu reamintiri în ziua 1, 5, 10
  update public.installments i set status = 'paid', paid_at = now(), method = 'Gratuit (garanție)'
  where i.status in ('scheduled','overdue') and i.amount_net = 0 and i.due_date <= today;

  for r in
    select i.id, i.number, i.due_date, i.amount_net, i.currency, i.subscription_id, c.id company_id, c.name, c.legal_rep, c.bank_reference,
           coalesce(c.notify_email, c.billing_email)::text as "to", (today - i.due_date) as late
    from public.installments i
    join public.subscriptions s on s.id = i.subscription_id and s.payment_mode = 'bank_transfer' and s.status in ('active','past_due')
    join public.companies c on c.id = i.company_id and not c.is_demo
    where i.status in ('scheduled','overdue') and i.number > 1 and i.amount_net > 0 and i.due_date < today
  loop
    update public.installments set status = 'overdue' where id = r.id and status = 'scheduled';
    update public.subscriptions set status = 'past_due' where id = r.subscription_id and status = 'active';
    continue when r."to" is null;
    if r.late >= 10 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'overdue_10' and e.period = r.due_date and e.status = 'sent') then
      out := out || jsonb_build_object('kind','overdue_10','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,'number',r.number,'due',r.due_date,'amount',r.amount_net,'currency',r.currency,'reference',r.bank_reference,'iban',bank->>'iban_ron','period',r.due_date);
    elsif r.late >= 5 and r.late < 10 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'overdue_5' and e.period = r.due_date and e.status = 'sent') then
      out := out || jsonb_build_object('kind','overdue_5','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,'number',r.number,'due',r.due_date,'amount',r.amount_net,'currency',r.currency,'reference',r.bank_reference,'iban',bank->>'iban_ron','period',r.due_date);
    elsif r.late >= 1 and r.late < 5 and not exists (select 1 from public.email_log e where e.company_id = r.company_id and e.template = 'overdue_1' and e.period = r.due_date and e.status = 'sent') then
      out := out || jsonb_build_object('kind','overdue_1','company_id',r.company_id,'to',r."to",'name',r.name,'rep',r.legal_rep,'number',r.number,'due',r.due_date,'amount',r.amount_net,'currency',r.currency,'reference',r.bank_reference,'iban',bank->>'iban_ron','period',r.due_date);
    end if;
  end loop;

  return out;
end $$;
revoke all on function public.daily_automation(text) from public;
grant execute on function public.daily_automation(text) to anon, authenticated;
