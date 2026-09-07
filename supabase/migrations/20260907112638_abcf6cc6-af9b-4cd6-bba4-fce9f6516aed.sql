revoke all on function public.place_bid(uuid, uuid, bigint) from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.update_updated_at_column() from public;
revoke all on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;