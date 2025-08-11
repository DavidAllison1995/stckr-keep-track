begin;

-- 1) Fix function with mutable search_path
ALTER FUNCTION public.handle_new_user_subscription()
  SET search_path = '';

-- 2) Move extension out of public to extensions schema (recommended by linter)
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_net SET SCHEMA extensions;

commit;