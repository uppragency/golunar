-- Admin Lot 3: aprobare design, motiv de anulare + ofertă de retenție, etichete, jurnal de contact.

alter table public.launch_projects add column if not exists design_url text check (char_length(design_url) <= 500);
alter table public.launch_projects add column if not exists design_status text check (design_status in ('pending','approved','changes'));
alter table public.launch_projects add column if not exists design_feedback text check (char_length(design_feedback) <= 4000);
alter table public.launch_projects add column if not exists design_sent_at timestamptz;
alter table public.launch_projects add column if not exists design_decided_at timestamptz;

alter table public.subscriptions add column if not exists cancel_category text;
alter table public.subscriptions add column if not exists retention_accepted_at timestamptz;
alter table public.subscriptions add column if not exists retention_declined_at timestamptz;

alter table public.companies add column if not exists tags text[] not null default '{}';

create table if not exists public.contact_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  channel text not null check (channel in ('whatsapp','phone','email','broadcast')),
  subject text check (char_length(subject) <= 300),
  author_email text,
  created_at timestamptz not null default now()
);
create index if not exists contact_log_company on public.contact_log(company_id, created_at desc);
alter table public.contact_log enable row level security;
create policy contact_log_admin on public.contact_log for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select, insert, delete on public.contact_log to authenticated;

insert into public.app_settings(key, value) values ('retention', '{"enabled": true, "percent": 50}'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_owner_of(p_company uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m where m.company_id = p_company and m.user_id = (select auth.uid()) and m.role = 'owner');
$$;

-- client: aprobă designul sau cere ajustări
create or replace function public.portal_design_decide(p_company uuid, p_decision text, p_feedback text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_member(p_company) then raise exception 'forbidden'; end if;
  if p_decision not in ('approved','changes') then raise exception 'invalid'; end if;
  update public.launch_projects
     set design_status = p_decision, design_feedback = nullif(left(trim(coalesce(p_feedback, '')), 4000), ''), design_decided_at = now()
   where company_id = p_company and design_status = 'pending';
end $$;
revoke all on function public.portal_design_decide(uuid, text, text) from public, anon;
grant execute on function public.portal_design_decide(uuid, text, text) to authenticated;

-- client (owner): anulare cu motiv; abonamentul se oprește înainte de următoarea rată
create or replace function public.portal_cancel(p_company uuid, p_category text, p_detail text)
returns date language plpgsql security definer set search_path = '' as $$
declare s record; nxt date;
begin
  if not public.is_owner_of(p_company) then raise exception 'forbidden'; end if;
  if coalesce(trim(p_category), '') = '' then raise exception 'reason required'; end if;
  select * into s from public.subscriptions where company_id = p_company and status <> 'canceled' order by created_at desc limit 1;
  if s.id is null then raise exception 'no subscription'; end if;
  select min(due_date) into nxt from public.installments where subscription_id = s.id and status <> 'paid';
  update public.subscriptions
     set cancel_category = left(p_category, 80), cancel_reason = left(coalesce(nullif(trim(p_detail), ''), p_category), 500),
         cancel_at = coalesce(nxt, current_date)::timestamptz
   where id = s.id;
  return coalesce(nxt, current_date);
end $$;
revoke all on function public.portal_cancel(uuid, text, text) from public, anon;
grant execute on function public.portal_cancel(uuid, text, text) to authenticated;

-- client (owner): acceptă oferta de retenție (o singură dată per abonament)
create or replace function public.portal_retention_accept(p_company uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s record; i record; pct numeric; cfg jsonb;
begin
  if not public.is_owner_of(p_company) then raise exception 'forbidden'; end if;
  select value into cfg from public.app_settings where key = 'retention';
  if not coalesce((cfg->>'enabled')::boolean, false) then raise exception 'disabled'; end if;
  pct := least(100, greatest(1, coalesce((cfg->>'percent')::numeric, 50)));
  select * into s from public.subscriptions where company_id = p_company and status in ('active','past_due') order by created_at desc limit 1;
  if s.id is null or s.retention_accepted_at is not null then raise exception 'not eligible'; end if;
  select * into i from public.installments where subscription_id = s.id and status <> 'paid' and number > 1 order by number limit 1;
  if i.id is null then raise exception 'no installment'; end if;
  update public.installments set amount_discount = greatest(amount_discount, round((amount_plan + amount_addons) * pct / 100, 2)) where id = i.id;
  update public.subscriptions set retention_accepted_at = now() where id = s.id;
  return jsonb_build_object('number', i.number, 'percent', pct, 'due', i.due_date);
end $$;
revoke all on function public.portal_retention_accept(uuid) from public, anon;
grant execute on function public.portal_retention_accept(uuid) to authenticated;
