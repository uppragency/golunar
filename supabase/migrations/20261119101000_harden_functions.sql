alter extension citext set schema extensions;
revoke execute on function public.accept_invites() from public, anon, authenticated;
revoke execute on function public.enforce_improvement_quota() from public, anon, authenticated;
revoke execute on function public.is_member(uuid) from public, anon;
revoke execute on function public.has_company_role(uuid, public.member_role[]) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.has_company_role(uuid, public.member_role[]) to authenticated;
