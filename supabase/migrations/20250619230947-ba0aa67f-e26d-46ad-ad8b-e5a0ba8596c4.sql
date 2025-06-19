
-- Make davidallison1995@gmail.com user an admin
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'davidallison1995@gmail.com'
);
