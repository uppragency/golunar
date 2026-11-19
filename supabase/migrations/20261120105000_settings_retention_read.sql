drop policy if exists settings_read on public.app_settings;
create policy settings_read on public.app_settings for select
  using (key in ('plans','addons','eur_ron_rate','bank','retention') or (select public.is_admin()));
