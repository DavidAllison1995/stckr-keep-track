
-- Add new notification types to the notifications table check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('task_due_soon', 'task_overdue', 'warranty_expiring', 'task_completed', 'task_created', 'item_created', 'task_due_today', 'task_updated', 'recurring_task_reminder'));

-- Add new user preference columns to user_settings table for the new notification types
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS notification_task_due_today BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_task_updated BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_recurring_task_reminder BOOLEAN DEFAULT true;

-- Create index for better performance on notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_type_user_created ON public.notifications(type, user_id, created_at DESC);

-- Create index on maintenance_tasks for efficient querying by due dates
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_date_status ON public.maintenance_tasks(date, status, user_id);
