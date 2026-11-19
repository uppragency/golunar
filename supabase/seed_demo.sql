-- LUNAR · date demo pentru previzualizarea portalului și a admin-ului.
-- Toate firmele demo au is_demo = true. Ștergere completă:
--   delete from public.companies where is_demo;

create or replace function pg_temp.seed(
  p_name text, p_cui text, p_domain text, p_plan public.plan_code, p_cur public.currency_code,
  p_local boolean, p_langs int, p_mode public.payment_mode, p_paid int, p_failed boolean,
  p_start date, p_site public.website_status, p_day int default null, p_stage public.launch_stage default null,
  p_paused text default null
) returns uuid language plpgsql as $$
declare
  cid uuid; sid uuid; wid uuid; i int; plan_amt numeric; add_amt numeric := 0; st public.installment_status;
  plans jsonb := (select value from public.app_settings where key='plans');
  addons jsonb := (select value from public.app_settings where key='addons');
  k text := case when p_cur = 'EUR' then 'eur' else 'ron' end;
begin
  insert into public.companies(cui,name,reg_com,address,currency,is_demo,billing_email,notify_email,legal_rep,phone,bank,iban)
  values (p_cui,p_name,'J22/'||(1000+floor(random()*8000))::int||'/2019','Str. Exemplu 14, Iași',p_cur,true,
          'contabilitate@'||p_domain,'contact@'||p_domain,'Andreea Pop','+40 744 000 000','Banca Transilvania','RO49 BTRL 0000 0000 0000 0000')
  returning id into cid;

  plan_amt := (plans -> p_plan::text ->> k)::numeric;
  insert into public.subscriptions(company_id,plan,status,payment_mode,currency,billing_day,started_at)
  values (cid,p_plan, case when p_failed then 'past_due' when p_site in ('onboarding','building') and p_paid=0 then 'incomplete' else 'active' end::public.sub_status,
          p_mode,p_cur,least(28,extract(day from p_start)::int),p_start)
  returning id into sid;

  if p_local then
    insert into public.subscription_items(subscription_id,company_id,addon,quantity,unit_price) values (sid,cid,'local',1,(addons->'local'->>k)::numeric);
    add_amt := add_amt + (addons->'local'->>k)::numeric;
  end if;
  if p_langs > 0 then
    insert into public.subscription_items(subscription_id,company_id,addon,quantity,unit_price) values (sid,cid,'lang',p_langs,(addons->'lang'->>k)::numeric);
    add_amt := add_amt + p_langs * (addons->'lang'->>k)::numeric;
  end if;

  for i in 1..12 loop
    st := case when i <= p_paid then 'paid' when i = p_paid+1 and p_failed then 'overdue' else 'scheduled' end;
    insert into public.installments(subscription_id,company_id,number,due_date,amount_plan,amount_addons,currency,status,paid_at,method)
    values (sid,cid,i,(p_start + make_interval(months => i-1))::date,plan_amt,add_amt,p_cur,st,
            case when st='paid' then (p_start + make_interval(months => i-1))::timestamptz end,
            case when st='paid' then (case when p_mode='card' then 'Visa 4242' else 'Transfer' end) end);
    if st = 'paid' then
      insert into public.invoices(company_id,installment_id,smartbill_number,issued_at,period_label,total,currency,payment_label,spv_status)
      select cid, id, lpad((floor(random()*900000)+100000)::text,6,'0'), due_date, to_char(due_date,'TMMonth YYYY'),
             amount_net, p_cur, method, 'validated'
      from public.installments where subscription_id = sid and number = i;
    end if;
  end loop;

  if p_failed then
    insert into public.payment_attempts(company_id,method_label,succeeded,failure_reason,attempted_at)
    values (cid,'Visa 4242',false,'card_declined',now() - interval '2 days');
  end if;
  insert into public.payment_attempts(company_id,method_label,succeeded,attempted_at)
    select cid, coalesce(method,'Visa 4242'), true, paid_at from public.installments where subscription_id=sid and status='paid';

  if p_mode = 'card' then
    insert into public.payment_methods(company_id,stripe_payment_method_id,brand,last4,exp_month,exp_year,is_default)
    values (cid,'pm_demo_'||replace(cid::text,'-',''),'visa','4242',8,2028,true);
  end if;

  insert into public.websites(company_id,domain,registrar,domain_expires_at,status,launched_at,email_provider,dns_auth_ok,search_console,business_profile,uptime_90d,cwv_ok,last_backup_at,preview_title,preview_subtitle)
  values (cid,p_domain,'ROTLD',(p_start + interval '1 year')::date,p_site,
          case when p_site in ('live','transferred') then (p_start + interval '14 days')::date end,
          'Google Workspace',p_site='live',p_site='live',p_local,99.98,true,date_trunc('day',now())+interval '3 hours',
          'Zâmbetul tău,<br>tratat cu grijă.', 'Iași')
  returning id into wid;

  if p_site in ('live','transferred') then
    insert into public.website_metrics(website_id,company_id,month,visitors,form_leads,avg_position,maps_calls)
    select wid,cid,(date_trunc('month',now()) - make_interval(months => g))::date,
           greatest(200,(3412*(12-g)/12.0 + random()*120)::int),(47*(12-g)/12.0)::int,round((8.4+g*0.25)::numeric,1),(63*(12-g)/12.0)::int
    from generate_series(0,11) g;
  end if;

  if p_day is not null then
    insert into public.launch_projects(website_id,company_id,day_counter,stage,sla_paused,paused_reason,started_at,due_at)
    values (wid,cid,p_day,p_stage,p_paused is not null,p_paused,current_date - p_day,current_date + (10-p_day));
  end if;

  insert into public.ownership(website_id,company_id,eligible_at,transferred_at)
  values (wid,cid,(p_start + interval '11 months')::date, case when p_paid >= 12 then (p_start + interval '11 months')::date end);

  insert into public.documents(company_id,kind,title,pages,signed_at,locked_until_installment) values
    (cid,'contract','Contract abonament '||(select bank_reference from public.companies where id=cid),9,p_start,null),
    (cid,'annex','Anexa 1 · Plan '||(plans->p_plan::text->>'name')||' și opțiuni',2,p_start,null),
    (cid,'dpa','Acord de prelucrare date (GDPR)',4,p_start,null),
    (cid,'brief','Brief și design aprobat',12,p_start + 8,null),
    (cid,'handover','Proces-verbal transfer proprietate',2,null,12),
    (cid,'source','Cod-sursă și fișiere',null,null,12);
  return cid;
