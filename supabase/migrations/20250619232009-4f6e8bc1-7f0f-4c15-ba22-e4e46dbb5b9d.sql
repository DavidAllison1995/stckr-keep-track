
-- First, let's drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Create a security definer function to check if user can access profile
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() = profile_id OR 
         EXISTS (
           SELECT 1 FROM auth.users 
           WHERE id = auth.uid() AND email = 'davidallison1995@gmail.com'
         );
$$;

-- Create simple policies using the security definer function
CREATE POLICY "Users can view accessible profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.can_access_profile(id));

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
