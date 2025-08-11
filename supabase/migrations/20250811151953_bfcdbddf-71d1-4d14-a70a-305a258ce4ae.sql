begin;
ALTER FUNCTION public.handle_new_user_subscription()
  SET search_path = '';
commit;