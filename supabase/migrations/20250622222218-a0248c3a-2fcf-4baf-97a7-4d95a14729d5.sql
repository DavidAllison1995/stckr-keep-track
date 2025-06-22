
-- Check if there are existing DELETE policies on notifications table
-- If not, create a policy that allows users to delete their own notifications

-- First, ensure RLS is enabled (it should already be from the migration)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create the DELETE policy for notifications
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Also ensure we have proper SELECT and UPDATE policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);