end $$;

do $$
declare aurora uuid;
begin
  aurora := pg_temp.seed('Clinica Aurora SRL','RO41234567','clinica-aurora.ro','growth','RON',true,0,'card',7,false,(date_trunc('month',now()) - interval '7 months')::date + 21,'live');
  perform pg_temp.seed('Bistro Tei SRL','RO40111222','bistrotei.ro','essential','RON',false,0,'card',4,true,(date_trunc('month',now()) - interval '4 months')::date + 20,'live');
  perform pg_temp.seed('Forma Fitness SRL','RO39222333','formafitness.ro','partner','EUR',false,0,'bank_transfer',3,false,(date_trunc('month',now()) - interval '3 months')::date + 17,'live');
  perform pg_temp.seed('Cabinet Avocat Ionescu','RO38333444','ionescu-avocat.ro','essential','RON',false,0,'bank_transfer',8,false,(date_trunc('month',now()) - interval '8 months')::date + 16,'live');
  perform pg_temp.seed('Mira Flori SRL','RO37444555','miraflori.ro','growth','RON',true,0,'bank_transfer',5,false,(date_trunc('month',now()) - interval '5 months')::date + 14,'live');
  perform pg_temp.seed('Vila Brădet','RO36555666','vilabradet.ro','partner','RON',false,1,'card',0,false,current_date - 12,'building',9,'qa','Așteaptă aprobare texte de la client');
  perform pg_temp.seed('Nordic Dental Studio','RO35666777','nordicdental.ro','growth','RON',false,0,'card',1,false,current_date - 9,'building',7,'build');
  perform pg_temp.seed('Atelier Lemn Viu','RO34777888','lemnviu.ro','essential','RON',false,0,'card',1,false,current_date - 5,'building',4,'design');
  perform pg_temp.seed('Optica Lumen','RO33888999','opticalumen.ro','essential','RON',false,0,'card',1,false,current_date - 1,'onboarding',1,'brief');
  perform pg_temp.seed('Arhitect Studio Nord','RO32999000','studionord.ro','growth','RON',false,0,'card',12,false,(date_trunc('month',now()) - interval '12 months')::date + 1,'transferred');
  perform pg_temp.seed('Pet Care Vet','RO31000111','petcarevet.ro','essential','RON',true,0,'card',12,false,(date_trunc('month',now()) - interval '12 months')::date + 8,'live');

  insert into public.requests(company_id,type,title,status,month_bucket,created_at,delivered_at) values
    (aurora,'improvement','Pagină nouă: Implant dentar all-on-4','in_progress',date_trunc('month',now())::date,now() - interval '7 days',null),
    (aurora,'improvement','Formular programare cu alegere medic','delivered',(date_trunc('month',now()) - interval '1 month')::date,now() - interval '42 days',current_date - 29),
    (aurora,'improvement','Actualizare tarife Q4','delivered',(date_trunc('month',now()) - interval '1 month')::date,now() - interval '47 days',current_date - 40),
    (aurora,'billing','Factura din septembrie, CUI greșit','resolved',(date_trunc('month',now()) - interval '2 months')::date,now() - interval '65 days',current_date - 63);

  insert into public.bank_transfers(received_at,payer_name,reference,amount,currency,match_status) values
    (current_date - 1,'FORMA FITNESS SRL',null,471.90,'EUR','unmatched');
  insert into public.bank_transfers(received_at,payer_name,reference,amount,currency,match_status,matched_installment_id,confirmed_at)
    select current_date - 2,'CABINET AVOCAT IONESCU',c.bank_reference,i.amount_net,'RON','auto',i.id,now()
    from public.companies c join public.installments i on i.company_id=c.id and i.number=8 where c.cui='RO38333444';
end $$;
