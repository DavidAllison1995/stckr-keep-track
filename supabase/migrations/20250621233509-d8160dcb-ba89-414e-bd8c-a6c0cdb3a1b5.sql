
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_due_soon', 'task_overdue', 'warranty_expiring', 'task_completed', 'task_created')),
  title TEXT NOT NULL,
  message TEXT,
  task_id UUID REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Update user_settings table to include notification preferences
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS notification_task_due_soon BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_task_overdue BOOLEAN DEFAULT true, 
ADD COLUMN IF NOT EXISTS notification_warranty_expiring BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_task_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_task_created BOOLEAN DEFAULT false;
