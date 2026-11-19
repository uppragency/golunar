create policy leads_admin_update on public.leads for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (status, status_at, note) on public.leads to authenticated;
