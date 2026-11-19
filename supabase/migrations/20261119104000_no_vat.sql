-- LUNAR nu este plătitoare de TVA: sumele sunt finale.
alter table public.installments alter column vat_rate set default 0;
update public.installments set vat_rate = 0 where vat_rate <> 0;
update public.invoices v set total = i.amount_net from public.installments i where v.installment_id = i.id and v.total <> i.amount_net;
