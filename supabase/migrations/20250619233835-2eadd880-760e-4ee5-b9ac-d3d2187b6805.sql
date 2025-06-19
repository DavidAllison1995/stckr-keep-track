
-- First, let's ensure your profile exists and is properly set as admin
INSERT INTO public.profiles (id, first_name, last_name, is_admin)
SELECT id, 'David', 'Allison', true
FROM auth.users 
WHERE email = 'davidallison1995@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
  is_admin = true,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);

-- Let's also verify the profile exists and check the admin status
SELECT u.email, p.first_name, p.last_name, p.is_admin 
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'davidallison1995@gmail.com';
